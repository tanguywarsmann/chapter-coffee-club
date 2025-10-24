# 🧪 XP System Smoke Tests

## Vue d'ensemble

Ce document décrit les tests SQL non destructifs pour vérifier l'intégrité du système XP/Niveaux, notamment l'**idempotence du bonus de complétion de livre** (+200 XP).

---

## Test : Idempotence du bonus de complétion

**Fichier**: `scripts/tests/xp_book_completion_idempotence.sql`

### Objectif

Vérifier que le trigger `award_xp_on_book_completion()` attribue le bonus de **+200 XP** exactement **une seule fois par (user_id, book_id)**, grâce à la table `book_completion_awards`.

### Scénario de test

1. Sélectionne un utilisateur existant dans `auth.users`
2. Choisit un livre que cet utilisateur n'a pas encore commencé
3. Crée une progression `in_progress` puis la marque `completed`
4. Vérifie que **+200 XP** sont ajoutés et qu'un award est créé
5. Rejoue la mise à jour `completed` (idempotence)
6. Vérifie que **aucun XP supplémentaire** n'est ajouté et que l'award reste unique

### Exécution

#### Via Supabase SQL Editor

1. Ouvrir le **SQL Editor** sur le [dashboard Supabase](https://supabase.com/dashboard/project/xjumsrjuyzvsixvfwoiz/sql/new)
2. Copier-coller le contenu de `scripts/tests/xp_book_completion_idempotence.sql`
3. Cliquer sur **Run** ou `Ctrl+Enter`

#### Via CLI (si applicable)

```bash
supabase db reset --local
psql $DATABASE_URL < scripts/tests/xp_book_completion_idempotence.sql
```

### Interprétation des résultats

#### ✅ Succès

Le test affiche en `NOTICE` :

```
NOTICE:  ✅ PASS: +200 XP appliqué une seule fois (awards 0→1→1), XP 487→687→687
```

Cela confirme que :
- Aucun award n'existait avant (0)
- Un award a été créé après la 1ère complétion (1)
- L'award est resté unique après la 2ème tentative (1)
- L'XP a augmenté de 200 une seule fois

**Aucune donnée n'est persistée** (transaction `ROLLBACK`).

#### ❌ Échec

Le test lève une `EXCEPTION` avec un message explicite :

```
EXCEPTION:  ECHEC: idempotence violée (après1:687 ≠ après2:887)
```

Causes possibles :
- Le trigger `award_xp_on_book_completion()` n'utilise pas `book_completion_awards`
- La table `book_completion_awards` n'a pas de contrainte `PRIMARY KEY (user_id, book_id)`
- La fonction `increment_user_xp` n'est pas atomique

### Assertions validées

| Assertion | Description |
|-----------|-------------|
| `xp_after1 = xp_before + 200` | Le bonus est bien de +200 XP à la 1ère complétion |
| `xp_after2 = xp_after1` | Aucun XP supplémentaire à la 2ème tentative (idempotence) |
| `awards_after1 = 1` | Un seul award créé après la 1ère complétion |
| `awards_after2 = 1` | L'award reste unique après la 2ème tentative |

---

## Prérequis

- Au moins **1 utilisateur** dans `auth.users`
- Au moins **1 livre** dans `public.books`
- Les migrations XP doivent être déployées :
  - Trigger `init_user_level_on_profile()`
  - Trigger `award_xp_on_book_completion()`
  - Table `book_completion_awards`
  - Fonction `increment_user_xp(uuid, int)`

---

## Sécurité

- **Transaction ROLLBACK** : Aucune donnée n'est modifiée en base
- **Self-protected** : Le test vérifie que l'utilisateur et le livre existent avant de procéder
- **FK-safe** : Choisit un livre non encore présent dans `reading_progress` pour éviter les violations de contraintes

---

## Exécution en CI/CD

Pour intégrer ce test dans une pipeline :

```yaml
# .github/workflows/xp-tests.yml
- name: Run XP idempotence test
  run: |
    psql $DATABASE_URL < scripts/tests/xp_book_completion_idempotence.sql
    if [ $? -ne 0 ]; then
      echo "❌ XP idempotence test failed"
      exit 1
    fi
    echo "✅ XP idempotence test passed"
```

---

## Dépannage

### Erreur : "Aucun utilisateur dans auth.users"

Créez un utilisateur de test :

```sql
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'test@vread.test',
  crypt('password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

### Erreur : "Aucun livre disponible non lu pour ce user"

Créez un livre de test :

```sql
INSERT INTO public.books (id, slug, title, author, total_pages, expected_segments)
VALUES (gen_random_uuid()::text, 'test-book-' || gen_random_uuid(), 'Test Book', 'Test Author', 100, 10);
```

### Erreur : "Un award existe déjà pour ce couple (user, book)"

Le test a détecté un award existant. Choisissez un autre livre ou user, ou nettoyez les awards de test :

```sql
DELETE FROM public.book_completion_awards WHERE book_id LIKE 'test-%';
```

---

## Maintenance

- **Fréquence recommandée** : Exécuter après chaque déploiement de migration XP
- **Durée d'exécution** : < 1 seconde
- **Impact** : Aucun (ROLLBACK)

---

## Référence

- Migration : `supabase/migrations/*_xp_hardening_trigger_and_awards.sql`
- Fonction : `public.award_xp_on_book_completion()`
- Table : `public.book_completion_awards`
- RPC : `public.increment_user_xp(uuid, int)`
