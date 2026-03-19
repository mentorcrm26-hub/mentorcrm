import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const translations = {
  pt: {
    back: 'Voltar para Home',
    title: 'Política de Privacidade',
    lastUpdated: 'Última atualização:',
    section1: '1. Informações que coletamos',
    p1a: 'O Mentor CRM prioriza a sua privacidade e a segurança dos seus leads organizados em nossa plataforma.',
    p1b: 'Coletamos informações essenciais para a operação do sistema, como nome, e-mail de acesso e dados de clientes (leads) inseridos voluntariamente por você para utilização da ferramenta. Também podemos coletar dados analíticos anônimos para aprimoramento da performance e UX.',
    section2: '2. Como utilizamos os dados',
    p2: 'As informações inseridas no CRM pertencem exclusivamente à sua organização e são utilizadas somente para fornecer os serviços de automação, gestão de vendas e inteligência artificial preditiva contratados.',
    section3: '3. Compartilhamento e Sigilo',
    p3a: 'Temos uma política rigorosa contra o compartilhamento não autorizado. Não vendemos ou compartilhamos os dados de seus leads com terceiros para fins de marketing ou publicidade.',
    p3b: 'Compartilhamentos ocorrem estritamente na infraestrutura criptografada conectada à serviços necessários, como gateways de WhatsApp, provedores de email (Resend) e de Inteligência Artificial (OpenAI) apenas no contexto do uso contratado por você.',
    section4: '4. Seus Direitos',
    p4: 'Você pode a qualquer momento solicitar a exportação ou exclusão total dos dados mantidos em sua conta do Mentor CRM (opção disponível em Painel > Configurações > Zona de Perigo).',
    footer: 'MENTOR CRM // ARCHITECTURE FOR PERFORMANCE'
  },
  en: {
    back: 'Back to Home',
    title: 'Privacy Policy',
    lastUpdated: 'Last updated:',
    section1: '1. Information We Collect',
    p1a: 'Mentor CRM prioritizes your privacy and the security of your leads organized on our platform.',
    p1b: 'We collect essential information for system operation, such as name, email, and customer (lead) data voluntarily entered by you. We may also collect anonymous analytical data to improve performance and UX.',
    section2: '2. How We Use Data',
    p2: 'The information entered into the CRM belongs exclusively to your organization and is used solely to provide the contracted automation, sales management, and predictive artificial intelligence services.',
    section3: '3. Sharing and Confidentiality',
    p3a: 'We have a strict policy against unauthorized sharing. We do not sell or share your lead data with third parties for marketing or advertising purposes.',
    p3b: 'Sharing occurs strictly within the encrypted infrastructure connected to necessary services (WhatsApp gateways, email providers, AI) only within the context of your contracted usage.',
    section4: '4. Your Rights',
    p4: 'You may request the export or complete deletion of data held in your Mentor CRM account at any time (available in Dashboard > Settings > Danger Zone).',
    footer: 'MENTOR CRM // ARCHITECTURE FOR PERFORMANCE'
  },
  es: {
    back: 'Volver al Inicio',
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización:',
    section1: '1. Información que Recopilamos',
    p1a: 'Mentor CRM prioriza su privacidad y la seguridad de sus clientes potenciales en nuestra plataforma.',
    p1b: 'Recopilamos información esencial para el funcionamiento del sistema, como nombre, correo y datos de clientes (leads) ingresados voluntariamente. También podemos recopilar datos analíticos anónimos para mejorar el rendimiento y la experiencia del usuario.',
    section2: '2. Cómo Utilizamos los Datos',
    p2: 'La información ingresada en el CRM pertenece exclusivamente a su organización y se utiliza únicamente para proporcionar los servicios contratados de automatización, gestión de ventas e IA predictiva.',
    section3: '3. Intercambio y Confidencialidad',
    p3a: 'Tenemos una política estricta contra el intercambio no autorizado. No vendemos ni compartimos los datos de sus clientes con terceros para fines de marketing o publicidad.',
    p3b: 'El intercambio de datos ocurre estrictamente dentro de la infraestructura cifrada conectada a los servicios necesarios de integraciones.',
    section4: '4. Sus Derechos',
    p4: 'Puede solicitar la exportación o eliminación total de los datos en su cuenta de Mentor CRM en cualquier momento (disponible en Panel > Configuración > Zona de Peligro).',
    footer: 'MENTOR CRM // ARCHITECTURE FOR PERFORMANCE'
  }
};

export async function generateMetadata() {
  return {
    title: 'Política de Privacidade | Mentor CRM',
  };
}

export default async function PrivacyPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'pt') as 'pt' | 'en' | 'es';
  const t = translations[locale] || translations['pt'];

  const formatter = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#050505] text-[#F9F9F9] font-sans selection:bg-emerald-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-colors mb-12 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none touch-manipulation">
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </Link>
        
        <div className="mb-12">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">{t.title}</h1>
          <p className="text-zinc-500 text-sm tracking-widest uppercase">{t.lastUpdated} {formatter.format(new Date())}</p>
        </div>

        <div className="space-y-10 text-zinc-400 leading-relaxed">
           <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">{t.section1}</h2>
            <p>{t.p1a}</p>
            <p>{t.p1b}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">{t.section2}</h2>
            <p>{t.p2}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">{t.section3}</h2>
            <p>{t.p3a}</p>
            <p>{t.p3b}</p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">{t.section4}</h2>
            <p>{t.p4}</p>
          </section>
        </div>
        
        <div className="mt-24 pt-8 border-t border-white/[0.08] text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600">{t.footer}</p>
        </div>
      </div>
    </div>
  );
}
