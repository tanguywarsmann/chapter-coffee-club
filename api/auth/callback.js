export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing OAuth code' });
  }

  const clientId     = process.env.CMS_GITHUB_CLIENT_ID;
  const clientSecret = process.env.CMS_GITHUB_CLIENT_SECRET;
  const siteUrl      = process.env.NEXT_PUBLIC_SITE_URL;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'OAuth credentials not configured' });
  }

  try {
    // Échange code ↔ token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept:        'application/json',
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || tokenData.error });
    }

    // ---------- Page HTML renvoyée à la popup ----------
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Authentication Success</title>
  <style>
    body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
           display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5; }
    .success { text-align:center;background:white;padding:2rem;border-radius:8px;
               box-shadow:0 2px 10px rgba(0,0,0,0.1); }
    .spinner { border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;
               width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 20px; }
    @keyframes spin { 0%{transform:rotate(0)}100%{transform:rotate(360deg)} }
  </style>
</head>
<body>
  <div class="success">
    <div class="spinner"></div>
    <h2>Authentification réussie !</h2>
    <p>Retour vers Decap CMS…</p>
  </div>

<script>
(function () {
  /* Objet complet attendu par Decap CMS */
  const payload = {
    token: "${tokenData.access_token}",
    provider: "github"
  };

  /* 1 — postMessage normal */
  if (window.opener) {
    window.opener.postMessage(
      "authorization:github:success:" + JSON.stringify(payload),
      "*"          // accepte prod + previews
    );
  }

  /* 2 — Fallback : on écrit la même valeur dans localStorage */
  try {
    localStorage.setItem("decap-cms-user",  JSON.stringify(payload));   // clé Décap ≥ 3
    localStorage.setItem("netlify-cms-user", JSON.stringify(payload));  // rétro-compat
  } catch (_) { /* quota errors ignorés */ }

  /* 3 — Fin du flux */
  if (window.opener) {
    window.close();
  } else {
    window.location.href = "/blog-admin/";
  }
})();
</script>

</body>
</html>`;
    // -----------------------------------------------------

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
