# 🔧 Résolution : Colonne MOT_DE_PASSE Manquante dans ADMIN

## ❌ Problème

La colonne `MOT_DE_PASSE` n'existe pas dans la table `ADMIN` sur le PC d'AISHA, donc la connexion admin ne fonctionne pas.

---

## ✅ Solution : Ajouter la Colonne

### Sur le PC d'AISHA, dans SQL*Plus :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Ajouter la colonne
ALTER TABLE ADMIN ADD mot_de_passe VARCHAR2(100);

-- Mettre à jour les mots de passe (par défaut = email)
UPDATE ADMIN SET mot_de_passe = email WHERE mot_de_passe IS NULL;
COMMIT;
```

**OU exécuter le script automatique** :

```sql
@oracle/26_ajouter_mot_de_passe_admin.sql
```

---

## 🔍 Vérification

### Après avoir ajouté la colonne :

```sql
-- Voir les admins et leurs mots de passe
SELECT 
    id,
    nom || ' ' || prenom AS nom_complet,
    email,
    role,
    mot_de_passe
FROM ADMIN;
```

**Tous les admins doivent avoir un mot de passe** (généralement = email).

---

## 🎯 Identifiants pour Se Connecter

D'après l'export, les identifiants sont :

1. **Diary Ba** (ADMINISTRATEUR)
   - Email : `diary.ba@iscae.mr`
   - Mot de passe : `diary.ba@iscae.mr`

2. **Aissata Sall** (RESPONSABLE)
   - Email : `sall.aissa@iscae.mr`
   - Mot de passe : `sall.aissa@iscae.mr`

3. **Meimouna Diallo** (SUPPORT)
   - Email : `mei.diallo@iscae.mr`
   - Mot de passe : `mei.diallo@iscae.mr`

---

## 📋 Commandes Complètes (Copie-Colle)

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;

-- Ajouter la colonne
ALTER TABLE ADMIN ADD mot_de_passe VARCHAR2(100);

-- Mettre à jour les mots de passe
UPDATE ADMIN SET mot_de_passe = email;
COMMIT;

-- Vérifier
SELECT id, nom, prenom, email, role, mot_de_passe FROM ADMIN;
```

---

## ✅ Après l'Ajout

1. **Redémarrer le backend** :
   ```powershell
   cd C:\Users\AISHA\SGRE\backend
   npm start
   ```

2. **Tester la connexion** dans l'interface avec :
   - Email : `diary.ba@iscae.mr`
   - Mot de passe : `diary.ba@iscae.mr`

---

## 💡 Important

**Si la colonne existe déjà mais est vide** :

```sql
UPDATE ADMIN SET mot_de_passe = email WHERE mot_de_passe IS NULL;
COMMIT;
```

**Si tu veux des mots de passe différents** :

```sql
UPDATE ADMIN SET mot_de_passe = 'nouveau_mot_de_passe' WHERE email = 'diary.ba@iscae.mr';
COMMIT;
```

