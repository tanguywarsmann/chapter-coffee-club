
export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Code manquant' });
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_CMS_GITHUB_CLIENT_ID || 'Iv23liVjLsbYaPRxqTPf',
      client_secret: process.env.CMS_GITHUB_CLIENT_SECRET,
      code,
    });

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        Accept: 'application/json',
        'User-Agent': 'READ-CMS'
      },
      body: params,
    });

    const data = await response.json();

    if (data.error) {
      console.error('Erreur GitHub OAuth:', data);
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
