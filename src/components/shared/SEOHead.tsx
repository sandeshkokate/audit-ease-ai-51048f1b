import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://auditease.com';
const DEFAULT_TITLE = 'AuditEase | Automated Courier Billing Audit for E-commerce, Banks & Enterprises';
const DEFAULT_DESCRIPTION =
  'Recover 8-15% of shipping costs. Automated courier billing audit for D2C brands, marketplace sellers, banks, NBFCs & enterprises shipping 500+ parcels or documents monthly.';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
}

export default function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
}: SEOHeadProps) {
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={OG_IMAGE} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  );
}
