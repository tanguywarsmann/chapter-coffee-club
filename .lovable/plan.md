

# Reparation des donnees perdues + correction du bug progress_id

## Diagnostic confirme

La migration de nettoyage du 9 fevrier a supprime a tort des lignes `reading_progress` pour 8 utilisateurs reels. La cause : le DELETE "orphan progress" (ligne 72) joinait sur `progress_id` alors que 85% des validations ont `progress_id = NULL` (bug preexistant du RPC).

## Utilisateurs impactes

| User ID | Livres perdus (COMPLETED) | Livres perdus (partial) |
|---------|--------------------------|------------------------|
| e818b021 (nathaliew) | 3 | 2 |
| d2e088bf | ~18 | 2 |
| 7257a507 | 1 | 2 |
| d2e088bf (total) | ~20 livres | - |
| 5 autres users | 0-1 chacun | 1 chacun |

## Phase 1 : Script SQL de reparation (migration)

Principe : pour chaque `(user_id, book_id)` present dans `reading_validations` mais absent de `reading_progress`, recreer la ligne progress.

```text
1. Identifier les paires (user_id, book_id) orphelines
2. Pour chaque paire :
   - Calculer segments valides = COUNT(DISTINCT segment)
   - Calculer current_page = MAX(segment) * 30
   - Determiner status = 'completed' si segments >= expected_segments, sinon 'in_progress'
   - completed_at = MAX(validated_at) si completed
   - started_at = MIN(validated_at)
3. INSERT INTO reading_progress avec ces valeurs calculees
4. UPDATE reading_validations SET progress_id = (nouveau progress_id)
   WHERE user_id = X AND book_id = Y AND progress_id IS NULL
5. rebuild_user_xp() pour chaque user impacte
6. Recalculer user_companion pour chaque user impacte
```

### Requete de reparation (ciblera exactement les 8 users concernes)

La requete utilisera une CTE pour identifier automatiquement toutes les paires orphelines, sans hardcoder les user_ids. Garde-fou : assertion que le nombre de lignes a inserer est < 100.

## Phase 2 : Correction du RPC force_validate_segment_beta

Modifier le `ON CONFLICT` pour mettre a jour `progress_id` quand il est NULL :

```text
Avant:
  ON CONFLICT DO NOTHING;

Apres:
  ON CONFLICT (user_id, book_id, segment)
  DO UPDATE SET progress_id = EXCLUDED.progress_id
  WHERE reading_validations.progress_id IS NULL;
```

Cela garantit que toute future validation aura toujours un `progress_id` renseigne.

## Phase 3 : Correction des validations existantes avec progress_id NULL

Pour les livres qui ONT un reading_progress mais dont les validations ont progress_id NULL :

```text
UPDATE reading_validations rv
SET progress_id = rp.id
FROM reading_progress rp
WHERE rv.user_id = rp.user_id
  AND rv.book_id = rp.book_id
  AND rv.progress_id IS NULL;
```

## Fichiers modifies

| Fichier | Action |
|---------|--------|
| Migration SQL (nouvelle) | Phase 1 : reparation des 8 users + Phase 3 : backfill progress_id |
| Migration SQL (RPC) | Phase 2 : ALTER la RPC force_validate_segment_beta |

Aucun fichier TypeScript modifie. Aucun impact sur l'app ou le site.

## Garanties

| Garantie | Mecanisme |
|----------|-----------|
| Pas de doublon progress | INSERT ... WHERE NOT EXISTS |
| Pas de regression | ON CONFLICT DO UPDATE ne touche que progress_id NULL |
| Scope limite | CTE automatique, pas de hardcode |
| XP recalcule | rebuild_user_xp() par user |
| Idempotent | Re-executer la migration ne cree pas de doublons |

## Validation post-migration

Requete de verification :

```text
-- Doit retourner 0 apres la migration
SELECT COUNT(DISTINCT (rv.user_id, rv.book_id))
FROM reading_validations rv
WHERE rv.progress_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM reading_progress rp
  WHERE rp.user_id = rv.user_id AND rp.book_id = rv.book_id
);
```
