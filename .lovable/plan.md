
## Fix Affichage "Segments" dans BookCard

### Diagnostic
Ligne 59 de `src/components/books/BookCard.tsx` contient :
```typescript
(book.totalChapters || book.total_chapters || book.expectedSegments) ? `${book.totalChapters || book.total_chapters || book.expectedSegments} segments` : null,
```

Ce code utilise un fallback cascade qui affiche `totalChapters` (42) au lieu de `expectedSegments` (5) pour "Madeleine avant l'aube" et autres livres.

### Solution (100% Front)
Remplacer cette ligne par :
```typescript
Number.isFinite(book.expectedSegments) ? `${book.expectedSegments} segments` : null,
```

### Justification
- `expectedSegments` est correctement mappé depuis `record.expected_segments` dans `bookMapper.ts` (ligne 27)
- `Number.isFinite()` est robuste : teste si la valeur existe ET est un nombre valide (inclut 0, exclut undefined/NaN/Infinity)
- Aucun fallback vers `totalChapters` ou `total_chapters` (ces champs ne sont pas pertinents pour afficher les segments)
- Zéro impact sur les autres champs (pages, language, catégories restent inchangés)

### Fichier modifié
- `src/components/books/BookCard.tsx` (ligne 59)

### Vérification
Après le fix :
1. Ouvrir `/explore`
2. Chercher "Madeleine avant l'aube"
3. Vérifier que la pastille affiche `5 segments` (ou la valeur d'`expected_segments` du livre) au lieu de `42 segments`
