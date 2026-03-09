

# Plan — Correction wording segments (site web)

## Résumé

Corriger le wording visible sur le site : remplacer les fausses précisions ("pages 31-60", "30 pages" exact) par "environ 30 pages" + ajouter une micro-précision discrète "variable selon l'édition" dans les zones explicatives (onboarding, landing, premium). Aucune logique métier modifiée.

## Modifications (9 fichiers)

### 1. `src/components/books/ValidationModal.tsx` — ligne 69
- **Avant** : `Validation de lecture : pages {(segment-1)*30+1}-{segment*30}`
- **Après** : `Validation de lecture : Segment {segment}`

### 2. `src/components/books/ValidationHistory.tsx` — ligne 35
- **Avant** : `Validation du segment {validation.segment} (pages {(validation.segment-1)*30+1}-{validation.segment*30})`
- **Après** : `Validation du segment {validation.segment}`

### 3. `src/components/books/SuccessMessage.tsx` — ligne 120
- **Avant** : `Rendez-vous dans 30 pages`
- **Après** : `Prochaine validation dans environ 30 pages`

### 4. `src/components/books/QuizModal.tsx` — ligne 157
- **Avant** : `+10 XP • Prochain segment dans 30 pages`
- **Après** : `+10 XP • Prochain segment dans ~30 pages`

### 5. `src/i18n/locales/fr.ts`
| Ligne | Avant | Après |
|---|---|---|
| 70 | `Lis 30 pages` | `Lis environ 30 pages` |
| 94 | `Lire 30 pages → Répondre aux questions → Valider son segment` | `Lire environ 30 pages → Répondre aux questions → Valider son segment` |
| 227 | `checkpoints tous les 30 pages` | `checkpoints environ toutes les 30 pages` |
| 270 | `Valider 30 pages` | `Valider un segment` |
| 356 | `toutes les ~30 pages` | `environ toutes les 30 pages` |

### 6. `src/i18n/locales/en.ts`
| Ligne | Avant | Après |
|---|---|---|
| 70 | `Read 30 pages` | `Read around 30 pages` |
| 93 | `Read 30 pages → Answer questions` | `Read around 30 pages → Answer questions` |
| 263 | `Validate 30 pages` | `Validate a segment` |
| 345 | `every ~30 pages` | `around every 30 pages` |

### 7. `src/i18n/texts.ts` — ligne 29
- **Avant** : `Valider 30 pages`
- **Après** : `Valider un segment`

### 8. `src/components/onboarding/CelebrationStep.tsx` — ligne 25-26
- **Avant** : `title: 'Lis 30 pages'`, `description: 'Avance dans ton livre, à ton rythme'`
- **Après** : `title: 'Lis environ 30 pages'`, `description: 'Avance dans ton livre, à ton rythme. Le nombre de pages peut varier selon l\'édition.'`
- Sous-texte discret ajouté dans la description existante

### 9. `src/components/landing/CertificationDemo.tsx` — ligne 239
- **Avant** : `/ 30 pages`
- **Après** : `/ ~30 pages`

### 10. `src/components/admin/AdminBookList.tsx` — ligne 322
- **Avant** : `le segment 1 correspond aux pages 1 à 30, le segment 2 aux pages 31 à 60, etc.`
- **Après** : `Chaque segment correspond à environ 30 pages. Le nombre exact peut varier selon l'édition.`

## Micro-précisions "variable selon l'édition" — placement

Ajoutées **uniquement** dans les zones explicatives, en sous-texte discret (texte secondaire, `text-xs text-muted-foreground`) :

| Endroit | Précision ajoutée |
|---|---|
| `CelebrationStep.tsx` (onboarding) | dans la description existante |
| `fr.ts` ligne 227 (home / discover collection) | `checkpoints environ toutes les 30 pages, selon l'édition` |
| `fr.ts` ligne 356 (premium free features) | `environ toutes les 30 pages, selon l'édition` |
| `en.ts` ligne 345 (premium free features) | `around every 30 pages, may vary by edition` |
| `AdminBookList.tsx` (admin info box) | dans le texte existant |

**Pas de précision ajoutée** dans : ValidationModal (titre court), ValidationHistory (liste compacte), QuizModal (toast), SuccessMessage (message de progression simple).

## Ce qui ne change PAS
- `src/utils/constants.ts` — `PAGES_PER_SEGMENT = 30`
- `src/services/reading/addDerivedFields.ts`
- `src/services/user/userGoalsService.ts`
- Aucune logique métier / validation / quiz
- Ligne 31 fr.ts ("J'abandonne tous mes livres à 30 pages") — langage naturel utilisateur, inchangé

