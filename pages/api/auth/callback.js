export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) {
    res.status(400).json({ error: 'Missing OAuth code' });
    return;
  }
  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: process.env.CMS_GITHUB_CLIENT_ID,
      client_secret: process.env.CMS_GITHUB_CLIENT_SECRET,
      code,
    }),
  }).then(x => x.json());

  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <script>
      window.opener.postMessage(${JSON.stringify(r)}, '*');
      window.close();
    </script>
  `);
}

