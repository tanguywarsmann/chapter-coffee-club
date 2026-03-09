

## Améliorer la hitbox du lien "Accéder au site sur ordi"

### Problème
Les deux liens "Accéder au site sur ordi" (hero section ligne 173 et community section ligne 466) sont des `<Link>` avec `text-sm` et aucun padding. La zone cliquable est limitée à la hauteur du texte (~14px), bien en dessous du minimum ergonomique de 44px.

De plus, le lien du hero est potentiellement masqué par les boutons App Store/Google Play au-dessus qui ont `z-30`.

### Correction (fichier unique : `src/pages/Landing.tsx`)

**Lien hero (ligne 173-178)** : ajouter du padding vertical + horizontal, un z-index suffisant, et `pointer-events-auto` pour garantir la cliquabilité.

```
Avant :
  className="inline-block text-coffee-medium/70 hover:text-copper text-sm underline underline-offset-2 transition-colors mt-2"

Après :
  className="inline-block text-coffee-medium/70 hover:text-copper text-sm underline underline-offset-2 transition-colors mt-2 px-4 py-3 relative z-30 pointer-events-auto"
```

**Lien community (ligne 466-471)** : même traitement, ajouter du padding.

```
Avant :
  className="text-coffee-medium/70 hover:text-copper text-sm underline underline-offset-2 transition-colors"

Après :
  className="text-coffee-medium/70 hover:text-copper text-sm underline underline-offset-2 transition-colors px-4 py-3 inline-block"
```

### Résultat
- Hitbox passe de ~14px de haut a ~44px (14px texte + 12px padding haut + 12px padding bas)
- Le lien reste visuellement identique (pas de background, juste du padding invisible)
- Le z-index et pointer-events garantissent que le lien n'est pas masqué par les CTAs au-dessus

### Scope
- 1 fichier modifié : `src/pages/Landing.tsx`
- 2 lignes changées (les className des deux liens)
- Zéro impact backend, zéro migration

