import { Metadata } from 'next';
import { HomeClient } from '@/components/landing/home-client';

export const metadata: Metadata = {
  title: 'Mentor CRM | Arquitetura de Elite em Gestão de Leads',
  description: 'A plataforma definitiva para agências e times de vendas de alta performance. Capture, distribua e converta com tecnologia preditiva e automação multicanal.',
  keywords: 'gestão de leads, automação de vendas, crm multicanal, distribuição de leads, vendas de alta performance, mentor crm',
  openGraph: {
    title: 'Mentor CRM | Gestão de Leads de Alta Performance',
    description: 'Capture e converta mais com o Mentor CRM.',
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentor CRM | Lead Management Architecture',
    description: 'The precision CRM for high-performance sales teams.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://mentor-crm.com',
  }
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Mentor CRM',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'High-performance CRM for lead management and sales automation.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '150',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
