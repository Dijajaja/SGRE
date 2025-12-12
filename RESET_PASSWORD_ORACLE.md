# 🔐 Réinitialisation du mot de passe Oracle

## Problème
Erreur `ORA-01017: nom utilisateur/mot de passe non valide ; connexion refusée`

## Solutions

### Option 1 : Vérifier les identifiants dans .env
Vérifiez le fichier `backend/.env` pour voir les identifiants configurés.

### Option 2 : Se connecter en tant que SYSDBA et réinitialiser le mot de passe

1. **Connectez-vous en tant que SYSDBA :**
   ```sql
   CONNECT sys/oracle AS SYSDBA;
   ```

2. **Basculez vers le PDB :**
   ```sql
   ALTER SESSION SET CONTAINER = XEPDB1;
   ```

3. **Réinitialisez le mot de passe de SGRE_USER :**
   ```sql
   ALTER USER SGRE_USER IDENTIFIED BY sgre_password;
   ```

4. **Vérifiez que l'utilisateur existe :**
   ```sql
   SELECT username FROM dba_users WHERE username = 'SGRE_USER';
   ```

5. **Si l'utilisateur n'existe pas, créez-le :**
   ```sql
   CREATE USER SGRE_USER IDENTIFIED BY sgre_password;
   GRANT CONNECT, RESOURCE TO SGRE_USER;
   GRANT CREATE VIEW, CREATE PROCEDURE, CREATE TRIGGER TO SGRE_USER;
   GRANT UNLIMITED TABLESPACE TO SGRE_USER;
   ```

6. **Connectez-vous avec le nouvel utilisateur :**
   ```sql
   CONNECT SGRE_USER/sgre_password@localhost:1521/XEPDB1;
   ```

### Option 3 : Utiliser un autre mot de passe
Si vous connaissez un autre mot de passe, essayez-le.

### Option 4 : Vérifier le service name
Assurez-vous que le service name est correct :
- `XEPDB1` pour Oracle 21c Express Edition
- Ou le nom de votre PDB si différent
