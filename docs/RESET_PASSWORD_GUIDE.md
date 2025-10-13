# Guide de configuration - Réinitialisation de mot de passe

## Configuration Supabase requise

Pour que le flux de réinitialisation de mot de passe fonctionne correctement, vous devez configurer les paramètres suivants dans votre projet Supabase.

### 1. URLs de redirection

Allez dans : **Dashboard Supabase** → **Authentication** → **URL Configuration**

#### Site URL
```
https://www.vread.fr
```

#### Redirect URLs (ajouter toutes ces URLs)
```
https://www.vread.fr/reset-password
https://vread.fr/reset-password
http://localhost:5173/reset-password
http://localhost:3000/reset-password
```

> ⚠️ **Important**: Ajoutez également les URLs de vos environnements de préproduction si applicable.

### 2. Template d'email

Allez dans : **Dashboard Supabase** → **Authentication** → **Email Templates** → **Reset Password**

Vérifiez que le template contient le lien de réinitialisation :
```
{{ .ConfirmationURL }}
```

Template recommandé :
```html
<h2>Réinitialisation de votre mot de passe VREAD</h2>

<p>Bonjour,</p>

<p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour continuer :</p>

<p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>

<p>Ce lien expirera dans 1 heure.</p>

<p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>

<p>L'équipe VREAD</p>
```

### 3. Configuration SMTP

Allez dans : **Dashboard Supabase** → **Project Settings** → **Auth** → **SMTP Settings**

Vérifiez que le SMTP est correctement configuré :
- ✅ Enable Custom SMTP
- ✅ Host configuré
- ✅ Port configuré (généralement 587)
- ✅ Username/Password configurés
- ✅ Sender email configuré

> 💡 **Astuce**: Testez l'envoi d'email depuis le dashboard Supabase avant de tester dans l'application.

### 4. Rate Limiting

Par défaut, Supabase limite les demandes de réinitialisation à :
- **4 demandes par heure** par adresse email
- **30 demandes par heure** par IP

Ces limites sont configurables dans : **Authentication** → **Rate Limits**

### 5. Token Expiration

Les tokens de réinitialisation expirent après **1 heure** par défaut.

Cette durée est configurable dans : **Authentication** → **Email** → **Password Recovery** → **Token Expiry**

## Variables d'environnement

Assurez-vous que ces variables sont définies :

### Production (`.env.production`)
```env
VITE_SITE_URL=https://www.vread.fr
VITE_SUPABASE_URL=https://xjumsrjuyzvsixvfwoiz.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

### Développement (`.env`)
```env
VITE_SITE_URL=http://localhost:5173
VITE_SUPABASE_URL=https://xjumsrjuyzvsixvfwoiz.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

## Vérification de la configuration

### Checklist complète

- [ ] Site URL configurée dans Supabase
- [ ] Redirect URLs ajoutées (prod + dev)
- [ ] Template d'email "Reset Password" activé
- [ ] SMTP configuré et fonctionnel
- [ ] Rate limits vérifiés
- [ ] Variables d'environnement définies
- [ ] Route `/reset-password` accessible
- [ ] Test d'envoi d'email réussi

### Test manuel

1. Aller sur `/auth`
2. Cliquer sur "Mot de passe oublié"
3. Saisir une adresse email valide
4. Vérifier la réception de l'email (peut prendre 1-2 minutes)
5. Cliquer sur le lien dans l'email
6. Vérifier que `/reset-password` s'affiche correctement
7. Saisir un nouveau mot de passe
8. Vérifier que la mise à jour réussit
9. Tester la connexion avec le nouveau mot de passe

### Résolution de problèmes

#### Email non reçu
1. Vérifier les logs SMTP dans Supabase : **Project Logs** → **Auth Logs**
2. Vérifier le dossier spam
3. Vérifier que l'email est bien validé dans Supabase
4. Tester avec un autre fournisseur d'email (Gmail, Outlook, etc.)

#### Lien invalide ou expiré
1. Vérifier que la redirect URL est bien configurée dans Supabase
2. Vérifier que le token n'a pas expiré (< 1h)
3. Vérifier les logs du navigateur (console)
4. Relancer une nouvelle demande de réinitialisation

#### "Password recovery session not found"
1. Vérifier que `onAuthStateChange` détecte bien `PASSWORD_RECOVERY`
2. Vérifier que `getSession()` retourne une session valide
3. Vérifier les logs de la console dans `ResetPassword.tsx`

## Liens utiles

- [Documentation Supabase - Password Recovery](https://supabase.com/docs/guides/auth/auth-password-reset)
- [Dashboard Supabase - Authentication](https://supabase.com/dashboard/project/xjumsrjuyzvsixvfwoiz/auth/users)
- [Dashboard Supabase - Email Templates](https://supabase.com/dashboard/project/xjumsrjuyzvsixvfwoiz/auth/templates)
- [Dashboard Supabase - SMTP Settings](https://supabase.com/dashboard/project/xjumsrjuyzvsixvfwoiz/settings/auth)

## Support

En cas de problème persistant :
1. Consultez les logs Supabase
2. Vérifiez la checklist ci-dessus
3. Contactez tanguy@vread.fr avec :
   - Description du problème
   - Logs de la console
   - Logs Supabase (Auth Logs)
