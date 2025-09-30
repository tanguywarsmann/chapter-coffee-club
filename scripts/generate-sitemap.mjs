import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const urls = [
  'https://www.vread.fr/',
  'https://www.vread.fr/explore',
  'https://www.vread.fr/blog',
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n') +
  `\n</urlset>\n`;

mkdirSync(resolve('public'), { recursive: true });
writeFileSync(resolve('public', 'sitemap.xml'), xml);
console.log('✓ sitemap.xml écrit dans public/');
