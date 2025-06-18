
# Features Desktop Archivées

Cette documentation présente les fonctionnalités desktop qui ont été temporairement désactivées dans le cadre de la migration mobile-first de l'application READ.

## Composants Archivés

### SimilarReaders.tsx
**Fonctionnalité :** Affiche des lecteurs avec des goûts similaires basés sur l'historique de lecture
**Localisation :** `src/archived/desktop-components/SimilarReaders.tsx`
**Usage original :** Sidebar droite de la page d'accueil (desktop uniquement)
**APIs utilisées :** Service fictif pour le moment (placeholder)
**Adaptation mobile :** Pourrait être intégré dans une section dédiée ou via un modal

### ActivityFeed.tsx  
**Fonctionnalité :** Flux d'activité sociale montrant les actions des amis (livres finis, badges obtenus, etc.)
**Localisation :** `src/archived/desktop-components/ActivityFeed.tsx`
**Usage original :** Sidebar droite de la page d'accueil
**APIs utilisées :** `getUserActivities()` depuis `src/mock/activities.ts`
**Fonctionnalités :**
- Système de likes
- Commentaires expandables  
- Différents types d'activités (finished, started, badge, streak)
**Adaptation mobile :** Pourrait devenir un onglet dédié ou une page séparée

### FollowerStats.tsx
**Fonctionnalité :** Affiche les statistiques de followers/following de l'utilisateur
**Localisation :** `src/archived/desktop-components/FollowerStats.tsx`
**Usage original :** Cards dans la sidebar de la page d'accueil
**APIs utilisées :** `getFollowerCounts()` depuis `profileService`
**Adaptation mobile :** Peut être intégré dans le profil utilisateur ou les stats

### RecommendedUsers.tsx
**Fonctionnalité :** Recommande des utilisateurs à suivre
**Localisation :** `src/archived/desktop-components/RecommendedUsers.tsx`
**Usage original :** Card dans la sidebar de la page d'accueil
**APIs utilisées :** `searchUsers()` depuis `profileService`, composant `UserItem`
**Adaptation mobile :** Pourrait devenir une section "Découvrir" ou page dédiée

### GoalsPreview.tsx
**Fonctionnalité :** Aperçu des prochains objectifs/badges à atteindre
**Localisation :** `src/archived/desktop-components/GoalsPreview.tsx`
**Usage original :** Card dans la sidebar de la page d'accueil
**Dépendances :** Progress component, icônes Lucide
**Adaptation mobile :** Peut être intégré dans la page Achievements ou comme widget

## Services Archivés

### similarReadersService.ts
**Fonctionnalité :** Service pour trouver des lecteurs similaires (actuellement désactivé)
**Localisation :** `src/archived/desktop-services/similarReadersService.ts`
**Usage :** Service placeholder, pas d'implémentation réelle
**API Supabase :** Aucune pour le moment

## Changements Effectués

### HomeContent.tsx - Simplifications
- Suppression de toute la logique conditionnelle `!isMobile`
- Suppression des imports des composants archivés
- Conservation uniquement de `ReadingProgress` et du bouton stats mobile
- Suppression de `getUserActivities()` et des mock data

### Navigation et UX
- Le bouton "Voir vos statistiques de lecture" reste pour l'accès mobile aux achievements
- Interface entièrement optimisée pour mobile
- Suppression des grids conditionnelles desktop

## Recommandations pour Réimplémentation Mobile

### Approche suggérée :
1. **SimilarReaders** → Intégrer dans une page "Découvrir" avec scroll horizontal
2. **ActivityFeed** → Créer un onglet dédié ou une page "Activité" 
3. **FollowerStats** → Intégrer dans le profil utilisateur
4. **RecommendedUsers** → Fusionner avec la page "Discover" existante
5. **GoalsPreview** → Créer des cards compactes dans "Achievements"

### Considérations techniques :
- Adapter les tailles d'écran pour mobile
- Optimiser les interactions tactiles
- Simplifier les interfaces (moins d'informations par écran)
- Utiliser des modals ou pages dédiées au lieu de sidebars

## Performance

### Améliorations apportées :
- Réduction de la taille du bundle JavaScript
- Moins de composants chargés au démarrage
- Suppression des media queries conditionnelles
- Optimisation des hooks mobiles

### Métriques avant/après :
- Bundle size réduit (à mesurer)
- Temps de chargement optimisé pour mobile
- Moins de re-renders conditionnels

## Tests

Les tests des composants archivés sont conservés dans leurs fichiers respectifs et peuvent être réutilisés lors de la réimplémentation mobile.

---

**Note :** Cette documentation sera mise à jour au fur et à mesure des réimplémantations mobiles futures.

