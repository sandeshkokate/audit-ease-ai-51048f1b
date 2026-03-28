import { Helmet } from 'react-helmet-async';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does AuditEase detect billing discrepancies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our system analyses your shipment data against your courier rate cards, checking for weight mismatches (billed vs actual/volumetric weight), zone classification errors, RTO overcharges, and COD discrepancies. Any shipment where the billed amount exceeds the expected amount is flagged for review.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the ₹6,999 setup fee cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The one-time setup fee covers complete platform onboarding, rate card configuration for up to 6 couriers, courier format mapping, and 1 month of free support. There are no recurring subscription fees after this — you only pay a percentage of amounts we actually recover for you.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are there any monthly subscription fees?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. AuditEase has zero monthly fees. After the one-time ₹6,999 setup, you only pay a commission on the amount we successfully recover. No recovery means no charge.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the pay-as-you-go commission work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We charge a percentage of the amount recovered from courier overcharges: 10% for recoveries up to ₹1L/month, 8% for ₹1L–₹10L/month, and custom rates for ₹10L+/month. You are only billed when money is actually recovered — if we don\'t recover anything, you pay nothing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which courier partners do you support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We support all major Indian courier partners including Delhivery, Blue Dart, DTDC, Ecom Express, XpressBees, Shadowfax, Ekart, and more. The setup fee includes mapping for up to 6 couriers, with additional couriers available on request.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to see results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Once you upload your invoice data, our system typically identifies discrepancies within minutes. Actual recovery timeline depends on courier response times — typically 48-72 hours. Most clients recover their ₹6,999 setup fee within the first audit cycle.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All data is encrypted in transit and at rest. We only access shipment data required for auditing and never share your data with third parties.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to change my existing workflow?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Simply export your courier invoices as CSV files and upload them. You can continue using all your existing systems and processes.',
      },
    },
  ],
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AuditEase AI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Automated courier billing audit platform for Indian e-commerce. Upload shipment data, detect weight and zone discrepancies, generate AI-powered dispute emails, and track recoveries.',
  url: 'https://auditease.com',
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      description: '10% commission on recovered amount for recoveries up to ₹1L/month',
      priceCurrency: 'INR',
      price: '0',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '10',
        priceCurrency: 'INR',
        unitText: 'percent of recovery',
      },
    },
    {
      '@type': 'Offer',
      name: 'Professional',
      description: '8% commission on recovered amount for recoveries between ₹1L–₹10L/month',
      priceCurrency: 'INR',
      price: '0',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '8',
        priceCurrency: 'INR',
        unitText: 'percent of recovery',
      },
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AuditEase AI',
  url: 'https://auditease.com',
  description:
    'AuditEase AI is an automated courier billing audit platform helping Indian e-commerce businesses recover overcharges from shipping partners.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@auditease.com',
    contactType: 'customer support',
    availableLanguage: ['English', 'Hindi'],
  },
};

export default function SchemaMarkup() {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
    </Helmet>
  );
}
