import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const translations = {
  pt: {
    back: 'Voltar para Home',
    title: 'Termos de Serviço',
    lastUpdated: 'Última atualização:',
    section1: '1. Aceitação dos Termos',
    p1: 'Ao acessar e utilizar a plataforma Mentor CRM, você concorda em cumprir e ficar vinculado a estes Termos de Serviço, bem como a todas as leis e regulamentos aplicáveis. Se você não concordar com qualquer parte destes termos, você está proibido de usar ou acessar este site.',
    section2: '2. Uso da Licença',
    p2: 'É concedida permissão para o uso temporário, pessoal e não comercial da plataforma Mentor CRM, de acordo com as funcionalidades do plano contratado.',
    li1: 'Você não deve modificar, copiar, ou tentar descompilar qualquer software contido no Mentor CRM.',
    li2: 'O uso de bots e automações de terceiros não autorizadas pode resultar em rescisão da conta.',
    li3: 'Essa licença se encerra automaticamente se você violar qualquer uma destas restrições.',
    section3: '3. Isenção de Responsabilidade',
    p3: 'Os materiais no site da Mentor CRM são fornecidos "como estão". Mentor CRM não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.',
    section4: '4. Limitações',
    p4: 'Em nenhum caso o Mentor CRM ou seus fornecedores serão responsáveis por quaisquer danos decorrentes do uso ou da incapacidade de usar a plataforma.',
    footer: 'MENTOR CRM // ARCHITECTURE FOR PERFORMANCE'
  },
  en: {
    back: 'Back to Home',
    title: 'Terms of Service',
    lastUpdated: 'Last updated:',
    section1: '1. Acceptance of Terms',
    p1: 'By accessing and using the Mentor CRM platform, you agree to comply with and be bound by these Terms of Service, as well as all applicable laws and regulations. If you disagree with any part of these terms, you are prohibited from using or accessing this site.',
    section2: '2. Use License',
    p2: 'Permission is granted to temporarily use the Mentor CRM platform for personal, non-commercial use, according to the features of your subscribed plan.',
    li1: 'You must not modify, copy, or attempt to decompile any software contained in Mentor CRM.',
    li2: 'The use of unauthorized third-party bots and automations may result in account termination.',
    li3: 'This license shall automatically terminate if you violate any of these restrictions.',
    section3: '3. Disclaimer',
    p3: 'The materials on Mentor CRM\'s website are provided on an "as is" basis. Mentor CRM makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.',
    section4: '4. Limitations',
    p4: 'In no event shall Mentor CRM or its suppliers be liable for any damages arising out of the use or inability to use the platform.',
    footer: 'MENTOR CRM // ARCHITECTURE FOR PERFORMANCE'
  },
  es: {
    back: 'Volver al Inicio',
    title: 'Términos de Servicio',
    lastUpdated: 'Última actualización:',
    section1: '1. Aceptación de los Términos',
    p1: 'Al acceder y utilizar la plataforma Mentor CRM, usted acepta cumplir y estar sujeto a estos Términos de Servicio, así como a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguna parte, se le prohíbe usar este sitio.',
    section2: '2. Licencia de Uso',
    p2: 'Se concede permiso para el uso temporal, personal y no comercial de la plataforma Mentor CRM, de acuerdo con las características del plan contratado.',
    li1: 'No debe modificar, copiar o intentar descompilar ningún software contenido en Mentor CRM.',
    li2: 'El uso de bots de terceros no autorizados puede resultar en la terminación de la cuenta.',
    li3: 'Esta licencia terminará automáticamente si viola alguna de estas restricciones.',
    section3: '3. Descargo de Responsabilidad',
    p3: 'Los materiales en el sitio web de Mentor CRM se proporcionan "tal cual". Mentor CRM no ofrece garantías, expresas o implícitas, y por la presente renuncia a todas las demás garantías.',
    section4: '4. Limitaciones',
    p4: 'En ningún caso Mentor CRM o sus proveedores serán responsables de ningún daño que surja del uso o la incapacidad de usar la plataforma.',
    footer: 'MENTOR CRM // ARCHITECTURE FOR PERFORMANCE'
  }
};

export async function generateMetadata() {
  return {
    title: 'Termos de Serviço | Mentor CRM',
  };
}

export default async function TermsPage() {
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
            <p>{t.p1}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">{t.section2}</h2>
            <p>{t.p2}</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-500">
              <li>{t.li1}</li>
              <li>{t.li2}</li>
              <li>{t.li3}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">{t.section3}</h2>
            <p>{t.p3}</p>
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
