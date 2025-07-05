
import { generateCompleteSitemap } from '../src/utils/sitemapServer';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function verifySitemap() {
  try {
    console.log('🔍 Vérification du sitemap dynamique...');
    
    const sitemap = await generateCompleteSitemap();
    
    // Vérifications
    const urlCount = (sitemap.match(/<url>/g) || []).length;
    const hasBlogUrls = sitemap.includes('/blog/');
    const hasBookUrls = sitemap.includes('/books/');
    
    console.log(`✅ Sitemap généré avec ${urlCount} URLs`);
    console.log(`📝 Articles de blog inclus: ${hasBlogUrls ? '✅' : '❌'}`);
    console.log(`📚 Livres inclus: ${hasBookUrls ? '✅' : '❌'}`);
    
    // Sauvegarder une version statique en fallback
    const publicPath = join(process.cwd(), 'public', 'sitemap.xml');
    writeFileSync(publicPath, sitemap, 'utf8');
    console.log('💾 Version de fallback sauvegardée dans public/sitemap.xml');
    
    if (urlCount < 2) {
      throw new Error('Sitemap semble incomplet');
    }
    
    console.log('🎉 Sitemap vérifié avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du sitemap:', error);
    process.exit(1);
  }
}

verifySitemap();
