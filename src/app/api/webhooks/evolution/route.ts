import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
// Removed fs/path imports to avoid Vercel filesystem errors

function debugLog(msg: string) {
  console.log(`[WH_DEBUG] ${msg}`);
}

export async function POST(req: NextRequest) {
  const supabase = await createAdminClient();
  try {
    const body = await req.json();
    const eventType = (body.event || body.eventType || 'unknown').toLowerCase();
    
    // Log basic info for EVERY hit to help debugging delivery
    let instanceName = 'unknown';
    if (typeof body.instance === 'string') {
      instanceName = body.instance;
    } else if (typeof body.instance === 'object') {
      instanceName = body.instance.instanceName || body.instance.name || 'unknown';
    } else if (body.instanceName) {
      instanceName = body.instanceName;
    }

    debugLog(`[HIT WEBHOOK] ${new Date().toISOString()}`);
    debugLog(`[EVENT] ${eventType}`);
    debugLog(`[INSTANCE RECEIVED] ${instanceName}`);
    // Log first 1000 chars of body to see the structure of real inbound messages
    debugLog(`[RAW EVENT] ${JSON.stringify(body).slice(0, 1000)}`);

    // Flexible filtering: allow upsert and update for debugging
    if (!eventType.includes('messages.upsert') && !eventType.includes('messages.update')) {
      debugLog(`[SKIP EVENT] ${eventType}`);
      return NextResponse.json({ success: true, message: `Skipping event: ${eventType}` });
    }

    debugLog(`--- WEBHOOK: ${eventType} | Instance: ${instanceName} ---`);

    // 2. Identify Tenant (Multi-tenant Mapping)
    const { data: allIntegrations, error: intError } = await supabase
      .from('integrations')
      .select('tenant_id, credentials')
      .eq('provider', 'whatsapp')
      .eq('is_active', true);

    if (intError) {
      debugLog(`[ERROR] Integrations lookup failed: ${intError.message}`);
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }

    const matchedIntegration = allIntegrations?.find((i: any) => {
      const creds = i.credentials;
      if (!creds) return false;
      const savedInstance = (typeof creds === 'object' ? (creds.instanceName || creds.instance) : String(creds)) || '';
      return savedInstance.toLowerCase() === instanceName.toLowerCase();
    });

    let tenantId = matchedIntegration?.tenant_id;

    if (!tenantId) {
      // Fallback if only ONE integration exists
      if (allIntegrations?.length === 1) {
        tenantId = allIntegrations[0].tenant_id;
        debugLog(`[MATCH] Falling back to only available tenantId: ${tenantId}`);
      } else {
        debugLog(`[ERROR] Tenant not identified for instance: ${instanceName}`);
        return NextResponse.json({ error: 'Tenant not identified' }, { status: 404 });
      }
    }

    if (!tenantId) {
      debugLog(`No active integration found for instance: ${instanceName}`);
      return NextResponse.json({ success: true, warning: 'Tenant not identified' });
    }

    // 3. Extract Messages
    const data = body.data;
    if (!data) return NextResponse.json({ success: true, message: 'No data in payload' });

    // In Evolution v2 messages.upsert, data is the message object or contains one
    const rawMessages = Array.isArray(data) ? data : (data.messages || [data]);

    for (const msg of rawMessages) {
      if (!msg.key || !msg.key.remoteJid) {
        debugLog(`[SKIP] Missing key or remoteJid in message payload`);
        continue;
      }

      const remoteJid = msg.key.remoteJid;
      if (remoteJid.includes('@g.us')) {
        debugLog(`[SKIP] Group message: ${remoteJid}`);
        continue;
      }

      const fromMe = msg.key.fromMe || false;
      const cleanedPhone = remoteJid.split('@')[0].replace(/\D/g, '');
      const evolutionMsgId = msg.key.id;
      const timestamp = msg.messageTimestamp 
        ? new Date(msg.messageTimestamp * 1000).toISOString() 
        : new Date().toISOString();

      // Message Content Extraction
      const content = extractMessageContent(msg);
      
      if (!content.text && !content.mediaUrl) {
         // Maybe it's a direct 'text' field in v2
         if (msg.text) content.text = msg.text;
         else if (msg.content) content.text = msg.content;
      }

      // NO-CONTINUE POLICY: If parsing failed, use a fallback instead of skipping
      if (!content.text && !content.mediaUrl) {
        debugLog(`[FALLBACK] Parsing failed for: ${evolutionMsgId}. Saving raw JSON.`);
        if (typeof msg.message === 'object') {
          content.text = `[CONTEÚDO NÃO PARSEADO]: ${JSON.stringify(msg.message).slice(0, 500)}`;
        } else {
          content.text = '[MENSAGEM NÃO SUPORTADA]';
        }
      }

      debugLog(`[RAW_MSG_FULL] ${JSON.stringify(msg).slice(0, 2000)}`);

      debugLog(`[PROCESS] ${fromMe ? 'OUTBOUND' : 'INBOUND'} | Phone: ${cleanedPhone} | Text: "${content.text?.substring(0, 30)}..."`);

      // 4. Find or Create Lead
      let leadId = null;
      // Precision match: try exact match first, then suffix
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('tenant_id', tenantId)
        .or(`phone.eq.${cleanedPhone},phone.ilike.%${cleanedPhone.slice(-8)}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingLead) {
        leadId = existingLead.id;
      } else {
        // Create new lead if inbound
        if (!fromMe) {
          debugLog(`Creating new lead for incoming message: ${cleanedPhone}`);
          const { data: newLead, error: createLeadErr } = await supabase
            .from('leads')
            .insert({
              tenant_id: tenantId,
              name: msg.pushName || `WhatsApp (${cleanedPhone})`,
              phone: cleanedPhone,
              status: 'Novo Lead',
              origin: 'WhatsApp'
            })
            .select('id')
            .single();
          
          if (createLeadErr) {
            debugLog(`[ERROR] Failed to create lead for ${cleanedPhone}: ${createLeadErr.message}`);
            continue;
          }
          leadId = newLead.id;
        } else {
          debugLog(`[SKIP] Outbound message sync for unknown lead: ${cleanedPhone}`);
          continue;
        }
      }

      // 5. Upsert Conversation
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .upsert({
          tenant_id: tenantId,
          lead_id: leadId,
          last_message_content: content.text?.substring(0, 200) || '[Mídia]',
          last_message_at: timestamp,
          updated_at: new Date().toISOString()
        }, { onConflict: 'tenant_id,lead_id' })
        .select('id')
        .single();

      if (convErr || !conv) {
        debugLog(`[ERROR] Failed to upsert conversation for lead ${leadId}: ${convErr?.message}`);
        continue;
      }

      // 5.5 Process Inbound Media (Base64 to Supabase Storage)
      debugLog(`[MEDIA CHECK] msgId: ${evolutionMsgId} | hasBase64: ${!!content.base64} | type: ${content.mediaType} | fromMe: ${fromMe}`);
      if (content.base64 && !fromMe) {
        try {
          debugLog(`[MEDIA] Processing inbound base64 media for ${evolutionMsgId}`);
          const buffer = Buffer.from(content.base64, 'base64');
          const ext = content.mediaType === 'image' ? 'jpg' : 
                      content.mediaType === 'video' ? 'mp4' : 
                      content.mediaType === 'audio' ? 'ogg' : 
                      (content.text?.split('.').pop() || 'pdf');
                      
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
          const filePath = `${tenantId}/${conv.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('chat-media')
            .upload(filePath, buffer, { 
              contentType: content.mediaType === 'image' ? 'image/jpeg' : 
                           content.mediaType === 'video' ? 'video/mp4' :
                           content.mediaType === 'audio' ? 'audio/ogg' : 'application/pdf',
              upsert: true 
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('chat-media')
              .getPublicUrl(filePath);
            content.mediaUrl = publicUrl;
            debugLog(`[MEDIA] Success! Replacement URL: ${content.mediaUrl}`);
          } else {
            debugLog(`[MEDIA ERROR] Supabase Upload: ${uploadError.message}`);
          }
        } catch (err: any) {
          debugLog(`[MEDIA ERROR] Base64 Parse: ${err.message}`);
        }
      }

      // 6. Save Message & Track Result
      const { data: finalMsg, error: msgErr } = await supabase
        .from('messages')
        .upsert({
          tenant_id: tenantId,
          conversation_id: conv.id,
          direction: fromMe ? 'outbound' : 'inbound',
          content: content.text || '',
          status: 'delivered',
          evolution_message_id: evolutionMsgId,
          media_url: content.mediaUrl,
          media_type: content.mediaType,
          created_at: timestamp
        }, { onConflict: 'evolution_message_id' })
        .select()
        .single();

      if (msgErr) {
        debugLog(`[ERROR] Message persistence failed: ${msgErr.message}`);
      } else {
        debugLog(`[SUCCESS] Message ${finalMsg.id} (${fromMe ? 'OUT' : 'IN'}) saved/updated correctly.`);
        
        // 7. Increment Unread Count (only for Inbound)
        if (!fromMe) {
          try {
            await supabase.rpc('increment_unread_count', { conv_id: conv.id });
          } catch (rpcErr: any) {
            debugLog(`[ERROR] RPC increment failed: ${rpcErr.message}`);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    debugLog(`CRITICAL WEBHOOK ERROR: ${err.message}`);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Helper for Robust Message Extraction
function extractMessageContent(msg: any) {
  const m = msg.message || {};
  let text = '';
  let mediaUrl = null;
  let mediaType: 'image' | 'video' | 'audio' | 'document' | null = null;
  let base64 = msg.base64 || null;

  // Baileys / Evolution v2 keys
  const msgBody = m.ephemeralMessage?.message || m.viewOnceMessage?.message || m.viewOnceMessageV2?.message || m;
  
  if (msgBody.conversation) {
    text = msgBody.conversation;
  } else if (msgBody.extendedTextMessage?.text) {
    text = msgBody.extendedTextMessage.text;
  } else if (msgBody.text) {
    text = typeof msgBody.text === 'object' ? (msgBody.text.text || '') : msgBody.text;
  } else if (msgBody.imageMessage) {
    text = msgBody.imageMessage.caption || '';
    mediaUrl = msgBody.imageMessage.url || null;
    mediaType = 'image';
    if (!base64 && msgBody.imageMessage.base64) base64 = msgBody.imageMessage.base64;
  } else if (msgBody.videoMessage) {
    text = msgBody.videoMessage.caption || '';
    mediaUrl = msgBody.videoMessage.url || null;
    mediaType = 'video';
    if (!base64 && msgBody.videoMessage.base64) base64 = msgBody.videoMessage.base64;
  } else if (msgBody.audioMessage) {
    text = '';
    mediaUrl = msgBody.audioMessage.url || null;
    mediaType = 'audio';
    if (!base64 && msgBody.audioMessage.base64) base64 = msgBody.audioMessage.base64;
  } else if (msgBody.documentMessage) {
    text = msgBody.documentMessage.fileName || msgBody.documentMessage.caption || '';
    mediaUrl = msgBody.documentMessage.url || null;
    mediaType = 'document';
    if (!base64 && msgBody.documentMessage.base64) base64 = msgBody.documentMessage.base64;
  } else if (msgBody.buttonsResponseMessage) {
    text = msgBody.buttonsResponseMessage.selectedDisplayText || msgBody.buttonsResponseMessage.selectedButtonId;
  } else if (msgBody.templateButtonReplyMessage) {
    text = msgBody.templateButtonReplyMessage.selectedDisplayText || msgBody.templateButtonReplyMessage.selectedId;
  } else if (msgBody.listResponseMessage) {
    text = msgBody.listResponseMessage.title || msgBody.listResponseMessage.singleSelectReply?.selectedRowId;
  } else if (typeof msgBody.text === 'string') {
    text = msgBody.text;
  }

  return { text, mediaUrl, mediaType, base64 };
}
