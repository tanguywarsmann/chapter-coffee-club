# Configuration de Google Analytics 4

## Installation

Le code Google Analytics 4 est déjà intégré dans le projet. Pour l'activer, suivez ces étapes :

### 1. Créer une propriété GA4

1. Accédez à [Google Analytics](https://analytics.google.com/)
2. Créez une nouvelle propriété GA4
3. Obtenez votre ID de mesure (format: `G-XXXXXXXXXX`)

### 2. Configurer l'ID de mesure

Dans le fichier `index.html`, remplacez `G-XXXXXXXXXX` par votre véritable ID de mesure :

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-VOTRE-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-VOTRE-ID', {
    'send_page_view': false
  });
</script>
```

## Événements trackés

### Page Views
- Suivi automatique des vues de page sur tous les articles de blog
- Inclut le titre et le chemin de la page

### Reading Time
- Mesure le temps passé sur chaque article
- Ne compte que les sessions de plus de 5 secondes
- Utile pour analyser l'engagement

### Share Events
- Track les partages via le bouton natif
- Track les copies de lien dans le presse-papier
- Inclut la méthode de partage utilisée

## Utilisation dans le code

Pour ajouter des événements personnalisés dans d'autres composants :

```typescript
import { gtag, trackPageView } from '@/utils/analytics';

// Page view simple
trackPageView('Ma page', '/ma-page');

// Événement personnalisé
gtag('event', 'mon_evenement', {
  category: 'engagement',
  label: 'action_utilisateur'
});
```

## Vérification

Pour vérifier que GA4 fonctionne :

1. Ouvrez les DevTools de votre navigateur
2. Allez dans l'onglet Network
3. Filtrez par "collect"
4. Naviguez sur le site et vérifiez que les événements sont envoyés à Google Analytics

Vous pouvez aussi vérifier en temps réel dans GA4 : **Rapports > Temps réel**
