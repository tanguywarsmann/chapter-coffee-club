
/**
 * Configuration des routes publiques et privées
 * 
 * Routes publiques : accessibles sans authentification, indexables par les moteurs de recherche
 * Routes privées : nécessitent une authentification
 */

export const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/blog',
  '/auth',
  '/reset-password'
] as const;

export const PUBLIC_ROUTE_PATTERNS = [
  /^\/blog\/[^/]+$/, // /blog/:slug
  /^\/books\/[^/]+$/ // /books/:id (pages de livres publiques)
] as const;

export const STATIC_ASSETS = [
  '/sitemap.xml',
  '/robots.txt',
  '/favicon.ico',
  '/manifest.json',
  '/googlee0450f4f037a2935.html'
] as const;

/**
 * Vérifie si une route est publique (accessible sans authentification)
 */
export function isPublicRoute(pathname: string): boolean {
  // Routes statiques exactes
  if (PUBLIC_ROUTES.includes(pathname as any)) {
    return true;
  }
  
  // Patterns de routes dynamiques
  return PUBLIC_ROUTE_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Vérifie si une route est un asset statique
 */
export function isStaticAsset(pathname: string): boolean {
  return STATIC_ASSETS.some(asset => pathname === asset);
}

/**
 * Détermine si une route nécessite une authentification
 */
export function requiresAuth(pathname: string): boolean {
  return !isPublicRoute(pathname) && !isStaticAsset(pathname);
}

/**
 * Routes qui nécessitent une authentification
 */
export const PRIVATE_ROUTES = [
  '/home',
  '/discover',
  '/explore',
  '/reading-list',
  '/profile',
  '/achievements',
  '/admin'
] as const;

export const PRIVATE_ROUTE_PATTERNS = [
  /^\/profile\/[^/]+$/, // /profile/:userId
  /^\/u\/[^/]+$/, // /u/:userId
  /^\/followers\/[^/]+\/[^/]+$/ // /followers/:type/:userId
] as const;
