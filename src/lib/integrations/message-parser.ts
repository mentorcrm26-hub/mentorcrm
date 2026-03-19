import { formatFlorida } from '../timezone';

export function parseTemplate(content: string, lead: any, sender?: any): string {
  if (!content) return '';
  
  // Basic lead variables
  const variables: Record<string, string> = {
    '{nome_cliente}': lead.name || 'Cliente',
    '{email_cliente}': lead.email || '',
    '{telefone_cliente}': lead.phone || '',
    '{origem}': lead.origin || '',
    '{produto}': lead.product_interest || '',
    '{status}': lead.status || '',
    '{data_hoje}': formatFlorida(new Date(), 'dd/MM/yyyy'),
    '{data_reuniao}': lead.meeting_at ? formatFlorida(new Date(lead.meeting_at), 'dd/MM/yyyy') : '...',
    '{hora_reuniao}': lead.meeting_at ? formatFlorida(new Date(lead.meeting_at), 'HH:mm') : '...',
    
    // Sender variables (from profile)
    '{link_google_meet}': sender?.google_meet_link || '...',
    '{link_reuniao}': sender?.other_meet_link || '...',
  };

  let parsed = content;
  Object.entries(variables).forEach(([key, value]) => {
    parsed = parsed.replace(new RegExp(key, 'g'), value);
  });

  return parsed;
}
