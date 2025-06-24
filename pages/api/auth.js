export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Code manquant' });
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_CMS_GITHUB_CLIENT_ID || 'Ov23li9LyDzFWSxwzUXH',
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

    // Redirection vers la page d'authentification avec le token
    const redirectUrl = `/blog-admin/auth.html#access_token=${data.access_token}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Erreur dans le proxy auth:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
