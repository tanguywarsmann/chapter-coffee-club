# Plan de Tests Manuels - Audit Joker

## 🎯 Objectif
Tester la logique Joker actuelle et valider l'impact de la règle "≥ 3 segments" sans modifier le comportement existant.

## 📋 Pré-requis

### Variables d'Environnement
```bash
# Pour activer les logs debug
VITE_DEBUG_JOKER=1

# Pour configurer le minimum (test uniquement, pas encore appliqué)
VITE_JOKER_MIN_SEGMENTS=3

# Pour activer la nouvelle contrainte (AUDIT: garder à false)
VITE_JOKER_MIN_SEGMENTS_ENABLED=false
```

### Console d'Audit
Ouvrir la console développeur et exécuter:
```javascript
// Teste les 3 scénarios d'audit
window.jokerAudit.testScenarios()

// Analyse les livres affectés
await window.jokerAudit.analyzeBooks()

// Valide l'intégrité des données
await window.jokerAudit.validateIntegrity()
```

## 🧪 Scénarios de Test

### Scénario A: Livre 2 Segments (Sera bloqué par nouvelle règle)

#### Données de Test
- **expected_segments**: 2
- **Jokers actuels**: 1 (Math.floor(2/10) + 1 = 1)
- **Statut futur**: ❌ Bloqué (< 3 segments)

#### Tests à Effectuer

1. **Test UI - Page Livre**
   - [ ] Naviguer vers un livre avec 2 segments
   - [ ] Vérifier affichage "Jokers : 0 / 1 utilisés" dans BookProgressBar
   - [ ] Démarrer validation d'un segment
   - [ ] Répondre incorrectement à la question
   - [ ] **Résultat attendu**: JokerConfirmationModal s'affiche avec "Jokers restants : 1 / 1"

2. **Test Logs Debug**
   - [ ] Ouvrir console développeur
   - [ ] Chercher logs `[JOKER DEBUG]` et `[JOKER AUDIT]`
   - [ ] Vérifier que `wouldBeBlockedByNewRule: true` apparaît
   - [ ] Confirmer calcul: `{ jokersAllowed: 1, expectedSegments: 2 }`

3. **Test API Backend**
   ```javascript
   // Test RPC directement
   const { data, error } = await supabase.rpc('use_joker', {
     p_book_id: 'test-book-id',
     p_user_id: 'current-user-id', 
     p_segment: 1
   });
   console.log('RPC Result:', data);
   ```
   - [ ] **Résultat attendu**: `success: true` (comportement actuel)

4. **Test Edge Function**
   ```javascript
   const response = await fetch('/functions/v1/joker-reveal', {
     method: 'POST',
     headers: { 
       'Authorization': `Bearer ${session.access_token}`,
       'Content-Type': 'application/json' 
     },
     body: JSON.stringify({
       bookId: 'test-book-id',
       segment: 1,
       consume: true
     })
   });
   ```
   - [ ] **Résultat attendu**: 200 OK avec `correctAnswer` (comportement actuel)

### Scénario B: Livre 3 Segments (Fonctionnement normal)

#### Données de Test
- **expected_segments**: 3
- **Jokers actuels**: 1 (Math.floor(3/10) + 1 = 1)
- **Statut futur**: ✅ Autorisé (≥ 3 segments)

#### Tests à Effectuer

1. **Test UI - Même procédure que Scénario A**
   - [ ] **Résultat attendu**: Fonctionnement normal, joker disponible

2. **Test Logs Debug**
   - [ ] Vérifier `wouldBeBlockedByNewRule: false`
   - [ ] Confirmer calcul: `{ jokersAllowed: 1, expectedSegments: 3 }`

3. **Tests API - Même procédure que Scénario A**
   - [ ] **Résultat attendu**: Fonctionnement normal

### Scénario C: Livre 10 Segments (Fonctionnement normal)

#### Données de Test
- **expected_segments**: 10
- **Jokers actuels**: 1 (Math.floor(10/10) + 1 = 1)
- **Statut futur**: ✅ Autorisé (≥ 3 segments)

#### Tests à Effectuer

1. **Test UI - Même procédure que précédents**
   - [ ] **Résultat attendu**: Fonctionnement normal

2. **Test Edge Cases**
   - [ ] Utiliser le joker disponible
   - [ ] Tenter d'utiliser un 2ème joker
   - [ ] **Résultat attendu**: Erreur "Plus aucun joker disponible"

## 📊 Collecte de Données

### Analyse Automatique
```javascript
// Dans la console développeur
const analysis = await window.jokerAudit.analyzeBooks();
console.table(analysis.booksAffected);

const integrity = await window.jokerAudit.validateIntegrity();
console.log('Livres avec problèmes:', integrity.issues);

// Export CSV pour analyse offline
const csvData = window.jokerAudit.exportCSV();
console.log(csvData);
```

### Métriques à Collecter

#### Par Scénario
- [ ] **Temps de réponse** Edge Function (< 2s attendu)
- [ ] **Cohérence calculs** frontend vs backend
- [ ] **Gestion erreurs** (codes HTTP, messages)
- [ ] **Analytics tracking** (events joker_used, answer_revealed)

#### Globales  
- [ ] **Nombre total** de livres < 3 segments
- [ ] **Utilisations joker** sur ces livres (si données disponibles)
- [ ] **Intégrité données** expected_segments (nulls, zéros, négatifs)

## 🔍 Points de Vérification Critiques

### Cohérence Multi-Niveaux
- [ ] **Frontend hook** `useJokersInfo` = **RPC Database** `use_joker`
- [ ] **UI calculs** = **Edge Function calculs**
- [ ] **Analytics** trackés = **Database** validations

### Gestion des États Edge
- [ ] `expected_segments = null` → Comment traité ?
- [ ] `expected_segments = 0` → Comportement ?
- [ ] Livre sans questions → Edge Function response ?
- [ ] Utilisateur non connecté → Gestion erreur ?

### Performance et UX
- [ ] Latence Edge Function acceptable (< 2s)
- [ ] Messages d'erreur compréhensibles
- [ ] Pas de double-soumission possible
- [ ] États loading corrects

## 📋 Checklist de Validation

### Avant Validation Humaine
- [ ] 3 scénarios testés manuellement
- [ ] Logs debug cohérents et informatifs
- [ ] Données intégrité validées (pas d'incohérences critiques)
- [ ] Performance acceptable sur tous endpoints

### Documentation Impact
- [ ] Liste exacte des livres qui seraient affectés
- [ ] Estimation utilisateurs impactés (si données disponibles)
- [ ] Aucune régression sur comportement actuel constatée

### Préparation Déploiement
- [ ] Feature flag testé (activation/désactivation)
- [ ] Plan de rollback validé
- [ ] Messages d'erreur UX-friendly préparés

## 🚨 Critères d'Arrêt

### Stop immédiat si:
- [ ] Régression sur livres ≥ 3 segments
- [ ] Erreurs 500 fréquentes sur Edge Function
- [ ] Incohérence calculs frontend vs backend
- [ ] Performance dégradée (> 5s response time)

### Escalade si:
- [ ] > 20% des livres auraient expected_segments < 3
- [ ] Données integrity issues critiques
- [ ] Analytics tracking cassé

---

*Tests à effectuer en mode debug uniquement. Aucun changement de comportement tant que VITE_JOKER_MIN_SEGMENTS_ENABLED=false*