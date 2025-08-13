
import { useEffect, useState } from 'react';
import { blogService } from '@/services/blogService';
import { generateDynamicSitemap } from '@/utils/sitemapGenerator';

export default function Sitemap() {
  const [sitemap, setSitemap] = useState<string>('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const sitemapContent = await generateDynamicSitemap();
        setSitemap(sitemapContent);
      } catch (error) {
        console.error('Erreur lors de la génération del sitemap:', error);
        // Fallback vers un sitemap minimal
        setSitemap(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.vread.fr/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
      }
    };

    generateSitemap();
  }, []);

  // Configurer les headers pour XML
  useEffect(() => {
    if (sitemap) {
      const response = new Response(sitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
  }, [sitemap]);

  return (
    <div style={{ display: 'none' }}>
      {/* Component invisible - le contenu est servi via les headers */}
    </div>
  );
}

// Export du contenu XML pour utilisation directe
export const getSitemapContent = async (): Promise<string> => {
  try {
    return await generateDynamicSitemap();
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.vread.fr/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
};
