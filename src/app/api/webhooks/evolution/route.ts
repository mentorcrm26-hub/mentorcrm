/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

/**
 * 🔒 CORE SYSTEM LOCK - DO NOT MODIFY 🔒
 * 
 * Este arquivo foi VALIDADO EM PRODUÇÃO no dia 20/03/2026.
 * O Webhook de recebimento da Evolution API está perfeitamente funcional para Textos e Mídias (Base64 -> Supabase).
 * A criação de leads orgânicos e a atribuição de Tenant foi estabilizada. Evite alterações estruturais.
 */
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

    // Flexible filtering: allow upsert, update, and delete
    if (!eventType.includes('upsert') && !eventType.includes('update') && !eventType.includes('delete')) {
      debugLog(`[SKIP EVENT] ${eventType}`);
      return NextResponse.json({ success: true, message: `Skipping event: ${eventType}` });
    }

    if (eventType.includes('delete')) {
      debugLog(`[MESSAGES-DELETE EVENT] Processing delete webhook...`);
      const delData = Array.isArray(body.data) ? body.data : [body.data];
      
      for (const delItem of delData) {
        const targetId = delItem?.id || delItem?.key?.id || delItem?.messageId;
        if (targetId) {
          debugLog(`[DELETE EVENT] Marking message deleted: ${targetId}`);
          await supabase.from('messages').update({ is_deleted: true }).eq('evolution_message_id', targetId);
        }
      }
      return NextResponse.json({ success: true });
    }

    console.log(`[EV_WEBHOOK] HIT | Event: ${eventType} | Instance: ${instanceName}`);

    // 2. Identify Tenant (Multi-tenant Mapping)
    const { data: allIntegrations, error: intError } = await supabase
      .from('integrations')
      .select('tenant_id, credentials')
      .eq('provider', 'whatsapp')
      .eq('is_active', true);

    if (intError) {
      console.error(`[EV_ERROR] Integrations lookup: ${intError.message}`);
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }

    const matchedIntegration = allIntegrations?.find((i: any) => {
      const creds = i.credentials;
      if (!creds) return false;
      const savedInstance = (typeof creds === 'object' ? (creds.instanceName || creds.instance) : String(creds)) || '';
      return savedInstance.toLowerCase() === instanceName.toLowerCase();
    });

    console.log(`[EV_MATCH] instance=${instanceName} | count=${allIntegrations?.length} | matched=${!!matchedIntegration}`);

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

      // Detect Message Revocation (Delete for everyone)
      if (eventType.includes('update') && msg.update) {
        if (msg.update.status === 'REVOKED' || msg.update.status === 4 || msg.update.status === 'DELETED') {
          debugLog(`[REVOKE UPDATE] Marking message deleted: ${evolutionMsgId}`);
          await supabase.from('messages').update({ is_deleted: true }).eq('evolution_message_id', evolutionMsgId).eq('tenant_id', tenantId);
        }
        continue; // It's just a status update, skip creating a new message
      }

      const protocolMsg = msg.message?.protocolMessage || msg.message?.ephemeralMessage?.message?.protocolMessage || msg.message?.viewOnceMessage?.message?.protocolMessage;
      const isRevoke = protocolMsg && (protocolMsg.type === 0 || protocolMsg.type === 'REVOKE');
      if (isRevoke && protocolMsg.key?.id) {
        debugLog(`[REVOKE] Marking message deleted: ${protocolMsg.key.id}`);
        await supabase.from('messages').update({ is_deleted: true }).eq('evolution_message_id', protocolMsg.key.id).eq('tenant_id', tenantId);
        continue; // Skip creating a new message for the revoke protocol message
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
      const hasBase64 = !!(content.base64 || msg.base64 || (msg.message?.imageMessage?.base64) || (msg.message?.documentMessage?.base64) || (msg.message?.videoMessage?.base64) || (msg.message?.audioMessage?.base64));
      
      // ACTIVE FETCH: Fetch credentials from Env Vars or DB
      const credentials = matchedIntegration?.credentials as any;
      const apiUrl = (process.env.EVOLUTION_API_URL || credentials?.apiUrl || credentials?.url || '')
        .replace(/\/manager\/?$/, '')
        .replace(/\/$/, '');
      const apikey = process.env.EVOLUTION_API_KEY || credentials?.apikey || credentials?.token;

      console.log(`[EV_MEDIA] msgId=${evolutionMsgId} | type=${content.mediaType} | hasB64=${hasBase64} | apiUrl=${!!apiUrl} | apikey=${!!apikey}`);

      if (!hasBase64 && content.mediaType && !fromMe && apiUrl && apikey) {
        try {
          debugLog(`[MEDIA] Attempting active fetch for ${evolutionMsgId} from Evolution API...`);
          const fetchRes = await fetch(`${apiUrl}/chat/getBase64FromMediaMessage/${instanceName}`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'apikey': apikey
            },
            body: JSON.stringify({ 
              message: { 
                key: { 
                  id: evolutionMsgId,
                  remoteJid: remoteJid,
                  fromMe: fromMe
                } 
              } 
            })
          });
          
          if (fetchRes.ok) {
            const fetchData = await fetchRes.json();
            if (fetchData.base64) {
              content.base64 = fetchData.base64;
              debugLog(`[MEDIA] Active fetch SUCCESS for ${evolutionMsgId}`);
            }
          } else {
            debugLog(`[MEDIA] Active fetch failed for ${evolutionMsgId}: ${fetchRes.status}`);
            content.text = `[ERROR FETCH]: ${fetchRes.status}`;
          }
        } catch (fetchErr: any) {
          debugLog(`[MEDIA] Active fetch error: ${fetchErr.message}`);
          content.text = `[ERROR EXCEPTION]: ${fetchErr.message}`;
        }
      }

      debugLog(`[MEDIA CHECK] msgId: ${evolutionMsgId} | hasBase64: ${!!content.base64} | type: ${content.mediaType} | fromMe: ${fromMe}`);
      
      if (!content.base64 && hasBase64) {
        content.base64 = msg.base64 || msg.message?.imageMessage?.base64 || msg.message?.documentMessage?.base64 || msg.message?.videoMessage?.base64 || msg.message?.audioMessage?.base64;
      }

      if (content.base64 && !fromMe) {
        try {
          debugLog(`[MEDIA] Processing inbound base64 media for ${evolutionMsgId}`);
          const buffer = Buffer.from(content.base64, 'base64');
          const ext = content.mimetype.split('/').pop()?.split(';')[0] || 
                      (content.mediaType === 'image' ? 'jpg' : 
                       content.mediaType === 'video' ? 'mp4' : 
                       content.mediaType === 'audio' ? 'ogg' : 'pdf');
                      
          const rawFileName = content.fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
          // Sanitize filename to avoid Supabase storage upload errors with special characters
          const sanitizedFileName = rawFileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const filePath = `${tenantId}/${conv.id}/${sanitizedFileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('chat-media')
            .upload(filePath, buffer, { 
              contentType: content.mimetype || 'application/octet-stream',
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
  let mimetype = '';
  let fileName = '';

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
    mimetype = msgBody.imageMessage.mimetype || 'image/jpeg';
    if (!base64 && msgBody.imageMessage.base64) base64 = msgBody.imageMessage.base64;
  } else if (msgBody.videoMessage) {
    text = msgBody.videoMessage.caption || '';
    mediaUrl = msgBody.videoMessage.url || null;
    mediaType = 'video';
    mimetype = msgBody.videoMessage.mimetype || 'video/mp4';
    if (!base64 && msgBody.videoMessage.base64) base64 = msgBody.videoMessage.base64;
  } else if (msgBody.audioMessage) {
    text = '';
    mediaUrl = msgBody.audioMessage.url || null;
    mediaType = 'audio';
    mimetype = msgBody.audioMessage.mimetype || 'audio/ogg';
    if (!base64 && msgBody.audioMessage.base64) base64 = msgBody.audioMessage.base64;
  } else if (msgBody.documentMessage) {
    text = msgBody.documentMessage.fileName || msgBody.documentMessage.caption || '';
    fileName = msgBody.documentMessage.fileName || '';
    mediaUrl = msgBody.documentMessage.url || null;
    mediaType = 'document';
    mimetype = msgBody.documentMessage.mimetype || 'application/pdf';
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

  return { text, mediaUrl, mediaType, base64, mimetype, fileName };
}
