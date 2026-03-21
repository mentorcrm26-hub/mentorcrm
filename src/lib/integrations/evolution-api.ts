/**
 * 🔒 CORE SYSTEM LOCK - DO NOT MODIFY 🔒
 * 
 * Este arquivo foi VALIDADO EM PRODUÇÃO no dia 20/03/2026.
 * As rotinas de comunicação (Envio e Recebimento de Texto/Mídia) com a Evolution API estão estabilizadas.
 * Evite alterações que não sejam extremamente críticas para não quebrar a sincronização bidirecional.
 */

export const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL?.replace(/\/manager$/, '');
export const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

export interface WhatsAppAccount {
  accountName: string;
  number?: string;
  status: 'open' | 'close' | 'connecting';
  qrcode?: string;
}

export async function createInstance(name: string, number: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    throw new Error('Configuração de WhatsApp incompleta (URL ou Key ausente)');
  }

  const url = `${EVOLUTION_API_URL}/instance/create`;
  console.log(`[WA-API] Calling: ${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY,
    },
    body: JSON.stringify({
      instanceName: name,
      token: Math.random().toString(36).substring(7),
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.message || errorData.error || 'Erro desconhecido';
    console.error(`[WA-API] Error ${response.status}:`, errorMsg);
    return { success: false, message: `Servidor de WhatsApp: ${errorMsg} (${response.status})` };
  }

  return await response.json();
}

export async function getQRCode(instanceName: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    throw new Error('Configuração de WhatsApp incompleta');
  }

  const response = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
    method: 'GET',
    headers: {
      'apikey': EVOLUTION_API_KEY,
    },
  });

  return await response.json();
}

export async function getInstanceStatus(instanceName: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    throw new Error('Configuração de WhatsApp incompleta');
  }

  const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
    method: 'GET',
    headers: {
      'apikey': EVOLUTION_API_KEY,
    },
  });

  return await response.json();
}

export async function logoutInstance(instanceName: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    throw new Error('Configuração de WhatsApp incompleta');
  }

  const response = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
    method: 'DELETE',
    headers: {
      'apikey': EVOLUTION_API_KEY,
    },
  });

  return await response.json();
}

export async function deleteInstance(instanceName: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    throw new Error('Configuração de WhatsApp incompleta');
  }

  const response = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
    method: 'DELETE',
    headers: {
      'apikey': EVOLUTION_API_KEY,
    },
  });

  return await response.json();
}

export async function sendEvolutionMessage(instanceName: string, phone: string, message: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    throw new Error('Configuração de WhatsApp incompleta');
  }

  const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY,
    },
    body: JSON.stringify({
      number: phone,
      text: message,
      options: {
        delay: 1200,
        presence: "composing",
        linkPreview: false
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.message || errorData.error || 'Erro desconhecido ao enviar mensagem';
    console.error(`[WA-API] Send Error ${response.status}:`, errorMsg);
    throw new Error(`Falha no envio: ${errorMsg}`);
  }

  return await response.json();
}

export async function configureWebhook(instanceName: string, webhookUrlParam: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    throw new Error('Configuração de WhatsApp incompleta');
  }

  // Ensure no trailing slash before path
  const webhookUrl = webhookUrlParam.replace(/\/+$/, '')

  const response = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY,
    },
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        webhookBase64: true,
        events: ["MESSAGES_UPSERT"]
      }
    }),
  });

  if (!response.ok) {
    console.error(`[WA-API] Failed to setup webhook for ${instanceName}:`, response.status);
    return { success: false };
  }

  return { success: true, data: await response.json().catch(() => ({})) };
}
export async function sendEvolutionMedia(instanceName: string, phone: string, mediaUrl: string, mediaType: 'image' | 'video' | 'document' | 'audio', caption?: string, fileName?: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    throw new Error('Configuração de WhatsApp incompleta');
  }

  const endpoint = `${EVOLUTION_API_URL}/message/sendMedia/${instanceName}`;
  const finalFileName = fileName || mediaUrl.split('/').pop() || 'file';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY,
    },
    body: JSON.stringify({
      number: phone,
      media: mediaUrl,
      mediatype: mediaType,
      mediaType: mediaType, // Some V2 versions use camelCase
      caption: caption || '',
      fileName: finalFileName
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.message || errorData.error || 'Erro desconhecido ao enviar mídia';
    console.error(`[WA-API] Send Media Error ${response.status}:`, errorMsg);
    throw new Error(`Falha no envio de mídia: ${errorMsg}`);
  }

  return await response.json();
}
