
export default async function handler(req, res) {
  const { code } = req.query;
  
  console.log('Route /api/auth/callback appelée avec code:', code ? 'présent' : 'absent');
  
  if (!code) {
    console.error('Code manquant dans callback');
    return res.status(400).json({ error: 'Code manquant' });
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_CMS_GITHUB_CLIENT_ID || 'Ov23li9LyDzFWSxwzUXH',
      client_secret: process.env.CMS_GITHUB_CLIENT_SECRET,
      code,
    });

    console.log('Callback - Échange de token avec GitHub...');

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        Accept: 'application/json',
        'User-Agent': 'READ-CMS'
      },
      body: params,
    });

    const data = await response.json();
    
    console.log('Callback - Réponse GitHub OAuth:', data.error ? 'Erreur' : 'Succès');

    if (data.error) {
      console.error('Erreur GitHub OAuth dans callback:', data);
      return res.status(400).json(data);
    }

    // Retourner directement le token pour Decap CMS
    res.json({
      access_token: data.access_token,
      token_type: 'bearer'
    });
  } catch (error) {
    console.error('Erreur dans le proxy callback:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
