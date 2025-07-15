# Blog Routing Fix - Deployment Guide

## Changes Made

### 1. Fixed Route Blocking in main.tsx
- Added `/blog` to allowed routes in `allowedStart` array
- Changed logic to use `startsWith()` to handle `/blog/:slug` paths

### 2. Updated vercel.json
- Kept minimal rewrites for `/blog` routes
- Fixed redirect from `vread.blog` to preserve path structure

## Deployment Commands

```bash
# Commit changes
git add .
git commit -m "fix: enable direct access to /blog routes without redirect to home"

# Push to deploy
git push origin main
```

## Testing

After deployment, test these URLs:

```bash
# Direct blog access should return 200 and show blog
curl -I https://vread.fr/blog

# Blog post access should work
curl -I https://vread.fr/blog/2025-06-23-article-test

# Old domain should redirect
curl -I https://vread.blog
```

Expected: All should return 200 OK and display correct content, no redirect to home page.

## What was fixed

The main issue was in `src/main.tsx` where `/blog` routes were being reset to `/` because they weren't in the `allowedStart` array. This caused any direct navigation to `/blog` to redirect to the home page instead of showing the blog content.