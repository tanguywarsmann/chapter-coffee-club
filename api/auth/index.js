
export default function handler(req, res) {
  // Configuration OAuth GitHub
  const clientId = process.env.CMS_GITHUB_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (!clientId) {
    return res.status(500).json({ error: 'CMS_GITHUB_CLIENT_ID not configured' });
  }
  
  if (!siteUrl) {
    return res.status(500).json({ error: 'NEXT_PUBLIC_SITE_URL not configured' });
  }
  
  // URL de callback
  const redirectUri = `${siteUrl}/api/auth/callback`;
  
  // Construire l'URL d'autorisation GitHub avec scopes pour Decap CMS
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'repo read:user'); // Scopes requis pour Decap CMS
  
  console.log('[OAUTH] Redirecting to GitHub with scopes: repo read:user');
  
  // Redirection vers GitHub
  res.redirect(302, authUrl.toString());
}
