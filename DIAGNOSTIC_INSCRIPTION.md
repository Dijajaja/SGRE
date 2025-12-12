# 🔍 Diagnostic - Erreur d'inscription

## Vérifications à faire :

### 1. Vérifier que le serveur backend est démarré
- Ouvrez un terminal dans le dossier `backend`
- Exécutez : `npm start` ou `node server.js`
- Vous devriez voir : `🚀 Serveur démarré sur le port 3001`

### 2. Vérifier que la base de données est configurée
- Le script `oracle/08_add_password.sql` doit avoir été exécuté
- Connectez-vous à Oracle et vérifiez :
```sql
CONNECT SGRE_USER/sgre_password@localhost:1521/XEPDB1;
DESC ETUDIANT;
```
- Vous devriez voir la colonne `MOT_DE_PASSE` dans la description

### 3. Vérifier les logs du serveur
Quand vous essayez de vous inscrire, vous devriez voir dans la console du serveur :
- `📝 POST /api/etudiants appelé`
- `📝 Données reçues pour inscription: ...`
- `📧 Email généré: ...`
- `🔍 Vérification de l'existence de l'email...`
- `✅ Connexion obtenue`
- `💾 Insertion de l'étudiant...`

Si vous voyez une erreur Oracle, notez le code d'erreur (ORA-XXXXX).

### 4. Vérifier la console du navigateur
- Ouvrez la console (F12)
- Regardez les erreurs affichées
- Notez le message d'erreur exact

### 5. Erreurs courantes et solutions

#### Erreur 404 : Route non trouvée
- **Cause** : Le serveur backend n'est pas démarré ou les routes ne sont pas chargées
- **Solution** : Redémarrez le serveur backend

#### Erreur ORA-00942 : Table ou vue n'existe pas
- **Cause** : La table ETUDIANT n'existe pas
- **Solution** : Exécutez `oracle/01_schema.sql`

#### Erreur ORA-00904 : Identificateur non valide
- **Cause** : La colonne `mot_de_passe` n'existe pas
- **Solution** : Exécutez `oracle/08_add_password.sql`

#### Erreur ORA-00001 : Violation de contrainte unique
- **Cause** : Le matricule ou l'email existe déjà
- **Solution** : Utilisez un autre matricule

#### Erreur de connexion à la base de données
- **Cause** : Oracle n'est pas démarré ou les identifiants sont incorrects
- **Solution** : Vérifiez le fichier `.env` dans le dossier `backend`

## Commandes SQL utiles

```sql
-- Vérifier la structure de la table
DESC ETUDIANT;

-- Vérifier les étudiants existants
SELECT * FROM ETUDIANT;

-- Vérifier si la colonne mot_de_passe existe
SELECT column_name, data_type 
FROM user_tab_columns 
WHERE table_name = 'ETUDIANT' 
AND column_name = 'MOT_DE_PASSE';
```

