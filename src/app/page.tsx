import { Metadata } from 'next';
import { HomeClient } from '@/components/landing/home-client';

export const metadata: Metadata = {
  title: 'Mentor CRM | AI-Powered Lead Management Architecture',
  description: 'The ultimate platform for high-performance agencies and sales teams. Capture, distribute, and convert with predictive technology and multi-channel automation.',
  keywords: 'lead management, sales automation, multi-channel crm, lead distribution, high-performance sales, mentor crm',
  openGraph: {
    title: 'Mentor CRM | High-Performance Lead Management',
    description: 'Capture and convert more with Mentor CRM.',
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
