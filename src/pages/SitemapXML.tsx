import { useEffect } from 'react';
import { generateSitemap } from '@/utils/generateSitemap';

export default function SitemapXML() {
  useEffect(() => {
    const loadSitemap = async () => {
      const sitemap = await generateSitemap();
      
      // Set content type to XML
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      // Display the XML
      document.open();
      document.write(sitemap);
      document.close();
    };
    
    loadSitemap();
  }, []);

  return null;
}
