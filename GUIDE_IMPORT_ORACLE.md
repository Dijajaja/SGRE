# 📥 Guide d'Importation des Données dans Oracle

## 🎯 Objectif

Importer les données exportées depuis un autre PC dans ta base Oracle locale.

---

## 📋 Prérequis

1. ✅ Le fichier `export_donnees_complet.sql` doit être présent sur ton PC
2. ✅ Oracle Database doit être installé et démarré
3. ✅ L'utilisateur `SGRE_USER` doit exister avec les permissions nécessaires
4. ✅ Les tables doivent déjà être créées (schéma existant)

---

## 🔧 Méthode 1 : SQL*Plus (Ligne de commande)

### Étape 1 : Ouvrir SQL*Plus

**Option A : Depuis le menu Démarrer**
- Cherche "SQL Plus" dans le menu Démarrer
- Clique sur "SQL Plus"

**Option B : Depuis PowerShell/Terminal**
```powershell
sqlplus
```

### Étape 2 : Se connecter

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
```

**Si tu as un autre mot de passe** :
```sql
CONNECT SGRE_USER/[TON_MOT_DE_PASSE]@localhost:1521/XEPDB1;
```

### Étape 3 : Aller dans le dossier oracle

```sql
-- Vérifier où tu es
HOST cd

-- Aller dans le dossier oracle (remplace par ton chemin)
HOST cd C:\Users\[TON_NOM_UTILISATEUR]\Documents\SGRE\oracle
```

**Ou utiliser le chemin complet dans la commande d'import** (voir Étape 4).

### Étape 4 : Importer les données

**Option A : Si le fichier est dans le dossier oracle**
```sql
@export_donnees_complet.sql
```

**Option B : Avec le chemin complet**
```sql
@C:\Users\[TON_NOM_UTILISATEUR]\Documents\SGRE\oracle\export_donnees_complet.sql
```

**Option C : Depuis n'importe quel dossier**
```sql
@C:\chemin\complet\vers\export_donnees_complet.sql
```

### Étape 5 : Vérifier l'importation

```sql
-- Compter les données importées
SELECT 'Étudiants: ' || COUNT(*) FROM ETUDIANT;
SELECT 'Admins: ' || COUNT(*) FROM ADMIN;
SELECT 'Réclamations: ' || COUNT(*) FROM RECLAMATION;
SELECT 'Traitements: ' || COUNT(*) FROM TRAITEMENT;
SELECT 'Notifications: ' || COUNT(*) FROM NOTIFICATION;
```

---

## 🖥️ Méthode 2 : SQL Developer (Interface graphique)

### Étape 1 : Ouvrir SQL Developer

- Lance "Oracle SQL Developer" depuis le menu Démarrer

### Étape 2 : Se connecter

1. **Créer une nouvelle connexion** (si pas déjà créée) :
   - Clique sur l'icône "+" à côté de "Connections"
   - Remplis les informations :
     ```
     Nom de connexion : SGRE
     Nom d'utilisateur : SGRE_USER
     Mot de passe : 12345
     Hôte : localhost
     Port : 1521
     SID/Service : XEPDB1
     ```
   - Clique sur "Tester" puis "Enregistrer"

2. **Se connecter** :
   - Double-clique sur la connexion "SGRE"

### Étape 3 : Ouvrir le fichier d'import

1. **Menu** : `File` → `Open`
2. **Naviguer** vers le fichier `export_donnees_complet.sql`
3. **Ouvrir** le fichier

### Étape 4 : Exécuter le script

1. **Sélectionner tout** : `Ctrl + A`
2. **Exécuter** : `F5` ou clic droit → `Run Script`
3. **Attendre** que toutes les commandes s'exécutent

### Étape 5 : Vérifier l'importation

Dans l'onglet "Worksheet", exécute :

```sql
SELECT 'Étudiants: ' || COUNT(*) FROM ETUDIANT;
SELECT 'Admins: ' || COUNT(*) FROM ADMIN;
SELECT 'Réclamations: ' || COUNT(*) FROM RECLAMATION;
SELECT 'Traitements: ' || COUNT(*) FROM TRAITEMENT;
SELECT 'Notifications: ' || COUNT(*) FROM NOTIFICATION;
```

---

## 🔄 Méthode 3 : Script PowerShell Automatique

### Créer un script d'import

Crée un fichier `importer_donnees.ps1` :

```powershell
# Script PowerShell pour importer les données Oracle
# À exécuter sur le PC qui doit recevoir les données

Write-Host "📥 Import des données Oracle..." -ForegroundColor Green

$projectPath = $PSScriptRoot
if (-not $projectPath) {
    $projectPath = Get-Location
}

$oraclePath = Join-Path $projectPath "oracle"
$importFile = Join-Path $oraclePath "export_donnees_complet.sql"

# Vérifier que le fichier existe
if (-not (Test-Path $importFile)) {
    Write-Host "❌ Le fichier d'import n'existe pas !" -ForegroundColor Red
    Write-Host "   Chemin attendu : $importFile" -ForegroundColor Yellow
    Write-Host "   Assure-toi d'avoir transféré le fichier export_donnees_complet.sql" -ForegroundColor Yellow
    exit 1
}

Write-Host "📄 Fichier trouvé : $importFile" -ForegroundColor Cyan

# Créer un script SQL temporaire
$tempSqlFile = Join-Path $env:TEMP "import_temp.sql"
$sqlContent = @"
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
SET PAGESIZE 0
SET FEEDBACK ON
SET VERIFY OFF
SET ECHO ON
@$importFile
SELECT '✅ Import terminé !' FROM DUAL;
EXIT
"@

