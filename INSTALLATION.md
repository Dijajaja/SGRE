# Guide d'Installation Détaillé - SGRE

## 📋 Prérequis

### Logiciels Requis

1. **Oracle Database**
   - Version 11g ou supérieure
   - Oracle Express Edition (XE) est suffisant pour le développement
   - Client Oracle installé (pour les connexions)

2. **Node.js**
   - Version 14.x ou supérieure
   - Télécharger depuis [nodejs.org](https://nodejs.org/)

3. **npm** (inclus avec Node.js)

4. **Un éditeur de code** (VS Code recommandé)

## 🔧 Installation Étape par Étape

### Étape 1 : Configuration Oracle Database

#### 1.1 Créer un Utilisateur Oracle

Connectez-vous à Oracle en tant qu'administrateur (SYSDBA) :

```sql
-- Se connecter en tant que sys
sqlplus sys/password@localhost:1521/XE as sysdba

-- Créer un utilisateur pour le projet
CREATE USER sgre_user IDENTIFIED BY sgre_password;
GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE PROCEDURE, CREATE TRIGGER TO sgre_user;
GRANT UNLIMITED TABLESPACE TO sgre_user;

-- Se connecter avec le nouvel utilisateur
CONNECT sgre_user/sgre_password@localhost:1521/XE
```

#### 1.2 Exécuter les Scripts Oracle

Exécutez les scripts dans l'ordre suivant :

```bash
# Depuis SQL*Plus ou SQL Developer
@oracle/01_schema.sql
@oracle/02_triggers.sql
@oracle/03_fonctions.sql
@oracle/04_procedures.sql
@oracle/05_vues.sql
```

**Ou manuellement :**

1. Ouvrez SQL Developer ou SQL*Plus
2. Connectez-vous avec l'utilisateur créé
3. Ouvrez chaque fichier `.sql` dans l'ordre
4. Exécutez chaque script (F5 dans SQL Developer)

#### 1.3 Vérifier l'Installation

```sql
-- Vérifier que les tables existent
SELECT table_name FROM user_tables;

-- Vérifier que les séquences existent
SELECT sequence_name FROM user_sequences;

-- Vérifier que les triggers existent
SELECT trigger_name FROM user_triggers;

-- Vérifier que les fonctions existent
SELECT object_name FROM user_objects WHERE object_type = 'FUNCTION';

-- Vérifier que les procédures existent
SELECT object_name FROM user_objects WHERE object_type = 'PROCEDURE';

-- Vérifier que les vues existent
SELECT view_name FROM user_views;
```

#### 1.4 (Optionnel) Exécuter les Tests

```sql
@oracle/06_requetes_test.sql
```

### Étape 2 : Installation du Backend Node.js

#### 2.1 Installer les Dépendances Oracle

**Important** : Le package `oracledb` nécessite Oracle Instant Client.

**Option A : Avec Oracle Instant Client (Recommandé)**

1. Téléchargez Oracle Instant Client depuis [oracle.com](https://www.oracle.com/database/technologies/instant-client/downloads.html)
2. Extrayez dans un dossier (ex: `C:\oracle\instantclient_21_8`)
3. Ajoutez le chemin au PATH système

**Option B : Utiliser le package npm (Plus simple mais peut nécessiter des configurations supplémentaires)**

```bash
cd backend
npm install
```

#### 2.2 Configuration du Backend

1. Créez un fichier `.env` dans le dossier `backend/` :

```env
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE=XE
ORACLE_USER=sgre_user
ORACLE_PASSWORD=sgre_password
PORT=3001
NODE_ENV=development
```

2. Ajustez les valeurs selon votre configuration Oracle

#### 2.3 Tester la Connexion

```bash
cd backend
node -e "const db = require('./db/oracle'); db.initialize().then(() => console.log('✅ Connexion OK')).catch(err => console.error('❌ Erreur:', err));"
```

#### 2.4 Démarrer le Serveur

```bash
npm start
# ou en mode développement avec auto-reload
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:3001`

### Étape 3 : Installation du Frontend React

#### 3.1 Installer les Dépendances

```bash
cd frontend
npm install
```

#### 3.2 Configuration (Optionnel)

Créez un fichier `.env` dans le dossier `frontend/` si le backend n'est pas sur le port par défaut :

```env
REACT_APP_API_URL=http://localhost:3001/api
```

#### 3.3 Démarrer l'Application

```bash
npm start
```

L'application s'ouvrira automatiquement dans votre navigateur sur `http://localhost:3000`

## 🧪 Tests de Validation

### Test 1 : Vérifier la Base de Données

```sql
-- Vérifier les données de test
SELECT * FROM ETUDIANT;
SELECT * FROM ADMIN;
SELECT * FROM RECLAMATION;
```

### Test 2 : Tester l'API Backend

Ouvrez un terminal et testez les endpoints :

```bash
# Test de l'API
curl http://localhost:3001/

# Obtenir tous les étudiants
curl http://localhost:3001/api/etudiants

# Obtenir toutes les réclamations
curl http://localhost:3001/api/reclamations

# Obtenir les statistiques
curl http://localhost:3001/api/statistiques/globales
```

### Test 3 : Tester l'Interface React

1. Ouvrez `http://localhost:3000`
2. Connectez-vous en tant qu'étudiant (sélectionnez un étudiant dans la liste)
3. Créez une réclamation
4. Déconnectez-vous et connectez-vous en tant qu'admin
5. Traitez la réclamation
6. Reconnectez-vous en tant qu'étudiant pour voir la notification

## 🔍 Dépannage

### Problème : Erreur de connexion Oracle

**Symptômes** : `ORA-12154: TNS:could not resolve the connect identifier`

**Solutions** :
1. Vérifiez que le service Oracle est démarré
2. Vérifiez les paramètres dans `.env` (HOST, PORT, SERVICE)
3. Testez la connexion avec SQL*Plus :
   ```bash
   sqlplus sgre_user/sgre_password@localhost:1521/XE
   ```

### Problème : Module oracledb non trouvé

**Symptômes** : `Cannot find module 'oracledb'`

**Solutions** :
1. Réinstallez les dépendances : `npm install`
2. Vérifiez que Oracle Instant Client est installé et dans le PATH
3. Sur Windows, redémarrez le terminal après l'installation

### Problème : Port déjà utilisé

**Symptômes** : `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions** :
1. Changez le port dans `.env` : `PORT=3002`
2. Ou arrêtez le processus utilisant le port :
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```

### Problème : CORS Error dans le navigateur

**Symptômes** : `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions** :
1. Vérifiez que le backend est démarré
2. Vérifiez que l'URL de l'API est correcte dans `.env` du frontend
3. Le backend a déjà CORS activé, mais vérifiez la configuration

## 📚 Ressources Utiles

- [Documentation Oracle Database](https://docs.oracle.com/en/database/)
- [Documentation Node.js oracledb](https://oracle.github.io/node-oracledb/)
- [Documentation React](https://react.dev/)

## ✅ Checklist d'Installation

- [ ] Oracle Database installé et démarré
- [ ] Utilisateur Oracle créé avec les permissions nécessaires
- [ ] Scripts Oracle exécutés (01 à 05)
- [ ] Tables, séquences, triggers, fonctions, procédures et vues créés
- [ ] Node.js installé (v14+)
- [ ] Oracle Instant Client installé (si nécessaire)
- [ ] Backend : dépendances installées
- [ ] Backend : fichier `.env` configuré
- [ ] Backend : serveur démarré sur le port 3001
- [ ] Frontend : dépendances installées
- [ ] Frontend : application démarrée sur le port 3000
- [ ] Tests de connexion réussis
- [ ] Interface accessible dans le navigateur

## 🎉 Félicitations !

Si tous les tests passent, votre installation est complète et vous pouvez commencer à utiliser le système SGRE !

