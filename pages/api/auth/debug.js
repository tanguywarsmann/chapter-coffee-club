
export default function handler(req, res) {
  res.json({
    id: process.env.CMS_GITHUB_CLIENT_ID || 'MISSING',
    secret: process.env.CMS_GITHUB_CLIENT_SECRET 
      ? process.env.CMS_GITHUB_CLIENT_SECRET.slice(0, 4) + '…'
      : 'MISSING',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'MISSING',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
