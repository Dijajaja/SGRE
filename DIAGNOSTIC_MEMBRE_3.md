# 🔍 Diagnostic : Membre 3 Ne Voit Pas les Réclamations

## 📋 Checklist de Diagnostic

### Étape 1 : Vérifier les Données dans Oracle

**Dans SQL*Plus** :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Compter les réclamations
SELECT COUNT(*) AS total_reclamations FROM RECLAMATION;

-- Voir toutes les réclamations
SELECT id, titre, statut FROM RECLAMATION ORDER BY id;
```

**Résultat attendu** :
- Total réclamations : **8**
- Liste de 8 réclamations

**Si 0 réclamations** → L'import n'a pas été fait. Voir Solution 1.

**Si 8 réclamations** → Les données sont là. Voir Étape 2.

---

### Étape 2 : Vérifier la Vue Dashboard

**Dans SQL*Plus** :

```sql
-- Compter dans la vue
SELECT COUNT(*) AS total_dans_vue FROM v_dashboard_admin;

-- Voir toutes les réclamations dans la vue
SELECT reclamation_id, titre, statut FROM v_dashboard_admin ORDER BY reclamation_id;
```

**Résultat attendu** :
- Total dans la vue : **8**
- Liste de 8 réclamations

**Si 0 ou moins de 8** → Problème avec la vue. Voir Solution 2.

---

### Étape 3 : Vérifier le Backend

**Dans PowerShell** :

```powershell
cd backend
npm start
```

**Vérifier** :
- Le backend démarre sans erreur
- Port 3001 est utilisé
- Pas d'erreurs Oracle dans les logs

**Si erreurs** → Voir Solution 3.

---

### Étape 4 : Vérifier le Frontend

**Dans PowerShell** (nouveau terminal) :

```powershell
cd frontend
npm start
```

**Vérifier** :
- Le frontend démarre
- Pas d'erreurs dans la console du navigateur

---

## ✅ Solutions

### Solution 1 : Import Non Fait

**Si Oracle contient 0 réclamations** :

```powershell
# 1. Récupérer depuis Git
git pull

# 2. Importer les données
.\importer_donnees_complet.ps1
```

**OU manuellement dans SQL*Plus** :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Vider
DELETE FROM NOTIFICATION;
DELETE FROM TRAITEMENT;
DELETE FROM RECLAMATION;
DELETE FROM ETUDIANT;
DELETE FROM ADMIN;

ALTER SEQUENCE seq_etudiant RESTART START WITH 1;
ALTER SEQUENCE seq_admin RESTART START WITH 1;
ALTER SEQUENCE seq_reclamation RESTART START WITH 1;
ALTER SEQUENCE seq_traitement RESTART START WITH 1;
ALTER SEQUENCE seq_notification RESTART START WITH 1;
COMMIT;

-- Importer
@oracle/export_donnees_complet.sql
```

---

### Solution 2 : Problème avec la Vue

**Si Oracle contient 8 réclamations mais la vue n'en retourne que 2** :

**Recréer la vue** :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

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

---

### Solution 3 : Problème Backend

**Si le backend ne démarre pas ou a des erreurs** :

1. **Vérifier le fichier `.env`** :

```env
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE=XEPDB1
ORACLE_USER=SGRE_USER
ORACLE_PASSWORD=12345
PORT=3001
```

2. **Tester la connexion Oracle** :

```powershell
node test_connexion_backend.js
```

3. **Vérifier que le port 3001 est libre** :

```powershell
netstat -ano | findstr :3001
```

Si occupé, tuer le processus :
```powershell
taskkill /PID [PID] /F
```

---

### Solution 4 : Problème Frontend

**Si le frontend ne charge pas les données** :

1. **Vérifier la console du navigateur** (F12)
2. **Vérifier l'URL de l'API** : `http://localhost:3001/api`
3. **Vérifier que le backend est démarré**

---

## 🎯 Diagnostic Rapide

### Commande Unique pour Vérifier Tout

**Dans SQL*Plus** :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Diagnostic complet
SELECT 
    'Réclamations dans table' AS type,
    COUNT(*) AS nombre
FROM RECLAMATION
UNION ALL
SELECT 
    'Réclamations dans vue',
    COUNT(*)
FROM v_dashboard_admin
UNION ALL
SELECT 
    'Étudiants',
    COUNT(*)
FROM ETUDIANT
UNION ALL
SELECT 
    'Admins',
    COUNT(*)
FROM ADMIN;
```

**Résultats attendus** :
- Réclamations dans table : **8**
- Réclamations dans vue : **8**
- Étudiants : **9**
- Admins : **3**

---

## 📋 Résumé des Actions

1. **Vérifier Oracle** : `SELECT COUNT(*) FROM RECLAMATION;`
2. **Si 0** → Faire l'import
3. **Si 8** → Vérifier la vue
4. **Si vue OK** → Vérifier le backend
5. **Si backend OK** → Vérifier le frontend

---

## 💡 Solution Rapide (Si Tout Échoue)

**Réimporter complètement** :

```powershell
# 1. Pull
git pull

# 2. Importer
.\importer_donnees_complet.ps1

# 3. Redémarrer backend
cd backend
npm start

# 4. Redémarrer frontend (nouveau terminal)
cd frontend
npm start
```

