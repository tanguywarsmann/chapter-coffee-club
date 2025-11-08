
# Configuration Blog Admin

## Étapes pour activer l'administration du blog :

### 1. Configurer GitHub
Dans le fichier `config.yml`, remplacez :
```
repo: YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME
```
Par votre vraie information GitHub, par exemple :
```
repo: moncompte/mon-blog-read
```

### 2. Connecter le projet à GitHub
- Dans Lovable, cliquez sur le bouton GitHub en haut à droite
- Suivez les instructions pour connecter votre repository

### 3. Configurer l'authentification GitHub
Dans votre repository GitHub :
- Allez dans Settings > Developer settings > OAuth Apps
- Créez une nouvelle OAuth App avec :
  - Homepage URL : votre URL Lovable (ex: https://votreapp.lovable.app)
  - Authorization callback URL : https://api.netlify.com/auth/done

### 4. Accéder à l'admin
- Allez sur `/admin` de votre application
- Cliquez sur "Login with GitHub"
- Autorisez l'accès

## Troubleshooting
Si le bouton "Login with GitHub" n'apparaît pas :
1. Vérifiez que `config.yml` contient votre vrai repository GitHub
2. Vérifiez que votre projet est connecté à GitHub dans Lovable
3. Rechargez la page `/admin`
