import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "fs";
import { join } from "path";

// ── Helpers ──────────────────────────────────────────────────────────────────

const DOMAIN = "https://www.vread.fr";
const DEFAULT_OG_IMAGE = `${DOMAIN}/og/vread-og-default.png`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface SeoData {
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "article";
  ogImage: string;
  jsonLd?: object[];
  noindex?: boolean;
  status?: number;
  cache: string;
}

// ── Static SEO map ──────────────────────────────────────────────────────────

const SEO_MAP: Record<string, Omit<SeoData, "canonical" | "cache">> = {
  "/": {
    title: "VREAD, le Strava de la lecture | Suivi, validation, badges",
    description:
      "Valide ta lecture par segments grâce à des questions rapides. Suivi, séries, badges et progression. Disponible iOS et Android.",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "VREAD",
        url: DOMAIN,
        logo: `${DOMAIN}/branding/vread-logo-512.png`,
        sameAs: [],
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "VREAD",
        url: DOMAIN,
      },
    ],
  },
  "/blog": {
    title: "Blog VREAD | Conseils et méthodes pour mieux lire",
    description:
      "Découvrez des conseils scientifiques et des méthodes concrètes pour améliorer votre lecture.",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
  },
  "/a-propos": {
    title: "VREAD – À propos | L'app qui transforme votre lecture",
    description:
      "Découvrez VREAD, l'application qui gamifie votre lecture avec des questions IA et un système de progression.",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
  },
  "/presse": {
    title: "Espace Presse | VREAD",
    description: "Kit média, logos, visuels et contact presse VREAD.",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "VREAD",
        url: DOMAIN,
        logo: `${DOMAIN}/branding/vread-logo-512.png`,
      },
    ],
  },
  "/ia": {
    title:
      "VREAD | Strava de la lecture : suivi avec preuve de lecture",
    description:
      "VREAD est l'application Strava de la lecture. Suivi par segments et validation par question.",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "VREAD",
        url: DOMAIN,
        logo: `${DOMAIN}/branding/vread-logo-512.png`,
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "VREAD",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "iOS, Web",
        url: DOMAIN,
        description:
          "Application de suivi de lecture type Strava. Segments, checkpoints et validation par question.",
      },
    ],
  },
  "/duolingo": {
    title: "VREAD et Duolingo : Quelle app pour le français ?",
    description:
      "Comparaison complète entre VREAD et Duolingo pour apprendre le français par la lecture.",
    ogType: "article",
    ogImage: DEFAULT_OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "VREAD et Duolingo : Quelle app pour le français ?",
        publisher: { "@type": "Organization", name: "VREAD", url: DOMAIN },
      },
    ],
  },
  "/strava": {
    title: "Le Strava de la lecture : VREAD",
    description:
      "Découvrez VREAD, qui applique le tracking et la motivation de Strava à la lecture.",
    ogType: "article",
    ogImage: DEFAULT_OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Le Strava de la lecture : VREAD",
        publisher: { "@type": "Organization", name: "VREAD", url: DOMAIN },
      },
    ],
  },
};

// ── Supabase blog fetch ─────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "";

async function fetchBlogPost(
  slug: string
): Promise<SeoData | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&published=eq.true&select=title,excerpt,image_url,author,published_at,updated_at&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;

    const post = rows[0];
    const title = post.title || "Article";
    const description = post.excerpt || "";
    const ogImage = post.image_url || DEFAULT_OG_IMAGE;

    return {
      title: `${title} | VREAD Blog`,
      description,
      canonical: `${DOMAIN}/blog/${slug}`,
      ogType: "article",
      ogImage,
      cache: "public, s-maxage=900, stale-while-revalidate=604800",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          image: ogImage,
          author: {
            "@type": "Person",
            name: post.author || "VREAD",
          },
          publisher: {
            "@type": "Organization",
            name: "VREAD",
            url: DOMAIN,
            logo: { "@type": "ImageObject", url: `${DOMAIN}/branding/vread-logo-512.png` },
          },
          datePublished: post.published_at || undefined,
          dateModified: post.updated_at || post.published_at || undefined,
          mainEntityOfPage: `${DOMAIN}/blog/${slug}`,
        },
      ],
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// ── Build meta block ────────────────────────────────────────────────────────

