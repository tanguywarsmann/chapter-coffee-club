// api/sitemap.xml.ts — Sitemap dynamique v2 avec améliorations
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

// Constantes de configuration
const GOOGLE_SITEMAP_LIMIT = 50000;
const BATCH_SIZE = 10;

// Types
interface BlogPost {
  slug: string;
  lastmod: string;
  published: boolean;
  images?: string[];
}

interface SitemapUrl {
  loc: string;
  lastmod: string;
  priority: string;
  changefreq: string;
  images?: string[];
}

interface SitemapStats {
  totalUrls: number;
  blogPosts: number;
  errors: number;
  generationTime: number;
  fromFiles: number;
  fromDB: number;
}

function escapeXml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Validation robuste des dates du frontmatter
 * Retourne une date ISO valide ou une date par défaut
 */
function validateAndParseDate(dateValue: any, fallbackDate: Date = new Date()): string {
  if (!dateValue) return fallbackDate.toISOString();
  
  // Si c'est déjà une string ISO valide
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  
  // Si c'est un objet Date
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue.toISOString();
  }
  
  // Tentative de parsing pour différents formats
  try {
    const parsed = new Date(String(dateValue));
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } catch {
    // Ignorer l'erreur et utiliser le fallback
  }
  
  return fallbackDate.toISOString();
}

/**
 * Extraction des images depuis le frontmatter
 * Support des champs: image, cover, thumbnail, og_image, images
 */
function extractImages(frontmatter: any, baseUrl: string): string[] {
  const images: string[] = [];
  const possibleImageFields = ['image', 'cover', 'thumbnail', 'og_image', 'featured_image'];
  
  // Images individuelles
  for (const field of possibleImageFields) {
    const imageValue = frontmatter[field];
    if (imageValue && typeof imageValue === 'string') {
      // Convertir les chemins relatifs en URLs complètes
      const imageUrl = imageValue.startsWith('http') 
        ? imageValue 
        : `${baseUrl}${imageValue.startsWith('/') ? '' : '/'}${imageValue}`;
      images.push(imageUrl);
    }
  }
  
  // Tableau d'images
  if (Array.isArray(frontmatter.images)) {
    frontmatter.images.forEach((img: any) => {
      if (typeof img === 'string') {
        const imageUrl = img.startsWith('http') 
          ? img 
          : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
        images.push(imageUrl);
      }
    });
  }
  
  return [...new Set(images)]; // Dédoublonnage
}

/**
 * Lecture améliorée des articles markdown avec gestion d'erreurs par fichier
 */
async function getAllBlogPostsFromFiles(baseUrl: string): Promise<{ posts: BlogPost[], errors: number }> {
  let errorCount = 0;
  const posts: BlogPost[] = [];
  
  try {
    const blogDir = join(process.cwd(), 'content/blog');
    const files = await readdir(blogDir);
    const markdownFiles = files.filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
    
    // Traitement par batch pour éviter la surcharge
    for (let i = 0; i < markdownFiles.length; i += BATCH_SIZE) {
      const batch = markdownFiles.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (file) => {
          const filePath = join(blogDir, file);
          const fileContent = await readFile(filePath, 'utf8');
          const { data: frontmatter } = matter(fileContent);
          
          const slug = file.replace(/\.(md|mdx)$/, '');
          
          // Validation des dates avec fallback
          const lastmod = validateAndParseDate(
            frontmatter.updated_at || frontmatter.created_at || frontmatter.date
          );
          
          // Extraction des images
          const images = extractImages(frontmatter, baseUrl);
          
          return {
            slug,
            lastmod,
            published: frontmatter.published !== false,
            images: images.length > 0 ? images : undefined,
          };
        })
      );
      
      // Traitement des résultats du batch
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.published) {
            posts.push(result.value);
          }
        } else {
          errorCount++;
          console.error(`Erreur parsing ${batch[index]}:`, result.reason);
        }
      });
    }
    
    return { posts, errors: errorCount };
  } catch (error) {
    console.error('Erreur lecture dossier blog:', error);
    return { posts: [], errors: 1 };
  }
}

/**
 * Lecture améliorée des articles depuis Supabase avec gestion d'erreurs
 */
async function getAllBlogPostsFromDB(supabaseUrl: string, supabaseKey: string, baseUrl: string): Promise<{ posts: BlogPost[], errors: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // Timeout plus long

  try {
    const qs = new URL(`${supabaseUrl}/rest/v1/blog_posts`);
    qs.searchParams.set('select', 'slug,updated_at,created_at,published,image_url,image_alt');
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
    const posts = rows.map((row: any) => {
      const lastmod = validateAndParseDate(row.updated_at || row.created_at);
      const images = row.image_url ? [
        row.image_url.startsWith('http') ? row.image_url : `${baseUrl}${row.image_url}`
      ] : undefined;
      
      return {
        slug: row.slug,
        lastmod,
        published: true,
        images
      };
    });
    
    return { posts, errors: 0 };
  } catch (error) {
    clearTimeout(timeout);
    console.error('Erreur récupération articles DB:', error);
    return { posts: [], errors: 1 };
  }
}

/**
 * Système hybride optimisé avec métriques
 */
