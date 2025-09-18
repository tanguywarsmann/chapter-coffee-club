import { test, expect } from '@playwright/test';

test('sitemap.xml returns 200 and has urlset', async ({ request }) => {
  const res = await request.get('https://www.vread.fr/sitemap.xml');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain('<urlset');
  expect(body).toContain('/blog');
});

test('news-sitemap.xml returns 200 and has news namespace', async ({ request }) => {
  const res = await request.get('https://www.vread.fr/news-sitemap.xml');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
});