import { Metadata } from 'next';
import { HomeClient } from '@/components/landing/home-client';

export const metadata: Metadata = {
  title: 'Mentor CRM | The CRM Built for Life Planners',
  description: 'Track referrals, automate follow-ups, and close more policies. The first system designed specifically for the workflow of American Life Planners.',
  keywords: 'life planner crm, insurance crm, financial planning software, lead management for life planners, national life group crm, pacific life crm',
  openGraph: {
    title: 'Mentor CRM | Built for Life Planners',
    description: 'Stop losing referrals in spreadsheets. Automate your follow-up and grow your book of business.',
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentor CRM | Built for Life Planners',
    description: 'The system that understands how Life Planners actually work.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://mentorcrm.site',
  }
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Mentor CRM',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'High-performance CRM for Life Planners and Insurance Professionals.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
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
