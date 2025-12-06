import { Helmet } from 'react-helmet-async';

/**
 * SEO Helper Component
 * Updates document head with meta tags and structured data
 * Uses react-helmet-async for managing head elements
 */
export const SEOHelmet = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  children,
  jsonLD
}) => {
  const siteTitle = 'Farbetter - Premium Protein Snacks';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* JSON-LD Structured Data */}
      {jsonLD && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLD)}
        </script>
      )}

      {/* Additional Meta Tags */}
      {children}
    </Helmet>
  );
};

export default SEOHelmet;
