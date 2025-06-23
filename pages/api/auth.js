export default async function handler(req, res) {
  const { code } = req.query;
  const params = new URLSearchParams({
    client_id:  process.env.NEXT_PUBLIC_CMS_GITHUB_CLIENT_ID,
    client_secret: process.env.CMS_GITHUB_CLIENT_SECRET,
    code,
  });

  const gh = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: params,
  }).then(r => r.json());

  if (gh.error) return res.status(400).json(gh);
  res.redirect(`/admin/#access_token=${gh.access_token}&token_type=bearer`);
}
