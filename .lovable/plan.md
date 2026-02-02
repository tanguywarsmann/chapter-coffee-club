

# Plan : Ajout du lien Android + Badges App Store professionnels

## Contexte

L'application VREAD est maintenant disponible sur Android. Il faut mettre a jour la landing page pour :
1. Afficher deux CTAs distincts (iOS App Store + Google Play Store)
2. Utiliser les icones Apple et Android (deja existantes dans `src/components/icons/`)
3. Supprimer les mentions "Bientot sur Android"
4. Mettre a jour le copyright de 2024 a 2025

## Modifications a apporter

### 1. Fichier : `src/pages/Landing.tsx`

**Imports a ajouter :**
- Importer les composants `Apple` et `Google` depuis `@/components/icons/Apple` et `@/components/icons/Google`
- Supprimer l'import `BookOpen` de lucide-react (plus utilise)

**Navigation (ligne ~93-100) :**
Remplacer le bouton unique "Telecharger" par deux boutons cote a cote avec icones :

```text
Avant:  [Telecharger]
Apres:  [Apple icon] iOS    [Android icon] Android
```

Design : Deux boutons compacts avec icones, style coherent avec le reste de la nav.

**Section Hero (lignes ~147-149) :**
Remplacer le texte "Disponible sur iOS - Bientot sur Android" par :
- "Disponible sur iOS et Android"

**Section Community (lignes ~406-419) :**
Remplacer le CTA unique par deux badges App Store professionnels :
- Badge Apple App Store avec icone Apple
- Badge Google Play Store avec icone Android

Supprimer la mention "Bientot sur Android" et la remplacer par "Disponible sur iOS et Android".

**Footer (ligne ~449-451) :**
Mettre a jour le copyright de 2024 a 2025.

### 2. Fichiers : Traductions FR et EN

**`src/i18n/locales/fr.ts` :**
- Modifier `landing.hero.ctaAvailability` : "Gratuit - Disponible sur iOS et Android"
- Supprimer `landing.hero.ctaAndroid` (ou le vider)
- Modifier `landing.community.availability` : "Disponible sur iOS et Android"
- Supprimer `landing.community.androidSoon`
- Modifier `landing.footer.copyright` : "(c) 2025 VREAD. Tous droits reserves."

**`src/i18n/locales/en.ts` :**
- Memes modifications en anglais

### 3. Design des CTAs

**Style des boutons App Store :**

```text
+----------------------------------+  +----------------------------------+
|  [Apple icon]  App Store         |  |  [Play icon]  Google Play       |
+----------------------------------+  +----------------------------------+
```

- Fond sombre (`bg-coffee-darkest` ou `bg-black`)
- Texte blanc
- Icones blanches (fill="currentColor")
- Border radius arrondi (`rounded-xl`)
- Effet hover avec scale
- Espacement egal entre les deux

**Pour la navigation :**
Boutons plus compacts adaptes a la nav :
- Deux boutons avec seulement les icones sur mobile
- Icones + texte court sur desktop

## Liens a utiliser

| Plateforme | URL |
|------------|-----|
| iOS App Store | `https://apps.apple.com/fr/app/v-read/id6752836822` |
| Google Play Store | `https://play.google.com/store/apps/details?id=com.vread.app` |

## Resume des fichiers a modifier

| Fichier | Modifications |
|---------|---------------|
| `src/pages/Landing.tsx` | Imports, nav, hero, community, footer |
| `src/i18n/locales/fr.ts` | Textes disponibilite + copyright 2025 |
| `src/i18n/locales/en.ts` | Textes disponibilite + copyright 2025 |

## Resultat attendu

- Navigation : Deux icones/boutons pour telecharger l'app
- Hero : Texte mis a jour "Disponible sur iOS et Android"
- Community : Deux badges App Store professionnels cote a cote
- Footer : Copyright 2025
- Look professionnel et coherent avec la direction artistique existante

