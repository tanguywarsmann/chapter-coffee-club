
# Administration Blog READ

## Installation et Configuration

### 1. Authentification GitHub
Pour que l'administration fonctionne, vous devez configurer l'authentification GitHub :

1. Allez sur GitHub > Settings > Developer settings > OAuth Apps
2. Créez une nouvelle OAuth App avec :
   - **Application name** : READ Blog Admin
   - **Homepage URL** : `https://votre-site.lovable.app` (remplacez par votre URL)
   - **Authorization callback URL** : `https://api.netlify.com/auth/done`

3. Copiez le `Client ID` généré
4. Modifiez le fichier `config.yml` pour ajouter :
   ```yaml
   backend:
     name: github
     repo: tanguywarsmann/chapter-coffee-club
     branch: main
     client_id: VOTRE_CLIENT_ID_ICI
   ```

### 2. Accès à l'interface
- URL : `/blog-admin/index.html`
- L'interface sera entièrement séparée du reste de l'application
- Les articles seront stockés dans le dossier `content/blog/`
- Les images seront stockées dans `public/images/blog/`

### 3. Structure des articles
Chaque article aura :
- Titre, date, description
- Image de couverture (optionnelle)
- Auteur (par défaut "READ")
- Tags (optionnels)
- Statut publié/brouillon
- Contenu en Markdown

### 4. Troubleshooting
Si le bouton "Login with GitHub" n'apparaît pas :
1. Vérifiez que votre OAuth App est bien configurée
2. Vérifiez que le `client_id` est correct dans `config.yml`
3. Vérifiez que votre repository est accessible
4. Rechargez la page avec Ctrl+F5 (vider le cache)
