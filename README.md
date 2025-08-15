# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/96648d18-46e6-4470-859c-132d87266a72

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/96648d18-46e6-4470-859c-132d87266a72) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/96648d18-46e6-4470-859c-132d87266a72) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## SEO Brand Guard

This project includes an automated SEO monitoring system that validates brand consistency and critical SEO elements.

### Running locally

```bash
BASE_URL=https://www.vread.fr ./scripts/brand-guard.sh
```

### SEO Brand Guard (local)
macOS utilise un Bash 3.2 (sans `mapfile`). Le script inclut un fallback et peut être lancé :

```bash
./scripts/brand-guard.sh
# ou, si vous préférez le Bash Homebrew :
/opt/homebrew/bin/bash ./scripts/brand-guard.sh   # Apple Silicon
/usr/local/bin/bash ./scripts/brand-guard.sh      # Intel
```

En CI (GitHub Actions), Bash ≥ 5 est disponible par défaut.

### Slack notifications (optional)

To receive failure notifications in Slack, add the `SLACK_WEBHOOK_URL` secret in your GitHub repository settings.

### What the monitor checks

1. **HTTP Status 200** for key pages: `/`, `/blog`, `/a-propos`, `/presse`
2. **Apex redirect**: `https://vread.fr/` redirects to `https://www.vread.fr/` in ≤1 hop
3. **Sitemap validation**: 
   - Accessible at `/sitemap.xml` with XML content-type
   - All URLs start with `https://www.vread.fr/`
   - All sitemap URLs return HTTP 200
4. **Robots.txt**: References correct sitemap and contains `/blog-admin/` disallow
5. **Home page SEO**: Canonical URL, Open Graph URL, JSON-LD WebSite/Organization schemas
6. **Security headers**: CSP, X-Frame-Options, Referrer-Policy, X-Content-Type-Options, HSTS
7. **Googlebot access**: Home page returns 200 for Googlebot user agent
