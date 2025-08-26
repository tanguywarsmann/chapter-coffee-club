# Audit SEO et Branding - VREAD

**Objectif**: Éliminer la suggestion "Essayez avec bread" sur Google en consolidant les signaux de marque VREAD.

## 1. Analyse des balises et schémas par page

### Page d'accueil (/) - Landing/PublicHome
- **Title**: `VREAD — L'appli qui t'accompagne dans ta lecture, page après page`
- **Meta description**: OK, cohérente avec VREAD
- **og:site_name**: `VREAD` (ligne 45, src/pages/PublicHome.tsx)
- **application-name**: MANQUANT - aucune balise trouvée
- **Canonical**: `https://www.vread.fr/`
- **JSON-LD**: WebApplication présent (lignes 51-66, src/pages/PublicHome.tsx)
  - name: "VREAD"
  - url: "https://www.vread.fr"
  - applicationCategory: "EducationalApplication"

### Page Blog (/blog)
- **Title**: `Blog VREAD — Découvrez nos articles sur la lecture`
- **og:site_name**: MANQUANT
- **Canonical**: `https://www.vread.fr/blog`
- **JSON-LD**: Blog + Organization (lignes 71-96, src/pages/Blog.tsx)
  - name: "Blog VREAD"
  - publisher: Organization "VREAD" avec url "https://www.vread.fr"

### Articles de blog (/blog/:slug)
- **Title**: `{post.title} - Blog VREAD`
- **og:site_name**: MANQUANT
- **Canonical**: `https://www.vread.fr/blog/{slug}`
- **JSON-LD**: Article présent (lignes 92-117, src/pages/BlogPost.tsx)
  - publisher: Organization "VREAD"

### Page À propos (/a-propos)
- **Title**: `À propos | VREAD`
- **og:site_name**: MANQUANT
- **Canonical**: `https://www.vread.fr/a-propos`
- **JSON-LD**: Organization (lignes 16-23, src/pages/About.tsx)
  - name: "VREAD"
  - url: "https://www.vread.fr/"

### Page Presse (/presse)
- **Title**: `Presse | VREAD`
- **og:site_name**: MANQUANT
- **Canonical**: `https://www.vread.fr/presse`
- **JSON-LD**: Organization (lignes 16-23, src/pages/Press.tsx)
  - name: "VREAD"
  - url: "https://www.vread.fr/"

### Page d'authentification (/auth)
- **SEO**: Aucune balise SEO détectée

### Pages de livres (/book/:id)
- **SEO**: Aucune balise SEO détectée dans BookPage.tsx
- **BookSchema.tsx** existe mais utilise "READ" (ligne 25) au lieu de "VREAD"

## 2. Analyse du Manifest/PWA/Favicons

### Configuration actuelle
- **index.html**: Favicons VREAD configurés correctement (lignes 22-26)
- **vite.config.ts**: VitePWA configuré (lignes 18-55)
  - name: 'VREAD'
  - short_name: 'VREAD'
  - manifest généré: `/manifest.webmanifest`
  - Icônes: vread-logo-192.png et vread-logo-512.png avec purpose "any maskable"

### Icônes disponibles dans /public/branding/
- vread-favicon.svg
- vread-favicon-32.png
- vread-favicon-16.png
- vread-apple-touch-icon.png
- vread-logo-192.png
- vread-logo-512.png
- vread-logo-maskable-512.png
- vread-logo.svg
- vread-logo-1024-q80.webp

## 3. Cohérence de marque dans le code

### Occurrences de la marque
- **"VREAD"**: Forme canonique correcte utilisée majoritairement
- **"READ"**: Résidus détectés dans:
  - src/components/seo/BookSchema.tsx ligne 25: `"name": "READ"`
  - src/components/admin/BlogEditor.tsx ligne 68: `author: "READ"`
  - Quelques références à "read" (minuscule) dans les textes/descriptions

### Alt text des images
- Logo VREAD: `alt="VREAD logo"` (cohérent)
- Autres images: descriptions appropriées

## 4. Canonicalisation et domaines

### Domaine canonique
- **Choix**: `https://www.vread.fr/` (avec www)
- **Cohérence**: Toutes les URLs absolues utilisent www.vread.fr
- **vercel.json**: Redirections correctes vers www (lignes 10-14)

### URLs codées en dur
- Toutes pointent vers `https://www.vread.fr/` (cohérent)

## 5. Robots/Sitemap

### robots.txt
- **Contenu**: Autorise tout (`Allow: /`)
- **Sitemap**: `https://www.vread.fr/sitemap.xml`
- **Disallow**: `/blog-admin/` (correct)

### sitemap.xml
- **Pages statiques**:
  - / (priority: 1.0)
  - /blog (priority: 0.8)
  - /a-propos (priority: 0.6)
  - /presse (priority: 0.6)
- **Générateur dynamique**: src/utils/sitemapServer.ts existe

## 6. Route de recherche interne

### État actuel
- **Route /search**: NON TROUVÉE dans AppRouter.tsx
- **Composant SearchBar**: Existe mais pas de route dédiée
- **Paramètre search**: Non configuré pour les moteurs

## 7. Points critiques détectés

### Manques majeurs
1. **application-name** manquant partout
2. **og:site_name** manquant sur la plupart des pages
3. **Route /search** absente
4. **Schéma Organization global** incomplet (manque sameAs, logo)
5. **Schéma WebSite** avec searchAction manquant

### Incohérences
1. **"READ" vs "VREAD"** dans BookSchema et BlogEditor
2. **Balises SEO manquantes** sur les pages privées importantes (auth, book pages)

### Opportunités d'amélioration  
1. **JSON-LD Organization global** avec profils sociaux
2. **WebSite schema** avec action de recherche
3. **Unification og:site_name** partout
4. **application-name** standardisé

## 8. Actions prioritaires recommandées

1. Corriger "READ" → "VREAD" dans BookSchema et BlogEditor
2. Ajouter application-name sur toutes les pages
3. Ajouter og:site_name manquant
4. Créer route /search avec paramètre q
5. Implémenter JSON-LD Organization global avec sameAs
6. Ajouter WebSite schema avec searchAction
7. Ajouter SEO sur les pages importantes (auth, books)