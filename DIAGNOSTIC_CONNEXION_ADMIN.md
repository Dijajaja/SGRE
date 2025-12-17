# 🔐 Diagnostic : Problème de Connexion Admin

## ❌ Problème

Le membre 3 (AISHA) ne peut pas se connecter avec les identifiants admin dans l'interface.

---

## 🔍 Diagnostic

### Étape 1 : Vérifier les Admins dans Oracle

**Sur le PC d'AISHA, dans SQL*Plus** :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Voir tous les admins
SELECT id, nom, prenom, email, role FROM ADMIN;
```

**OU exécuter le script de diagnostic** :

```sql
@oracle/25_verifier_admins.sql
```

---

### Étape 2 : Vérifier les Identifiants

D'après l'export, les admins ont ces identifiants :

1. **Diary Ba** (ADMINISTRATEUR)
   - Email : `diary.ba@iscae.mr`
   - Mot de passe : `diary.ba@iscae.mr` (par défaut)

2. **Aissata Sall** (RESPONSABLE)
   - Email : `sall.aissa@iscae.mr`
   - Mot de passe : `sall.aissa@iscae.mr` (par défaut)

3. **Meimouna Diallo** (SUPPORT)
   - Email : `mei.diallo@iscae.mr`
   - Mot de passe : `mei.diallo@iscae.mr` (par défaut)

---

### Étape 3 : Vérifier que la Colonne MOT_DE_PASSE Existe

**Dans SQL*Plus** :

```sql
-- Vérifier la structure de la table
SELECT column_name, data_type 
FROM user_tab_columns 
WHERE table_name = 'ADMIN';
```

**Si la colonne `MOT_DE_PASSE` n'existe pas** → Voir Solution 1.

---

### Étape 4 : Vérifier le Backend

**Dans PowerShell** :

```powershell
cd C:\Users\AISHA\SGRE\backend
npm start
```

**Vérifier les logs** :
- Pas d'erreurs Oracle
- Route `/api/auth/login/admin` est disponible

---

## ✅ Solutions

### Solution 1 : Colonne MOT_DE_PASSE Manquante

**Si la colonne n'existe pas, l'ajouter** :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Ajouter la colonne
ALTER TABLE ADMIN ADD mot_de_passe VARCHAR2(100);

-- Mettre à jour les mots de passe (par défaut = email)
UPDATE ADMIN SET mot_de_passe = email WHERE mot_de_passe IS NULL;
COMMIT;
```

---

### Solution 2 : Mots de Passe Incorrects

**Si les mots de passe ne sont pas corrects** :

```sql
-- Réinitialiser les mots de passe
UPDATE ADMIN SET mot_de_passe = email;
COMMIT;
```

**OU mettre des mots de passe spécifiques** :

```sql
UPDATE ADMIN SET mot_de_passe = 'diary.ba@iscae.mr' WHERE email = 'diary.ba@iscae.mr';
UPDATE ADMIN SET mot_de_passe = 'sall.aissa@iscae.mr' WHERE email = 'sall.aissa@iscae.mr';
UPDATE ADMIN SET mot_de_passe = 'mei.diallo@iscae.mr' WHERE email = 'mei.diallo@iscae.mr';
COMMIT;
```

---

### Solution 3 : Réimporter les Données

**Si les admins n'existent pas ou sont incorrects** :

```sql
-- Vider
DELETE FROM ADMIN;
COMMIT;

-- Réimporter
@oracle/export_donnees_complet.sql
```

---

## 🎯 Test de Connexion

### Dans l'Interface

**Essayer de se connecter avec** :
- Email : `diary.ba@iscae.mr`
- Mot de passe : `diary.ba@iscae.mr`

**OU** :
- Email : `sall.aissa@iscae.mr`
- Mot de passe : `sall.aissa@iscae.mr`

---

## 📋 Checklist

- [ ] Admins existent dans Oracle (3 admins)
- [ ] Colonne `MOT_DE_PASSE` existe dans table `ADMIN`
- [ ] Mots de passe sont définis (pas NULL)
- [ ] Backend démarre sans erreur
- [ ] Route `/api/auth/login/admin` fonctionne
- [ ] Test de connexion avec les identifiants

---

## 🔧 Vérification Rapide

**Dans SQL*Plus** :

```sql
-- Voir les admins et leurs mots de passe
SELECT 
    id,
    nom || ' ' || prenom AS nom_complet,
    email,
    role,
    CASE 
        WHEN mot_de_passe IS NULL THEN '❌ NULL'
        WHEN mot_de_passe = '' THEN '❌ VIDE'
        ELSE '✅ OK'
    END AS statut_mot_de_passe
FROM ADMIN;
```

**Tous doivent avoir "✅ OK"** pour le statut du mot de passe.

