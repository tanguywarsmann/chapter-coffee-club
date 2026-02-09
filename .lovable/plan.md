

# Plan final : Migration de nettoyage octobre 2025 (version production-ready)

## Donnees mesurees

- **371 impacted_real_users** (comptes reels ayant au moins 1 ligne dans la fenetre octobre)
- ~3 000 lignes a supprimer au total, reparties sur 6 tables
- Estimation duree : **< 30 secondes**

## Structure de la migration SQL

### Phase 0 : Timeouts de securite + Index manquants

```text
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10min';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_badges_earned_at 
  ON user_badges(earned_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_completion_awards_awarded_at 
  ON book_completion_awards(awarded_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_monthly_rewards_user_unlocked 
  ON user_monthly_rewards(user_id, unlocked_at);
```

Note : `CREATE INDEX CONCURRENTLY` ne peut pas s'executer dans une transaction. Ces index seront crees **avant** la transaction principale, dans un bloc separe.

### Phase 1 : Transaction principale

```text
BEGIN;

-- CTEs de population
WITH fake_users AS (
  SELECT id FROM profiles 
  WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
),
real_users AS (
  SELECT id FROM profiles WHERE id NOT IN (SELECT id FROM fake_users)
),
impacted_real_users AS (
  real_users avec au moins 1 ligne octobre dans :
  user_badges OR reading_validations OR feed_events 
  OR book_completion_awards OR user_monthly_rewards
)

-- ASSERTIONS (RAISE EXCEPTION si fake_user detecte)
-- SUPPRESSIONS dans l'ordre FK
-- RECALCUL reading_progress
-- RECALCUL user_companion (cible)
-- rebuild_user_xp() et auto_grant_badges() en boucle sur 371 users

COMMIT;
```

### Phase 2 : Post-migration (hors transaction)

```text
VACUUM ANALYZE user_badges;
VACUUM ANALYZE feed_events;
VACUUM ANALYZE feed_bookys;
VACUUM ANALYZE reading_validations;
```

## Detail des operations (dans la transaction)

### 1. CTEs de population

Trois CTEs reutilisees partout :
- `fake_users` : profiles crees en 2024
- `real_users` : tous sauf fake_users
- `impacted_real_users` : real_users avec activite dans `[2025-10-01, 2025-11-01)`

### 2. Assertions pre-suppression (7 verifications)

Pour chaque table cible, RAISE EXCEPTION si :
- Une ligne dans la fenetre octobre appartient a un fake_user
- Le nombre de lignes a supprimer depasse le preview mesure x2 (garde-fou)

### 3. Suppressions (ordre FK respecte)

| Etape | Table | Filtre | Lignes estimees |
|-------|-------|--------|-----------------|
| 3a | feed_bookys | event_id IN feed_events octobre des impacted | ~1 027 |
| 3b | feed_events | actor_id IN impacted + created_at octobre | ~520 |
| 3c | user_badges | user_id IN impacted + earned_at octobre | ~1 306 |
| 3d | book_completion_awards | user_id IN impacted + awarded_at octobre | ~2 |
| 3e | user_monthly_rewards | user_id IN impacted + unlocked_at octobre | ~6 |
| 3f | reading_validations | user_id IN impacted + validated_at octobre | ~146 |

### 4. Nettoyage reading_progress (impacted_real_users uniquement)

- Supprimer les progress sans aucune validation restante (toutes tables confondues)
- Pour les progress avec validations restantes : recalculer `current_page` = max(segment) des validations, `status` = 'in_progress' si etait 'completed' artificiellement

### 5. Recalcul user_companion (impacted_real_users uniquement)

Recalcul cible base sur les validations restantes :
- `total_reading_days` = jours distincts de validation
- `current_streak` et `longest_streak` = recalcul depuis historique restant
- `last_reading_date` = derniere validation
- `segments_this_week` = validations de la semaine courante
- `current_stage` = seuils (0=1, 1=2, 7=3, 21=4, 50=5)
- Flags rituels : non touches

### 6. Recalcul XP et badges (371 users, en boucle)

```text
FOR user_id IN (SELECT id FROM impacted_real_users) LOOP
  PERFORM rebuild_user_xp(user_id);
  PERFORM auto_grant_badges(user_id);
END LOOP;
```

Ces fonctions prennent un `p_user_id` en parametre : aucun effet global.

## Garanties de securite

| Garantie | Mecanisme |
|----------|-----------|
| Zero fake_user touche | CTE `fake_users` + RAISE EXCEPTION avant chaque DELETE |
| Zero suppression hors octobre | Filtre date strict + assertion |
| Scope limite a 371 users | CTE `impacted_real_users` |
| Pas de lock prolonge | `lock_timeout = 2s` |
| Pas de timeout infini | `statement_timeout = 10min` |
| Pas de perf degradee apres | VACUUM ANALYZE post-migration |
| XP/badges non globaux | Appel par user_id uniquement |
| user_companion recalcule proprement | Recalcul cible, pas de reset aveugle |

## Index crees (avant transaction)

| Index | Table | Colonnes |
|-------|-------|----------|
| `idx_user_badges_earned_at` | user_badges | earned_at |
| `idx_book_completion_awards_awarded_at` | book_completion_awards | awarded_at |
| `idx_user_monthly_rewards_user_unlocked` | user_monthly_rewards | (user_id, unlocked_at) |

## Fichiers a creer

| Fichier | Contenu |
|---------|---------|
| Script SQL Phase 0 | Creation des 3 index (CONCURRENTLY, hors transaction) |
| Script SQL Phase 1 | Transaction principale : CTEs, assertions, suppressions, recalculs |
| Script SQL Phase 2 | VACUUM ANALYZE sur les tables impactees |

Aucun fichier TypeScript modifie. Les erreurs TypeScript existantes (`books_public`, `reading_questions_public`) sont pre-existantes et non liees a cette migration.

