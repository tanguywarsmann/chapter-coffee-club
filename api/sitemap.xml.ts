// api/sitemap.xml.ts — Sitemap dynamique automatique
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

function escapeXml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Lecture automatique des articles markdown (si présents)
async function getAllBlogPostsFromFiles() {
  try {
    const blogDir = join(process.cwd(), 'content/blog');
    const files = await readdir(blogDir);
    
    const posts = await Promise.all(
      files
        .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
        .map(async (file) => {
          const filePath = join(blogDir, file);
          const fileContent = await readFile(filePath, 'utf8');
          const { data: frontmatter } = matter(fileContent);
          
          const slug = file.replace(/\.(md|mdx)$/, '');
          
          return {
            slug,
            lastmod: frontmatter.updated_at || frontmatter.created_at || frontmatter.date,
            published: frontmatter.published !== false,
          };
        })
    );
    
    return posts.filter(post => post.published);
  } catch (error) {
    // Pas de fichiers markdown locaux
    return [];
  }
}

// Lecture des articles depuis Supabase
async function getAllBlogPostsFromDB(supabaseUrl: string, supabaseKey: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const qs = new URL(`${supabaseUrl}/rest/v1/blog_posts`);
    qs.searchParams.set('select', 'slug,updated_at,created_at,published');
    qs.searchParams.set('published', 'eq.true');
    qs.searchParams.set('order', 'updated_at.desc');
    qs.searchParams.set('limit', '10000');

    const response = await fetch(qs.toString(), {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);
    
    const rows = await response.json();
    return rows.map((row: any) => ({
      slug: row.slug,
      lastmod: row.updated_at || row.created_at,
      published: true
    }));
  } catch (error) {
    clearTimeout(timeout);
    console.error('Erreur récupération articles DB:', error);
    return [];
  }
}

// Système hybride : combine fichiers ET base de données
async function getAllBlogPosts(supabaseUrl?: string, supabaseKey?: string) {
  const [filePosts, dbPosts] = await Promise.all([
    getAllBlogPostsFromFiles(),
    supabaseUrl && supabaseKey ? getAllBlogPostsFromDB(supabaseUrl, supabaseKey) : Promise.resolve([])
  ]);
  
  // Fusionner et déduplicater par slug
  const allPosts = [...filePosts, ...dbPosts];
  const uniquePosts = allPosts.filter((post, index, self) => 
    index === self.findIndex(p => p.slug === post.slug)
  );
  
  return uniquePosts;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const BASE = process.env.SITEMAP_BASE || 'https://www.vread.fr';
  const SUPABASE_URL = process.env.SITEMAP_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SITEMAP_SUPABASE_KEY;

  // Pages statiques principales
  const staticPages = [
    { loc: `${BASE}/`, lastmod: new Date().toISOString(), priority: '1.0', changefreq: 'weekly' },
    { loc: `${BASE}/a-propos`, lastmod: new Date().toISOString(), priority: '0.9', changefreq: 'monthly' },
    { loc: `${BASE}/presse`, lastmod: new Date().toISOString(), priority: '0.8', changefreq: 'monthly' },
    { loc: `${BASE}/blog`, lastmod: new Date().toISOString(), priority: '0.9', changefreq: 'weekly' },
  ];

  // Récupération automatique de tous les articles (fichiers + DB)
  const blogPosts = await getAllBlogPosts(SUPABASE_URL, SUPABASE_KEY);
  
  // Génération des URLs d'articles avec métadonnées SEO
  const blogPages = blogPosts.map(post => ({
    loc: `${BASE}/blog/${post.slug}`,
    lastmod: post.lastmod ? new Date(post.lastmod).toISOString() : new Date().toISOString(),
    priority: '0.7',
    changefreq: 'monthly'
  }));

  // Fusion de toutes les URLs
  const allUrls = [...staticPages, ...blogPages];

  // Génération XML avec métadonnées SEO complètes
  const urlsXml = allUrls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

  // Headers optimisés pour le SEO
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('x-sitemap-version', 'vread-sitemap-dynamic-v1');
  res.setHeader('x-sitemap-articles-count', blogPosts.length.toString());
  
  return res.status(200).send(xml);
}