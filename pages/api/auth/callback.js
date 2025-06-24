
export default async function handler(req, res) {
  try {
    console.log('Route /api/auth/callback appelée');
    
    const { code, error, error_description } = req.query;
    
    // Gestion des erreurs OAuth
    if (error) {
      console.error('Erreur OAuth GitHub:', error, error_description);
      return res.status(400).json({ 
        error: 'OAuth refusé', 
        description: error_description 
      });
    }
    
    if (!code) {
      console.error('Code OAuth manquant');
      return res.status(400).json({ error: 'Code d\'autorisation manquant' });
    }
    
    // Vérification des variables d'environnement
    const clientId = process.env.CMS_GITHUB_CLIENT_ID;
    const clientSecret = process.env.CMS_GITHUB_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('Variables OAuth manquantes:', { 
        hasClientId: !!clientId, 
        hasClientSecret: !!clientSecret 
      });
      return res.status(500).json({ error: 'Configuration OAuth incomplète' });
    }
    
    // Échange du code contre un token d'accès
    console.log('Échange du code OAuth avec GitHub...');
    
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Decap-CMS-OAuth'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Erreur échange token GitHub:', tokenData);
      return res.status(400).json({ 
        error: 'Échec échange token', 
        details: tokenData 
      });
    }
    
    console.log('Token OAuth obtenu avec succès');
    
    // Redirection vers la page d'authentification avec le token
    const redirectUrl = `/blog-admin/auth.html#access_token=${tokenData.access_token}&token_type=${tokenData.token_type || 'bearer'}`;
    
    res.writeHead(302, { Location: redirectUrl });
    res.end();
    
  } catch (error) {
    console.error('Erreur dans /api/auth/callback:', error);
    res.status(500).json({ error: 'Erreur serveur callback' });
  }
}
