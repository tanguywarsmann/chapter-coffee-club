// Security headers configuration
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for React dev mode
    "style-src 'self' 'unsafe-inline'", // Needed for Tailwind
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://xjumsrjuyzvsixvfwoiz.supabase.co wss://xjumsrjuyzvsixvfwoiz.supabase.co",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Apply security headers (for Vite development)
if (typeof document !== 'undefined') {
  // Add meta tags for CSP in development
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = securityHeaders['Content-Security-Policy'];
  document.head.appendChild(cspMeta);
}