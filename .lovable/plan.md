

# Plan: Universal SEO Renderer via Vercel Serverless Function

## Problem

VREAD is a Vite SPA. The initial HTML served for ALL routes is the same `index.html` with `<title>VREAD</title>` and zero SEO tags. All metadata injected by `react-helmet-async` is invisible to crawlers.

## Architecture

```text
Request
  ├── /sitemap.xml, /news-sitemap.xml → existing API functions
  ├── /api/* → existing API functions  
  ├── Accept: text/html → api/render.ts → HTML with injected SEO metas
  └── Everything else (JS/CSS/images/fonts) → static CDN (index.html fallback)
```

Vercel `has` condition on the `Accept` header routes only HTML requests to the renderer. No fragile asset list needed.

## Files to Create

### 1. `api/render.ts` (~200 lines)

Vercel Serverless Function that:
- Reads `api/_template.html` via `fs.readFileSync` (embedded template)
- Determines pathname from `req.url`
- Looks up a static SEO map for known routes: `/`, `/blog`, `/a-propos`, `/presse`, `/ia`, `/duolingo`, `/strava`
- For `/blog/:slug`: fetches Supabase `blog_posts` table (title, excerpt, image_url, author, published_at, updated_at) with 3s timeout
  - Slug not found → 404 + `noindex` + no canonical
- HTML-escapes title/description
- Generates JSON-LD via `JSON.stringify()` (Organization + WebSite on `/`, Article on `/blog/:slug`)
- Injects metas by replacing `<!--SEO_INJECT-->` marker in template
- Sets Cache-Control headers:
  - Static routes: `s-maxage=86400, stale-while-revalidate=604800`
  - `/blog/:slug`: `s-maxage=900, stale-while-revalidate=604800`
  - 404: `s-maxage=60`
- Content-Type: `text/html; charset=utf-8`

### 2. `api/_template.html`

Copy of `index.html` with `<!--SEO_INJECT-->` marker added before `</head>`. The `<title>VREAD</title>` line removed (will be injected dynamically). The `<script type="module" src="/src/main.tsx">` remains as-is (Vite dev), but in production Vercel serves the built `dist/index.html` for static assets.

**Sync strategy**: Add a `postbuild` npm script: `"postbuild": "cp dist/index.html api/_template.html && sed -i 's|</head>|<!--SEO_INJECT--></head>|' api/_template.html"`. This ensures the template always has the correct built asset references. For dev, `api/_template.html` is committed with the source `index.html` content and the marker.

### 3. `public/og/vread-og-default.png`

A 1200x630 default OG image. Since we cannot generate a real PNG in Lovable, we will create a simple SVG-based placeholder and document it for replacement. In the meantime, we use the existing `https://www.vread.fr/branding/vread-logo-512.png` as og:image fallback, and create the `/og/` directory with a `.gitkeep` noting the user should add a real 1200x630 image.

## Files to Modify

### 4. `vercel.json`

Add conditional rewrite with `has` header and 301 redirect for non-www:

```json
{
  "redirects": [
    {
      "source": "/:path(.*)",
      "has": [{ "type": "host", "value": "vread.fr" }],
      "destination": "https://www.vread.fr/:path*",
      "statusCode": 301
    }
  ],
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "/api/sitemap.xml" },
    { "source": "/news-sitemap.xml", "destination": "/api/news-sitemap.xml" },
    { "source": "/api/:path*", "destination": "/api/:path*" },
    {
      "source": "/:path*",
      "has": [{ "type": "header", "key": "accept", "value": "text/html" }],
      "destination": "/api/render"
    },
    { "source": "/:path*", "destination": "/index.html" }
  ],
  "headers": [ ... existing unchanged ... ]
}
```

### 5. `index.html`

Add `<!--SEO_INJECT-->` marker before `</head>` and add default homepage meta tags as fallback (for dev mode and if api/render fails). Remove duplicate `<title>VREAD</title>` since it will be injected.

### 6. `package.json`

Add `postbuild` script to sync template.

### 7. `src/pages/IA.tsx`

Fix all `vread.fr` → `www.vread.fr` in canonical, og:url, and JSON-LD URLs (lines 9, 16-17, 27, 95, 103-104, 128, 236, 248).

## SEO Map (hardcoded in api/render.ts)

| Route | title | description | og:type | JSON-LD |
|-------|-------|-------------|---------|---------|
| / | VREAD, le Strava de la lecture \| Suivi, validation, badges | Valide ta lecture par segments grace a des questions rapides. Suivi, series, badges et progression. Disponible iOS et Android. | website | Organization + WebSite |
| /blog | Blog VREAD \| Conseils et methodes pour mieux lire | Decouvrez des conseils scientifiques et des methodes concretes pour ameliorer votre lecture. | website | — |
| /blog/:slug | {post.title} \| VREAD Blog | {post.excerpt} | article | Article |
| /a-propos | VREAD - A propos \| L'app qui transforme votre lecture | Decouvrez VREAD, l'application qui gamifie votre lecture avec des questions IA et un systeme de progression. | website | — |
| /presse | Espace Presse \| VREAD | Kit media, logos, visuels et contact presse VREAD. | website | Organization |
| /ia | VREAD \| Strava de la lecture : suivi avec preuve de lecture | VREAD est l'application Strava de la lecture. Suivi par segments et validation par question. | website | Organization + SoftwareApplication + FAQ |
| /duolingo | VREAD et Duolingo : Quelle app pour le francais ? | Comparaison complete entre VREAD et Duolingo pour apprendre le francais par la lecture. | article | Article |
| /strava | Le Strava de la lecture : VREAD | Decouvrez VREAD, qui applique le tracking et la motivation de Strava a la lecture. | article | Article |

All with canonical `https://www.vread.fr/...`, og:image = `https://www.vread.fr/branding/vread-logo-512.png` (until real 1200x630 exists), twitter:card = `summary_large_image`.

## 5 Validation Tests

After deployment, run:

**TEST 1** — Metas in initial HTML:
```bash
curl -sL https://www.vread.fr/ | grep -iE "<title>|description|canonical|og:|twitter:"
```

**TEST 2** — Assets served statically:
```bash
ASSET=$(curl -sL https://www.vread.fr/ | grep -oE 'src="/assets/[^"]+"' | head -1 | sed 's/src="//;s/"//')
curl -I "https://www.vread.fr$ASSET" | grep content-type
# Expected: application/javascript, NOT text/html
```

**TEST 3** — No duplicate metas:
```bash
curl -sL https://www.vread.fr/ | grep -i "<title>" | wc -l   # Expected: 1
curl -sL https://www.vread.fr/ | grep -i 'property="og:title"' | wc -l  # Expected: 1
```

**TEST 4** — 404 on unknown slug:
```bash
curl -I https://www.vread.fr/blog/slug-qui-n-existe-pas  # Expected: 404
curl -sL https://www.vread.fr/blog/slug-qui-n-existe-pas | grep -i "noindex"  # Expected: present
```

**TEST 5** — Non-www redirect:
```bash
curl -I http://vread.fr/ | grep -i location  # Expected: https://www.vread.fr/...
```

## Scope

- 3 files created: `api/render.ts`, `api/_template.html`, `public/og/.gitkeep`
- 4 files modified: `vercel.json`, `index.html`, `package.json`, `src/pages/IA.tsx`
- Zero UI changes, zero DB migration

