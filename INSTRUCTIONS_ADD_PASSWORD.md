# 🔧 Instructions pour ajouter la colonne MOT_DE_PASSE

## Problème
L'erreur `ORA-00904: "MOT_DE_PASSE" : identificateur non valide` indique que la colonne `mot_de_passe` n'existe pas dans la table ETUDIANT.

## Solution

### Étape 1 : Connectez-vous à Oracle
Ouvrez SQL*Plus ou SQL Developer et connectez-vous :

```sql
CONNECT SGRE_USER/sgre_password@localhost:1521/XEPDB1;
```

### Étape 2 : Exécutez le script
Exécutez le script suivant :

```sql
@C:\Users\PC\BD\oracle\08_add_password.sql
```

Ou copiez-collez directement le contenu du script dans SQL*Plus.

### Étape 3 : Vérifiez que la colonne existe
```sql
DESC ETUDIANT;
```

Vous devriez voir la colonne `MOT_DE_PASSE` dans la liste.

### Étape 4 : Testez à nouveau l'inscription
Une fois le script exécuté, essayez à nouveau de vous inscrire dans l'application.

## Contenu du script

Le script `08_add_password.sql` :
- Ajoute la colonne `mot_de_passe` à la table ETUDIANT
- Ajoute la colonne `mot_de_passe` à la table ADMIN
- Met à jour les mots de passe existants avec une valeur par défaut (email)
- Rend les champs obligatoires

