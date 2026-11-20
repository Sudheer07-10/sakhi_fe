import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useLanguage } from '../i18n/LanguageProvider';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({ title: propTitle, description: propDescription, canonical: propCanonical }) => {
  const [location] = useLocation();
  const { lang } = useLanguage();
  const [meta, setMeta] = useState({
    title: propTitle || '',
    description: propDescription || '',
    canonical: propCanonical || ''
  });

  useEffect(() => {
    // If props are provided, use them and don't fetch
    if (propTitle && propDescription) {
      setMeta({
        title: propTitle,
        description: propDescription,
        canonical: propCanonical || `https://janmasethu.com${location}`
      });
      return;
    }

    // Otherwise fetch from backend
    const fetchMeta = async () => {
      try {
        const response = await fetch(`/api/seo-metadata?path=${encodeURIComponent(location)}&lang=${lang}`);
        if (response.ok) {
          const data = await response.json();
          setMeta({
            title: data.title,
            description: data.description,
            canonical: data.canonical
          });
        }
      } catch (error) {
        // Silently fail – index.html <title> will serve as fallback
        console.error('Failed to fetch SEO metadata:', error);
      }
    };

    fetchMeta();
  }, [location, lang, propTitle, propDescription, propCanonical]);

  const displayTitle = meta.title || 'JanmaSethu – Path To Parenthood';
  const displayDescription = meta.description || 'Your trusted guide from fertility to parenthood. Expert advice, pregnancy tools, and personalized support.';

  return (
    <Helmet>
      <title>{displayTitle}</title>
      <meta name="description" content={displayDescription} />
      
      {/* Canonical URL */}
      {meta.canonical && <link rel="canonical" href={meta.canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={meta.canonical || `https://janmasethu.com${location}`} />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={displayDescription} />
      <meta property="og:image" content="https://janmasethu.com/logo.png" />
      <meta property="og:site_name" content="JanmaSethu" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={meta.canonical || `https://janmasethu.com${location}`} />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={displayDescription} />
      <meta name="twitter:image" content="https://janmasethu.com/logo.png" />
    </Helmet>
  );
};

export default SEO;
