
export default function handler(req, res) {
  // Set proper headers to ensure JSON response
  res.setHeader('Content-Type', 'application/json');
  
  res.json({
    id: process.env.CMS_GITHUB_CLIENT_ID || 'MISSING',
    secret: process.env.CMS_GITHUB_CLIENT_SECRET 
      ? process.env.CMS_GITHUB_CLIENT_SECRET.slice(0, 4) + '…'
      : 'MISSING',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'MISSING',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    debug: 'Environment variables check endpoint'
  });
}
