# Guide de Débogage - Suppression de Compte

## ⚠️ Erreur Actuelle
```
"Erreur serveur: Edge Function returned a non-2xx status code"
```

Cette erreur signifie que l'Edge Function Supabase retourne un code HTTP d'erreur (500), mais nous devons voir les détails exacts.

---

## 🔍 ÉTAPES DE DIAGNOSTIC

### **Étape 1 : Vérifier les logs côté client (PRIORITAIRE)**

1. Ouvrez la console du navigateur (F12 → Console)
2. Cliquez sur "Supprimer mon compte"
3. **Copiez TOUS les logs qui apparaissent**, en particulier :
   - `[INFO] Raw Edge Function response:`
   - `[INFO] Response data details:`
   - `[ERROR] Edge function error details:`
   - `[ERROR] Extracted error details:`
   - `[ERROR] Actual server error:` OU `[ERROR] Could not extract error, full data:`

**Ces logs contiennent maintenant l'erreur EXACTE du serveur.**

---

### **Étape 2 : Vérifier les logs Supabase Edge Function**

1. Allez dans **Supabase Dashboard** → **Edge Functions** → `delete-account`
2. Cliquez sur **Logs** ou **Invocations**
3. Cherchez la dernière invocation de la fonction
4. **Copiez les logs**, en particulier :
   - `Processing account deletion for user: xxx`
   - `Calling cleanup_user_data RPC for user: xxx`
   - `Cleanup RPC response: {...}`
   - **Toute erreur en rouge**

---

### **Étape 3 : Tester la fonction SQL directement**

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Copiez-collez le contenu de `test-account-deletion.sql`
3. Exécutez chaque requête une par une
4. **Notez les résultats** :

**Test 1 - Vérifier que la fonction retourne JSON :**
```sql
SELECT proname, prorettype::regtype FROM pg_proc WHERE proname = 'cleanup_user_data';
```
✅ **Attendu :** `cleanup_user_data | json`
❌ **Si retourne "void"** → La migration n'est PAS appliquée !

**Test 2 - Tester avec un faux UUID :**
```sql
SELECT cleanup_user_data('00000000-0000-0000-0000-000000000000'::uuid);
```
✅ **Attendu :** `{"success": true, ...}`
❌ **Si erreur SQL** → Problème dans la fonction (contrainte FK, table manquante, etc.)

**Test 3 - Vérifier les contraintes FK :**
```sql
-- (dernière requête du fichier test-account-deletion.sql)
```
❌ **Si delete_rule = 'NO ACTION'** → Les contraintes bloquent la suppression !

---

## 🔧 SOLUTIONS SELON L'ERREUR

### **Cas 1 : La fonction retourne "void" au lieu de "json"**

**Problème :** La migration SQL n'a pas été appliquée.

**Solution :**
```bash
# Option A - Via Supabase CLI
supabase db push

# Option B - Manuellement dans SQL Editor
# Copiez le contenu de supabase/migrations/20251112153303_improved_cleanup_user_data.sql
# Collez dans SQL Editor et exécutez
```

---

### **Cas 2 : Erreur SQL "foreign key constraint violated"**

**Problème :** Une contrainte de clé étrangère empêche la suppression.

**Exemple d'erreur :**
```
update or delete on table "profiles" violates foreign key constraint "fk_table_user_id" on table "autre_table"
```

**Solution :**
```sql
-- Identifier la table problématique (voir Test 3 ci-dessus)
-- Puis ajouter la suppression de cette table dans cleanup_user_data

-- Par exemple, si la table "autre_table" n'est pas dans cleanup_user_data:
BEGIN
  DELETE FROM autre_table WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % autre_table', v_deleted_count;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table autre_table does not exist, skipping';
END;
```

---

### **Cas 3 : Edge Function non déployée**

**Problème :** Les modifications de l'Edge Function ne sont pas en production.

**Solution :**
```bash
supabase functions deploy delete-account
```

---

### **Cas 4 : Table manquante dans cleanup_user_data**

**Problème :** Une table avec user_id existe mais n'est pas supprimée par cleanup_user_data.

**Solution :**
Ajouter la table dans `supabase/migrations/20251112153303_improved_cleanup_user_data.sql` :

```sql
-- Delete user's [NOM_TABLE]
BEGIN
  DELETE FROM [NOM_TABLE] WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % [NOM_TABLE]', v_deleted_count;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table [NOM_TABLE] does not exist, skipping';
END;
```

Puis réappliquer la migration.

---

## 📊 CHECKLIST DE VÉRIFICATION

- [ ] Migration SQL appliquée (fonction retourne JSON)
- [ ] Edge Function déployée
- [ ] Test avec faux UUID fonctionne
- [ ] Toutes les contraintes FK sont gérées
- [ ] Logs client affichent l'erreur exacte
- [ ] Logs Supabase affichent les détails

---

## 🆘 SI LE PROBLÈME PERSISTE

**Copiez et envoyez-moi :**

1. **Logs console navigateur complets** (après avoir cliqué sur "Supprimer compte")
2. **Logs Supabase Edge Function** (Dashboard → Edge Functions → delete-account → Logs)
3. **Résultat du Test 1 SQL** (fonction retourne json ou void?)
4. **Résultat du Test 2 SQL** (erreur exacte si échec)
5. **Résultat du Test 3 SQL** (contraintes avec delete_rule = 'NO ACTION')

Avec ces informations, je pourrai identifier l'erreur exacte et la corriger.

---

## 📝 NOTES IMPORTANTES

- **NE PAS tester avec un vrai compte** avant d'avoir vérifié que les tests 1 et 2 fonctionnent
- **Les logs sont ESSENTIELS** - ils contiennent maintenant tous les détails de l'erreur
- **La console navigateur affiche maintenant response.data complet** si l'erreur ne peut pas être extraite