function buildMetaBlock(seo: SeoData): string {
  const t = escapeHtml(seo.title);
  const d = escapeHtml(seo.description);
  const lines: string[] = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
  ];

  if (seo.noindex) {
    lines.push(`<meta name="robots" content="noindex, nofollow" />`);
  } else {
    lines.push(`<meta name="robots" content="index, follow" />`);
    lines.push(`<link rel="canonical" href="${seo.canonical}" />`);
  }

  // Open Graph
  lines.push(`<meta property="og:title" content="${t}" />`);
  lines.push(`<meta property="og:description" content="${d}" />`);
  lines.push(`<meta property="og:type" content="${seo.ogType}" />`);
  lines.push(`<meta property="og:url" content="${seo.canonical}" />`);
  lines.push(`<meta property="og:image" content="${seo.ogImage}" />`);
  lines.push(`<meta property="og:site_name" content="VREAD" />`);

  // Twitter
  lines.push(`<meta name="twitter:card" content="summary_large_image" />`);
  lines.push(`<meta name="twitter:title" content="${t}" />`);
  lines.push(`<meta name="twitter:description" content="${d}" />`);
  lines.push(`<meta name="twitter:image" content="${seo.ogImage}" />`);

  // JSON-LD
  if (seo.jsonLd) {
    for (const ld of seo.jsonLd) {
      lines.push(
        `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
      );
    }
  }

  return lines.join("\n    ");
}

// ── Read template ───────────────────────────────────────────────────────────

let templateCache: string | null = null;

function getTemplate(): string {
  if (templateCache) return templateCache;
  const templatePath = join(__dirname, "_template.html");
  templateCache = readFileSync(templatePath, "utf-8");
  return templateCache;
}

// ── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const pathname = (req.url || "/").split("?")[0].replace(/\/+$/, "") || "/";

  let seo: SeoData;

  // Check static map
  if (SEO_MAP[pathname]) {
    const entry = SEO_MAP[pathname];
    seo = {
      ...entry,
      canonical: `${DOMAIN}${pathname === "/" ? "" : pathname}`,
      cache: "public, s-maxage=86400, stale-while-revalidate=604800",
    };
  }
  // Blog slug
  else if (pathname.startsWith("/blog/")) {
    const slug = pathname.slice(6); // remove "/blog/"
    if (slug && !slug.includes("/")) {
      const blogSeo = await fetchBlogPost(slug);
      if (blogSeo) {
        seo = blogSeo;
      } else {
        // 404
        seo = {
          title: "Article introuvable | VREAD",
          description: "Cet article n'existe pas sur VREAD.",
          canonical: "",
          ogType: "website",
          ogImage: DEFAULT_OG_IMAGE,
          noindex: true,
          status: 404,
          cache: "public, s-maxage=60",
        };
      }
    } else {
      // Fallback for malformed blog paths
      seo = {
        ...SEO_MAP["/"]!,
        canonical: DOMAIN,
        cache: "public, s-maxage=86400, stale-while-revalidate=604800",
      };
    }
  }
  // Unknown route: serve with homepage defaults (SPA will handle client routing)
  else {
    seo = {
      ...SEO_MAP["/"]!,
      canonical: `${DOMAIN}${pathname}`,
      cache: "public, s-maxage=86400, stale-while-revalidate=604800",
    };
  }

  const template = getTemplate();
  const metaBlock = buildMetaBlock(seo);
  const html = template.replace("<!--SEO_INJECT-->", metaBlock);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", seo.cache);
  res.setHeader("X-VREAD-Renderer", "api-render");
  if (seo.noindex) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }
  res.status(seo.status || 200).send(html);
}
