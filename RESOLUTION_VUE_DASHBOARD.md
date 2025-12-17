# 🔧 Résolution : Vue Dashboard Ne Retourne Que 2 Réclamations

## ❌ Problème

- **SQL*Plus** : 8 réclamations dans la table `RECLAMATION` ✅
- **Frontend** : Seulement 2 réclamations affichées ❌
- **Vue `v_dashboard_admin`** : Ne retourne que 2 réclamations

## 🔍 Diagnostic

### Sur le PC du Membre, exécute dans SQL*Plus :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
@oracle/24_diagnostic_vue_dashboard.sql
```

Ce script va identifier le problème.

## ✅ Solutions Possibles

### Solution 1 : Étudiants Manquants

Si certaines réclamations référencent des étudiants qui n'existent pas, le `JOIN` les exclut.

**Vérification** :
```sql
SELECT DISTINCT r.etudiant_id
FROM RECLAMATION r
WHERE r.etudiant_id NOT IN (SELECT id FROM ETUDIANT);
```

**Solution** : Réimporter toutes les données (étudiants ET réclamations).

### Solution 2 : Fonction `temps_traitement_reclamation` Échoue

Si la fonction échoue pour certaines réclamations, la vue peut ne pas les retourner.

**Vérification** :
```sql
SELECT 
    r.id,
    temps_traitement_reclamation(r.id) AS jours
FROM RECLAMATION r;
```

**Solution** : Vérifier que la fonction existe et fonctionne correctement.

### Solution 3 : Problème avec le JOIN

Le `JOIN ETUDIANT` exclut les réclamations sans étudiant valide.

**Solution** : Utiliser `LEFT JOIN` au lieu de `JOIN` (déjà fait dans la vue).

## 🔧 Solution Immédiate : Recréer la Vue

### Sur le PC du Membre, dans SQL*Plus :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Recréer la vue
CREATE OR REPLACE VIEW v_dashboard_admin AS
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.type_reclamation,
    r.statut,
    r.priorite,
    r.date_creation,
    r.admin_assignee_id,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    e.filiere,
    e.email AS etudiant_email,
    a.nom || ' ' || a.prenom AS admin_assignee,
    a.role AS admin_role,
    (SELECT COUNT(*) FROM TRAITEMENT WHERE reclamation_id = r.id) AS nb_traitements,
    NVL(temps_traitement_reclamation(r.id), 0) AS jours_traitement,
    CASE 
        WHEN r.statut IN ('EN ATTENTE', 'EN COURS') THEN 
            ROUND(SYSDATE - r.date_creation)
        ELSE NULL
    END AS jours_attente
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
ORDER BY 
    CASE r.priorite
        WHEN 'URGENTE' THEN 1
        WHEN 'ELEVEE' THEN 2
        WHEN 'MOYENNE' THEN 3
        ELSE 4
    END,
    r.date_creation DESC;

-- Vérifier
SELECT COUNT(*) FROM v_dashboard_admin;
```

## 📋 Étapes de Diagnostic

1. **Exécuter le script de diagnostic** : `@oracle/24_diagnostic_vue_dashboard.sql`
2. **Identifier le problème** (étudiants manquants, fonction qui échoue, etc.)
3. **Appliquer la solution appropriée**

## 💡 Solution Alternative : Utiliser la Table Directement

Si la vue pose problème, modifier temporairement le backend pour utiliser la table directement (mais ce n'est pas recommandé à long terme).

