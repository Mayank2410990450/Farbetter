import { useEffect } from 'react';

/**
 * SEO Helper Component
 * Updates document head with meta tags and structured data
 * Uses React's useEffect to update DOM head elements
 */
export const SEOHelmet = ({ 
  title, 
  description, 
  canonical, 
  ogImage, 
  ogType = 'website',
  children = [],
  jsonLD = null 
}) => {
  useEffect(() => {
    // Set title
    if (title) {
      document.title = title;
    }

    // Helper to set or create meta tag
    const setMeta = (name, content, property = false) => {
      const attr = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Set meta tags
    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
    }

    if (ogImage) {
      setMeta('og:image', ogImage, true);
    }

    if (title) {
      setMeta('og:title', title, true);
    }

    setMeta('og:type', ogType, true);

    // Set canonical URL
    if (canonical) {
      let canonical_tag = document.querySelector('link[rel="canonical"]');
      if (!canonical_tag) {
        canonical_tag = document.createElement('link');
        canonical_tag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical_tag);
      }
      canonical_tag.setAttribute('href', canonical);
    }

    // Add JSON-LD structured data
    if (jsonLD) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLD);
    }

    // Add other meta tags
    children.forEach(child => {
      if (child && child.name && child.content) {
        setMeta(child.name, child.content, child.property);
      }
    });

    return () => {
      // Cleanup if needed
    };
  }, [title, description, canonical, ogImage, ogType, children, jsonLD]);

  return null;
};

export default SEOHelmet;
