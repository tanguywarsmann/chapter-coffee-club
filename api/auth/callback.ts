
export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing OAuth code' });
  }

  const clientId     = process.env.CMS_GITHUB_CLIENT_ID;
  const clientSecret = process.env.CMS_GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'OAuth credentials not configured' });
  }

  try {
    /* --------- échange code ↔ token --------- */
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept:        'application/json',
        'Content-Type':'application/json',
      },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: clientSecret,
        code,
        scope: 'repo read:user', // Scopes pour Decap CMS
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || tokenData.error });
    }

    /* --------- HTML renvoyé dans la popup --------- */
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Authentication Success</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
         display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5}
    .box{background:#fff;padding:2rem;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,.1);text-align:center}
    .spinner{border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;width:40px;height:40px;
             animation:spin 1s linear infinite;margin:0 auto 20px}
    @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <h2>Authentification réussie !</h2>
    <p>Communication avec Decap CMS en cours...</p>
  </div>

  <script>
  (function () {
    /* Payload exact que Decap attend */
    const payload = {
      token: "${tokenData.access_token}",
      provider: "github",
      expires_at: Math.floor(Date.now() / 1000) + (${tokenData.expires_in || 3600})
    };

    /* Stockage local immédiat */
    try {
      localStorage.setItem("decap-cms-user", JSON.stringify(payload));
      localStorage.setItem("netlify-cms-user", JSON.stringify(payload));
    } catch (err) {
      console.error('Error storing in localStorage:', err);
    }

    /* Envoi du message au parent */
    if (window.opener) {
      try {
        const message = "authorization:github:" + JSON.stringify(payload);
        window.opener.postMessage(message, "*");
        
        // Fermer la popup après un délai
        setTimeout(() => {
          window.close();
        }, 1000);
      } catch (error) {
        console.error('Error sending postMessage:', error);
      }
    } else {
      // Si pas d'opener, rediriger vers l'admin
      window.location.href = "/blog-admin/";
    }
  })();
  </script>
</body>
</html>
`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