$sqlContent | Out-File -FilePath $tempSqlFile -Encoding ASCII

Write-Host "🔄 Exécution de SQL*Plus..." -ForegroundColor Yellow
$sqlplusPath = "sqlplus"
$process = Start-Process -FilePath $sqlplusPath -ArgumentList "/nolog @`"$tempSqlFile`"" -Wait -NoNewWindow -PassThru

if ($process.ExitCode -eq 0) {
    Write-Host "✅ Import réussi !" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'import !" -ForegroundColor Red
    Write-Host "Code de sortie : $($process.ExitCode)" -ForegroundColor Red
}

# Nettoyer le fichier temporaire
if (Test-Path $tempSqlFile) {
    Remove-Item $tempSqlFile -Force
}

Write-Host "`n✅ Terminé ! Vérifie les données dans Oracle." -ForegroundColor Green
```

### Exécuter le script

```powershell
cd C:\Users\[TON_NOM_UTILISATEUR]\Documents\SGRE
.\importer_donnees.ps1
```

---

## ⚠️ Gestion des Conflits (Données Existantes)

### Option A : Ajouter les données (Recommandé)

Si tu veux **ajouter** les nouvelles données sans supprimer les anciennes :

1. **Vérifier les IDs existants** :
```sql
SELECT MAX(id) FROM ETUDIANT;
SELECT MAX(id) FROM ADMIN;
SELECT MAX(id) FROM RECLAMATION;
```

2. **Modifier les séquences** (si nécessaire) :
```sql
-- Si le dernier ID étudiant est 10, mettre la séquence à 11
ALTER SEQUENCE seq_etudiant RESTART START WITH 11;
```

3. **Importer** normalement

### Option B : Remplacer toutes les données

Si tu veux **remplacer** toutes les données existantes :

**AVANT l'import**, dans SQL*Plus ou SQL Developer :

```sql
-- ATTENTION : Ceci supprimera TOUTES les données existantes !
DELETE FROM NOTIFICATION;
DELETE FROM TRAITEMENT;
DELETE FROM RECLAMATION;
DELETE FROM ETUDIANT WHERE id > 1;  -- Garder l'admin par défaut si nécessaire
DELETE FROM ADMIN WHERE id > 1;     -- Garder l'admin par défaut si nécessaire
COMMIT;
```

**PUIS** importer normalement.

---

## 🐛 Problèmes Courants et Solutions

### Problème 1 : "SP2-0310: unable to open file"

**Cause** : Le fichier n'est pas trouvé au chemin spécifié

**Solutions** :
1. Vérifier que le fichier existe :
   ```sql
   HOST dir C:\Users\[TON_NOM_UTILISATEUR]\Documents\SGRE\oracle\export_donnees_complet.sql
   ```

2. Utiliser le chemin complet :
   ```sql
   @C:\chemin\complet\vers\export_donnees_complet.sql
   ```

3. Copier le fichier dans le dossier oracle :
   ```powershell
   Copy-Item "C:\chemin\vers\export_donnees_complet.sql" -Destination "C:\Users\[TON_NOM_UTILISATEUR]\Documents\SGRE\oracle\"
   ```

### Problème 2 : "ORA-00001: unique constraint violated"

**Cause** : Des données avec les mêmes IDs existent déjà

**Solutions** :
1. **Supprimer les données existantes** (voir Option B ci-dessus)
2. **Ou modifier les IDs** dans le fichier d'export avant l'import

### Problème 3 : "ORA-00942: table or view does not exist"

**Cause** : Les tables n'existent pas encore

**Solution** : Exécuter d'abord les scripts de création du schéma :
```sql
@oracle/01_schema.sql
@oracle/02_triggers.sql
@oracle/03_fonctions.sql
@oracle/04_procedures.sql
@oracle/05_vues.sql
```

### Problème 4 : "ORA-01017: nom utilisateur/mot de passe non valide"

**Cause** : Mauvais identifiants

**Solution** : Vérifier les identifiants dans `backend/.env` ou demander au propriétaire du PC serveur.

---

## ✅ Vérification Finale

Après l'import, vérifie que tout est correct :

```sql
-- Vérifier le nombre de données
SELECT 
    (SELECT COUNT(*) FROM ETUDIANT) AS nb_etudiants,
    (SELECT COUNT(*) FROM ADMIN) AS nb_admins,
    (SELECT COUNT(*) FROM RECLAMATION) AS nb_reclamations,
    (SELECT COUNT(*) FROM TRAITEMENT) AS nb_traitements,
    (SELECT COUNT(*) FROM NOTIFICATION) AS nb_notifications
FROM DUAL;

-- Vérifier quelques données
SELECT * FROM ETUDIANT FETCH FIRST 5 ROWS ONLY;
SELECT * FROM RECLAMATION FETCH FIRST 5 ROWS ONLY;
```

---

## 🎯 Résumé Rapide

### SQL*Plus (Ligne de commande)
```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
@C:\Users\[TON_NOM_UTILISATEUR]\Documents\SGRE\oracle\export_donnees_complet.sql
```

### SQL Developer (Interface graphique)
1. Ouvrir le fichier `export_donnees_complet.sql`
2. `F5` pour exécuter

### PowerShell (Automatique)
```powershell
.\importer_donnees.ps1
```

---

## 📞 Besoin d'Aide ?

Si tu rencontres des problèmes :
1. Vérifie que le fichier `export_donnees_complet.sql` existe
2. Vérifie que tu es connecté avec les bons identifiants
3. Vérifie que les tables existent déjà
4. Regarde les messages d'erreur Oracle pour plus de détails

