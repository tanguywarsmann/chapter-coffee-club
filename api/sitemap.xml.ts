export const config = { runtime: 'edge' };
const LA = String.fromCharCode(60), RA = String.fromCharCode(62);
function escapeXml(s:string){return String(s).replace(/[<>&'"]/g,c=>c==='<'?'&lt;':c==='>'?'&gt;':c==='&'?'&amp;':c==="'"?'&apos;':c==='"'?'&quot;':c);}
export default async function handler(){
  const BASE = process.env.SITEMAP_BASE || 'https://www.vread.fr';
  const url = process.env.SITEMAP_SUPABASE_URL!; const key = process.env.SITEMAP_SUPABASE_KEY!;
  const qs = new URL(`${url}/rest/v1/blog_posts`);
  qs.searchParams.set('select','slug,updated_at,created_at,published');
  qs.searchParams.set('published','eq.true'); qs.searchParams.set('order','updated_at.desc'); qs.searchParams.set('limit','10000');
  const res = await fetch(qs.toString(), { headers:{apikey:key, Authorization:`Bearer ${key}`}, cache:'no-store' });
  if(!res.ok) return new Response('Upstream error',{status:502});
  const rows = await res.json();
  const now = new Date().toISOString();
  const urls = [
    { loc: `${BASE}/`, lastmod: now },
    { loc: `${BASE}/blog`, lastmod: now },
    ...rows.map((r:any)=>({ loc: `${BASE}/blog/${r.slug}`, lastmod: new Date(r.updated_at||r.created_at||now).toISOString() }))
  ];
  const head = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- vread-sitemap-v2 -->`;
  const open = `${LA}urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${RA}`;
  const close = `${LA}/urlset${RA}`;
  const body = urls.map(u=>`${LA}url${RA}${LA}loc${RA}${escapeXml(u.loc)}${LA}/loc${RA}${LA}lastmod${RA}${u.lastmod}${LA}/lastmod${RA}${LA}/url${RA}`).join('\n');
  const xml = `${head}\n${open}\n${body}\n${close}`;
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'s-maxage=3600, stale-while-revalidate=86400'}});
}