async function getAllBlogPosts(baseUrl: string, supabaseUrl?: string, supabaseKey?: string): Promise<{ posts: BlogPost[], stats: Partial<SitemapStats> }> {
  const startTime = Date.now();
  
  const [fileResult, dbResult] = await Promise.all([
    getAllBlogPostsFromFiles(baseUrl),
    supabaseUrl && supabaseKey ? getAllBlogPostsFromDB(supabaseUrl, supabaseKey, baseUrl) : Promise.resolve({ posts: [], errors: 0 })
  ]);
  
  // Fusionner et déduplicater par slug (priorité aux fichiers locaux)
  const allPosts = [...fileResult.posts, ...dbResult.posts];
  const uniquePosts = allPosts.filter((post, index, self) => 
    index === self.findIndex(p => p.slug === post.slug)
  );
  
  const stats = {
    blogPosts: uniquePosts.length,
    errors: fileResult.errors + dbResult.errors,
    generationTime: Date.now() - startTime,
    fromFiles: fileResult.posts.length,
    fromDB: dbResult.posts.length
  };
  
  return { posts: uniquePosts, stats };
}

/**
 * Génération du XML avec support des images
 */
function generateSitemapXml(urls: SitemapUrl[], withImages: boolean = true): string {
  const xmlns = withImages 
    ? 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

  const urlsXml = urls.map(url => {
    let urlXml = `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>`;

    // Ajouter les images si disponibles et si activé
    if (withImages && url.images && url.images.length > 0) {
      const imagesXml = url.images.map(imageUrl => 
        `    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
    </image:image>`
      ).join('\n');
      urlXml += '\n' + imagesXml;
    }

    urlXml += '\n  </url>';
    return urlXml;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset ${xmlns}>
${urlsXml}
</urlset>`;
}

/**
 * Génération du sitemap index si nécessaire
 */
function generateSitemapIndex(baseUrl: string, sitemapCount: number): string {
  const sitemapUrls = Array.from({ length: sitemapCount }, (_, i) => 
    `  <sitemap>
    <loc>${baseUrl}/sitemap-${i + 1}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</sitemapindex>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const BASE = process.env.SITEMAP_BASE || 'https://www.vread.fr';
  const SUPABASE_URL = process.env.SITEMAP_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SITEMAP_SUPABASE_KEY;
  
  // Support des paramètres de requête
  const includeImages = req.query.images !== 'false';
  const sitemapIndex = parseInt(String(req.query.index || '0'));

  try {
    // Pages statiques principales
    const staticPages: SitemapUrl[] = [
      { loc: `${BASE}/`, lastmod: new Date().toISOString(), priority: '1.0', changefreq: 'weekly' },
      { loc: `${BASE}/a-propos`, lastmod: new Date().toISOString(), priority: '0.9', changefreq: 'monthly' },
      { loc: `${BASE}/presse`, lastmod: new Date().toISOString(), priority: '0.8', changefreq: 'monthly' },
      { loc: `${BASE}/blog`, lastmod: new Date().toISOString(), priority: '0.9', changefreq: 'weekly' },
    ];

    // Récupération automatique de tous les articles
    const { posts: blogPosts, stats } = await getAllBlogPosts(BASE, SUPABASE_URL, SUPABASE_KEY);
    
    // Génération des URLs d'articles
    const blogPages: SitemapUrl[] = blogPosts.map(post => ({
      loc: `${BASE}/blog/${post.slug}`,
      lastmod: post.lastmod,
      priority: '0.7',
      changefreq: 'monthly',
      images: post.images
    }));

    // Fusion de toutes les URLs
    const allUrls = [...staticPages, ...blogPages];
    
    // Vérification des limites Google et génération
    const totalUrls = allUrls.length;
    const finalStats: SitemapStats = {
      totalUrls,
      blogPosts: blogPosts.length,
      errors: stats.errors || 0,
      generationTime: Date.now() - startTime,
      fromFiles: stats.fromFiles || 0,
      fromDB: stats.fromDB || 0
    };

    // Si on dépasse la limite, générer un sitemap index
    if (totalUrls > GOOGLE_SITEMAP_LIMIT) {
      const sitemapCount = Math.ceil(totalUrls / GOOGLE_SITEMAP_LIMIT);
      
      if (sitemapIndex === 0 || !sitemapIndex) {
        // Retourner le sitemap index
        const xml = generateSitemapIndex(BASE, sitemapCount);
        
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.setHeader('x-sitemap-type', 'index');
        res.setHeader('x-sitemap-count', sitemapCount.toString());
        
        return res.status(200).send(xml);
      } else {
        // Retourner un sitemap spécifique
        const startIndex = (sitemapIndex - 1) * GOOGLE_SITEMAP_LIMIT;
        const endIndex = startIndex + GOOGLE_SITEMAP_LIMIT;
        const urlsSlice = allUrls.slice(startIndex, endIndex);
        
        const xml = generateSitemapXml(urlsSlice, includeImages);
        
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.setHeader('x-sitemap-type', 'partial');
        res.setHeader('x-sitemap-index', sitemapIndex.toString());
        
        return res.status(200).send(xml);
      }
    }

    // Sitemap classique (moins de 50k URLs)
    const xml = generateSitemapXml(allUrls, includeImages);

    // Headers optimisés avec métriques
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('x-sitemap-version', 'vread-sitemap-dynamic-v2');
    res.setHeader('x-sitemap-urls', finalStats.totalUrls.toString());
    res.setHeader('x-sitemap-articles', finalStats.blogPosts.toString());
    res.setHeader('x-sitemap-errors', finalStats.errors.toString());
    res.setHeader('x-sitemap-generation-ms', finalStats.generationTime.toString());
    res.setHeader('x-sitemap-sources', `files:${finalStats.fromFiles},db:${finalStats.fromDB}`);
    
    return res.status(200).send(xml);
    
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    
    // Sitemap de fallback minimal
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('x-sitemap-fallback', 'true');
    res.setHeader('x-sitemap-error', 'generation-failed');
    
    return res.status(200).send(fallbackXml);
  }
}
