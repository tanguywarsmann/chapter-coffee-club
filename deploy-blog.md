# Déploiement Blog vread.fr

## Fichiers modifiés
- `vercel.json` : Configuration Vercel pour SPA + redirects vread.blog → vread.fr/blog
- Navigation déjà correcte (`/blog`)
- Sitemap déjà configuré

## Commandes de déploiement

```bash
# Commit des changements
git add vercel.json
git commit -m "feat: configure Vercel for blog SPA routing and redirect vread.blog to vread.fr/blog

- Add vercel.json with React Router rewrites for /blog routes
- Configure permanent redirects from vread.blog to vread.fr/blog
- Set up proper cache headers for sitemap.xml and robots.txt
- Enable fallback SPA routing for all unknown routes"

# Push vers production
git push origin main
```

## Vérification post-déploiement

1. **Routes SPA** : `https://vread.fr/blog/votre-slug` → 200 (pas 404)
2. **Redirects** : `https://vread.blog` → `https://vread.fr/blog` (301)
3. **Sitemap** : `https://vread.fr/sitemap.xml` contient `/blog` et les articles
4. **SEO** : Vérifier Search Console pour les nouvelles URLs

## Test local

```bash
# Simuler la config Vercel en local
npm run build
npm run preview
```

Tester : `http://localhost:4173/blog/votre-slug`