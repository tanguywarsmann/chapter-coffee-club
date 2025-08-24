
# Architecture des Routes Publiques et Privées

Cette documentation explique la séparation entre les zones publiques et privées de l'application READ.

## Routes Publiques (SEO-friendly)

### Pages accessibles sans authentification :
- `/` - Page d'accueil publique avec présentation de l'app
- `/blog` - Liste des articles de blog
- `/blog/:slug` - Pages individuelles des articles
- `/auth` - Page de connexion/inscription
- `/reset-password` - Réinitialisation de mot de passe
- `/books/:id` - Pages publiques des livres (pour le SEO)

### Assets statiques publics :
- `/sitemap.xml`
- `/robots.txt`
- `/favicon.ico`
- `/manifest.webmanifest`
- `/googlee0450f4f037a2935.html`

## Routes Privées (Authentification requise)

### Fonctionnalités utilisateur :
- `/home` - Tableau de bord personnel
- `/profile/:userId?` - Profil utilisateur
- `/u/:userId` - Profil public d'un utilisateur
- `/discover` - Découverte d'utilisateurs
- `/reading-list` - Liste de lecture personnelle
- `/explore` - Exploration de livres
- `/achievements` - Accomplissements et badges
- `/followers/:type/:userId?` - Gestion des abonnés
- `/admin` - Panel d'administration

## Structure du Code

### Fichiers clés :
- `src/utils/publicRoutes.ts` - Configuration des routes
- `src/components/layout/PublicLayout.tsx` - Layout pour pages publiques
- `src/components/layout/PublicHeader.tsx` - Header simplifié pour public
- `src/components/navigation/AppRouter.tsx` - Routeur principal
- `src/pages/PublicHome.tsx` - Page d'accueil SEO-optimisée

### Fonctions utilitaires :
- `isPublicRoute(pathname)` - Vérifie si une route est publique
- `requiresAuth(pathname)` - Vérifie si auth requise
- `isStaticAsset(pathname)` - Vérifie si c'est un asset statique

## SEO et Indexation

### Optimisations mises en place :
- Pas de redirection vers `/auth` pour les routes publiques
- Meta-tags SEO complets sur toutes les pages publiques
- JSON-LD structuré pour Google
- Sitemap dynamique incluant les articles de blog
- Headers appropriés pour les crawlers

### Pour ajouter une nouvelle route publique :
1. Ajouter la route dans `PUBLIC_ROUTES` ou `PUBLIC_ROUTE_PATTERNS`
2. Créer la page avec les meta-tags SEO appropriés
3. Utiliser `PublicLayout` si nécessaire
4. Mettre à jour le sitemap si pertinent

### Pour ajouter une nouvelle route privée :
1. Ajouter la route dans le routeur avec `<AuthGuard>`
2. S'assurer que la page gère correctement l'état d'authentification
3. Utiliser le header principal avec `<AppHeader>`
