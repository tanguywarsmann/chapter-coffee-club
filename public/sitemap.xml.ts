
// Ce fichier sera traité par Vite pour générer le sitemap dynamiquement
import { generateCompleteSitemap } from '../src/utils/sitemapServer';

export default async function handler() {
  const sitemap = await generateCompleteSitemap();
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
