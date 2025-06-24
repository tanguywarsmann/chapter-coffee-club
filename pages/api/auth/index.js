
export default async function handler(req, res) {
  try {
    console.log('Route /api/auth appelée');
    
    // Vérification des variables d'environnement
    const clientId = process.env.CMS_GITHUB_CLIENT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    if (!clientId) {
      console.error('CMS_GITHUB_CLIENT_ID manquant');
      return res.status(500).json({ error: 'Configuration OAuth manquante' });
    }
    
    if (!siteUrl) {
      console.error('NEXT_PUBLIC_SITE_URL manquant');
      return res.status(500).json({ error: 'Site URL non configuré' });
    }
    
    // Construction de l'URL de redirection OAuth GitHub
    const redirectUri = `${siteUrl}/api/auth/callback`;
    const githubAuthUrl = 
      `https://github.com/login/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=repo&` +
      `state=${Math.random().toString(36).substring(7)}`;
    
    console.log('Redirection vers GitHub OAuth:', githubAuthUrl);
    
    // Redirection vers GitHub
    res.writeHead(302, { Location: githubAuthUrl });
    res.end();
    
  } catch (error) {
    console.error('Erreur dans /api/auth:', error);
    res.status(500).json({ error: 'Erreur serveur OAuth' });
  }
}
