# ✅ Vérifier si l'Import a Réussi

## 🔍 Vérification Rapide

### Dans SQL*Plus :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Compter les données
SELECT 
    'Étudiants' AS type,
    COUNT(*) AS nombre
FROM ETUDIANT
UNION ALL
SELECT 
    'Admins',
    COUNT(*)
FROM ADMIN
UNION ALL
SELECT 
    'Réclamations',
    COUNT(*)
FROM RECLAMATION
UNION ALL
SELECT 
    'Traitements',
    COUNT(*)
FROM TRAITEMENT
UNION ALL
SELECT 
    'Notifications',
    COUNT(*)
FROM NOTIFICATION;
```

**Résultats attendus** :
- Étudiants : **9**
- Admins : **3**
- Réclamations : **8**
- Traitements : **14**
- Notifications : **3**

---

## ✅ Si les Nombres sont Corrects

L'import a réussi ! ✅

**Prochaines étapes** :
1. Redémarrer le backend
2. Redémarrer le frontend
3. Vérifier dans l'interface

---

## ❌ Si les Nombres sont à 0 ou Incorrects

L'import n'a pas fonctionné. Réessayer :

### Option 1 : Réexécuter le Script

```powershell
.\importer_donnees_complet.ps1
```

**Cette fois, laisse la fenêtre ouverte** et regarde les messages.

### Option 2 : Import Manuel dans SQL*Plus

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

## 🔍 Vérifier le Fichier d'Export

**Dans PowerShell** :

```powershell
# Vérifier que le fichier existe
Test-Path oracle\export_donnees_complet.sql

# Voir la taille du fichier
Get-Item oracle\export_donnees_complet.sql | Select-Object Length
```

**Taille attendue** : ~79 KB

**Si le fichier n'existe pas** :
```powershell
git pull
```

---

## 📋 Checklist

- [ ] Fichier `export_donnees_complet.sql` existe
- [ ] Import exécuté (script ou manuel)
- [ ] Vérification dans SQL*Plus : 9 étudiants, 8 réclamations
- [ ] Backend redémarré
- [ ] Frontend redémarré
- [ ] Interface affiche les réclamations

---

## 💡 Astuce

**Pour voir les messages du script** :
- Ne ferme pas la fenêtre PowerShell
- Regarde tous les messages affichés
- Note les erreurs s'il y en a

