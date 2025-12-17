# 📥 Import Manuel Simple dans SQL*Plus

## ✅ Méthode la Plus Simple et Fiable

Au lieu d'utiliser PowerShell, fais l'import directement dans SQL*Plus.

---

## 📋 Étapes

### Étape 1 : Vérifier que le Fichier Existe

**Dans PowerShell** :

```powershell
Test-Path oracle\export_donnees_complet.sql
```

Si ça retourne `False`, faire :
```powershell
git pull
```

### Étape 2 : Aller dans le Dossier Oracle

**Dans SQL*Plus** :

```sql
-- Vérifier où tu es
HOST cd

-- Aller dans le dossier oracle (remplace par ton chemin)
HOST cd C:\Users\[TON_NOM_UTILISATEUR]\Documents\SGRE\oracle
```

**OU utilise le chemin complet dans la commande d'import** (voir Étape 3).

### Étape 3 : Importer les Données

**Dans SQL*Plus** :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Importer avec le chemin complet
@C:\Users\[TON_NOM_UTILISATEUR]\Documents\SGRE\oracle\export_donnees_complet.sql
```

**OU si tu es dans le dossier oracle** :

```sql
@export_donnees_complet.sql
```

### Étape 4 : Vérifier l'Import

```sql
SELECT COUNT(*) FROM ETUDIANT;    -- Devrait être 9
SELECT COUNT(*) FROM RECLAMATION; -- Devrait être 8
SELECT COUNT(*) FROM ADMIN;        -- Devrait être 3
```

---

## 🔧 Si le Script PowerShell Ne Répond Pas

### Option 1 : Annuler et Utiliser SQL*Plus

1. **Fermer la fenêtre PowerShell** (Ctrl+C ou fermer)
2. **Ouvrir SQL*Plus** séparément
3. **Faire l'import manuellement** (voir ci-dessus)

### Option 2 : Vérifier le Processus

**Dans PowerShell** (nouveau terminal) :

```powershell
# Vérifier si SQL*Plus est en cours d'exécution
Get-Process | Where-Object {$_.ProcessName -like "*sqlplus*"}
```

Si un processus SQL*Plus est actif, laisse-le se terminer.

---

## 📋 Commandes Complètes pour SQL*Plus

```sql
-- 1. Se connecter
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- 2. Vérifier que le fichier existe (optionnel)
HOST dir C:\Users\[TON_NOM_UTILISATEUR]\Documents\SGRE\oracle\export_donnees_complet.sql

-- 3. Importer
@C:\Users\[TON_NOM_UTILISATEUR]\Documents\SGRE\oracle\export_donnees_complet.sql

-- 4. Vérifier
SELECT COUNT(*) FROM RECLAMATION;
```

---

## ⚠️ Important

- **Utilise SQL*Plus directement** : Plus simple et fiable que PowerShell
- **Utilise le chemin complet** : Évite les problèmes de répertoire
- **Laisse le script se terminer** : L'import peut prendre quelques minutes

---

## ✅ Après l'Import

1. **Vérifier les données** : `SELECT COUNT(*) FROM RECLAMATION;`
2. **Redémarrer le backend** : `cd backend && npm start`
3. **Redémarrer le frontend** : `cd frontend && npm start`
4. **Vérifier dans l'interface** : Les réclamations doivent apparaître

