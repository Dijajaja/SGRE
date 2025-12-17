# 📥 Import pour Membre 3 (AISHA)

## 📍 Chemin du Projet
`C:\Users\AISHA\SGRE\`

---

## ✅ Import dans SQL*Plus (Méthode Simple)

### Étape 1 : Ouvrir SQL*Plus

Ouvre SQL*Plus (pas PowerShell).

### Étape 2 : Se Connecter

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
```

### Étape 3 : Importer les Données

**Option A : Chemin Complet** (Recommandé)

```sql
@C:\Users\AISHA\SGRE\oracle\export_donnees_complet.sql
```

**Option B : Aller dans le Dossier d'Abord**

```sql
HOST cd C:\Users\AISHA\SGRE\oracle
@export_donnees_complet.sql
```

**Option C : Chemin Relatif**

```sql
HOST cd C:\Users\AISHA\SGRE
@oracle\export_donnees_complet.sql
```

### Étape 4 : Vérifier l'Import

```sql
SELECT COUNT(*) FROM ETUDIANT;    -- Devrait être 9
SELECT COUNT(*) FROM RECLAMATION; -- Devrait être 8
SELECT COUNT(*) FROM ADMIN;        -- Devrait être 3
```

---

## 🔧 Si le Fichier n'Existe Pas

**Dans PowerShell** :

```powershell
cd C:\Users\AISHA\SGRE
git pull
```

Puis réessayer l'import dans SQL*Plus.

---

## 📋 Commandes Complètes (Copie-Colle)

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
@C:\Users\AISHA\SGRE\oracle\export_donnees_complet.sql
```

**C'est tout !** L'import va prendre quelques minutes.

---

## ✅ Après l'Import

1. **Vérifier** : `SELECT COUNT(*) FROM RECLAMATION;` (devrait être 8)
2. **Redémarrer le backend** :
   ```powershell
   cd C:\Users\AISHA\SGRE\backend
   npm start
   ```
3. **Redémarrer le frontend** (nouveau terminal) :
   ```powershell
   cd C:\Users\AISHA\SGRE\frontend
   npm start
   ```
4. **Vérifier dans l'interface** : Les réclamations doivent apparaître

---

## 🐛 Problèmes Courants

### "SP2-0310: impossible d'ouvrir le fichier"

**Solution** : Vérifier que le fichier existe :
```powershell
Test-Path C:\Users\AISHA\SGRE\oracle\export_donnees_complet.sql
```

Si `False`, faire `git pull`.

### "ORA-00001: violation de contrainte unique"

**Solution** : Vider les données d'abord :
```sql
DELETE FROM NOTIFICATION;
DELETE FROM TRAITEMENT;
DELETE FROM RECLAMATION;
DELETE FROM ETUDIANT;
DELETE FROM ADMIN;
COMMIT;
```

Puis réimporter.

---

## 💡 Astuce

**Utilise toujours le chemin complet** : `@C:\Users\AISHA\SGRE\oracle\export_donnees_complet.sql`

C'est la méthode la plus fiable !

