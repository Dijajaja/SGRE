# ✅ Vérifier que les Bases de Données sont à Jour

## 🔍 Comment Vérifier

### Sur Chaque PC (Membres du Groupe)

#### Étape 1 : Vérifier dans Oracle

**Dans SQL*Plus** :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Compter les données
SELECT 'Étudiants: ' || COUNT(*) FROM ETUDIANT;
SELECT 'Admins: ' || COUNT(*) FROM ADMIN;
SELECT 'Réclamations: ' || COUNT(*) FROM RECLAMATION;
SELECT 'Traitements: ' || COUNT(*) FROM TRAITEMENT;
SELECT 'Notifications: ' || COUNT(*) FROM NOTIFICATION;
```

**Tous les PC devraient avoir les mêmes nombres.**

---

#### Étape 2 : Vérifier dans l'Interface

**Ouvre l'interface admin** et vérifie :
- ✅ Le nombre de réclamations affichées
- ✅ Les réclamations récentes sont présentes
- ✅ Les attributions sont correctes

---

#### Étape 3 : Vérifier le Fichier d'Export

**Dans PowerShell** :

```powershell
# Vérifier la date de modification du fichier
Get-Item oracle\export_donnees_complet.sql | Select-Object LastWriteTime, Length
```

**Tous les PC devraient avoir le même fichier avec la même date.**

---

## 📊 Comparaison entre PC

### PC Principal (Toi)

Exécute dans SQL*Plus :

```sql
SELECT 
    'Étudiants' AS type, COUNT(*) AS nombre FROM ETUDIANT
UNION ALL
SELECT 'Admins', COUNT(*) FROM ADMIN
UNION ALL
SELECT 'Réclamations', COUNT(*) FROM RECLAMATION
UNION ALL
SELECT 'Traitements', COUNT(*) FROM TRAITEMENT
UNION ALL
SELECT 'Notifications', COUNT(*) FROM NOTIFICATION;
```

**Note les résultats** et partage-les avec les autres membres.

### PC Membres 2 & 3

Ils doivent exécuter la même requête et comparer les résultats.

**Si les nombres sont identiques** → ✅ Bases synchronisées

**Si les nombres sont différents** → ❌ Besoin de synchroniser

---

## 🔄 Si les Bases ne sont PAS à Jour

### Pour le Membre qui n'est pas à Jour

**Option 1 : Script Automatique**

```powershell
# 1. Récupérer depuis Git
git pull

# 2. Importer les données (vide + import)
.\importer_donnees_complet.ps1
```

**Option 2 : Manuel**

```powershell
# 1. Pull
git pull

# 2. Dans SQL*Plus
```

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

## ✅ Checklist de Synchronisation

### PC Principal (Toi)

- [ ] Export récent fait (`.\exporter_donnees.ps1`)
- [ ] Fichier poussé vers Git (`git push`)
- [ ] Vérification : Compter les données dans Oracle

### PC Membre 2

- [ ] `git pull` exécuté
- [ ] `.\importer_donnees_complet.ps1` exécuté
- [ ] Import terminé sans erreur
- [ ] Vérification : Compter les données dans Oracle
- [ ] Comparaison avec PC Principal : **Nombres identiques ?**

### PC Membre 3

- [ ] `git pull` exécuté
- [ ] `.\importer_donnees_complet.ps1` exécuté
- [ ] Import terminé sans erreur
- [ ] Vérification : Compter les données dans Oracle
- [ ] Comparaison avec PC Principal : **Nombres identiques ?**

---

## 🎯 Test Rapide

### Créer une Réclamation de Test

**Sur le PC Principal** :

1. Crée une réclamation avec un titre unique (ex: "TEST SYNC 2025-12-17")
2. Exporte et push :
   ```powershell
   .\synchroniser_donnees.ps1
   ```

**Sur les Autres PC** :

1. Pull et importe :
   ```powershell
   git pull
   .\recuperer_donnees.ps1
   ```

2. Vérifie dans l'interface : La réclamation "TEST SYNC 2025-12-17" apparaît ?

**Si OUI** → ✅ Synchronisation fonctionne !

**Si NON** → ❌ Vérifie les étapes ci-dessus

---

## 📋 Résumé

### Pour Vérifier

```sql
-- Dans SQL*Plus sur chaque PC
SELECT COUNT(*) FROM ETUDIANT;
SELECT COUNT(*) FROM RECLAMATION;
```

**Compare les résultats entre les PC.**

### Pour Synchroniser

```powershell
# Sur le PC qui n'est pas à jour
git pull
.\importer_donnees_complet.ps1
```

---

## 💡 Astuce

**Établir une routine de vérification** :
- **Chaque matin** : Vérifier que les nombres correspondent
- **Avant de travailler** : `git pull` + `recuperer_donnees.ps1`
- **Après modifications** : `synchroniser_donnees.ps1`

