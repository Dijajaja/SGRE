# 🚀 Guide de Démarrage Rapide - Oracle

## Étape 1 : Lancer Oracle et se connecter

### Option A : SQL Developer (Recommandé - Interface graphique)

1. **Lancez Oracle SQL Developer**
   - Cherchez "SQL Developer" dans le menu Démarrer
   - Ou ouvrez-le depuis le dossier d'installation Oracle

2. **Créer une nouvelle connexion**
   - Cliquez sur l'icône "+" à côté de "Connections" dans le panneau gauche
   - Remplissez les informations :
     ```
     Nom de connexion : SGRE_ADMIN
     Nom d'utilisateur : sys
     Mot de passe : [votre mot de passe sys]
     Rôle : SYSDBA
     Hôte : localhost
     Port : 1521 
     SID/Service : XE (ou votre SID)
     ```
   - Cliquez sur "Tester" puis "Enregistrer"

3. **Se connecter**
   - Double-cliquez sur la connexion créée

### Option B : SQL*Plus (Ligne de commande)

1. **Ouvrez SQL*Plus**
   - Cherchez "SQL Plus" dans le menu Démarrer
   - Ou ouvrez un terminal et tapez : `sqlplus`

2. **Connectez-vous en tant qu'administrateur**
   ```
   sqlplus sys/password@localhost:1521/XE as sysdba
   ```
   (Remplacez `password` par votre mot de passe)

## Étape 2 : Créer un utilisateur pour le projet

Dans SQL Developer ou SQL*Plus, exécutez ces commandes :

```sql
-- Créer l'utilisateur
CREATE USER sgre_user IDENTIFIED BY sgre_password;

-- Donner les permissions nécessaires
GRANT CONNECT, RESOURCE TO sgre_user;
GRANT CREATE VIEW, CREATE PROCEDURE, CREATE TRIGGER TO sgre_user;
GRANT UNLIMITED TABLESPACE TO sgre_user;

-- Se connecter avec le nouvel utilisateur
CONNECT sgre_user/sgre_password@localhost:1521/XE;
```

**Note** : Changez `sgre_password` par un mot de passe de votre choix, et notez-le pour la configuration du backend.

## Étape 3 : Exécuter les scripts SQL

### Méthode 1 : Script d'installation complète (Recommandé)

Dans SQL Developer :
1. Ouvrez le fichier `oracle/00_install_complete.sql`
2. Cliquez sur "Exécuter le script" (F5) ou le bouton "Run Script"
3. Attendez que tous les scripts s'exécutent

Dans SQL*Plus :
```sql
@oracle/00_install_complete.sql
```

### Méthode 2 : Scripts individuels (si la méthode 1 ne fonctionne pas)

Exécutez dans l'ordre :

```sql
@oracle/01_schema.sql
@oracle/02_triggers.sql
@oracle/03_fonctions.sql
@oracle/04_procedures.sql
@oracle/05_vues.sql
```

**Dans SQL Developer** :
- Ouvrez chaque fichier `.sql`
- Cliquez sur "Exécuter le script" (F5)

**Dans SQL*Plus** :
- Assurez-vous d'être dans le bon répertoire
- Tapez `@` suivi du chemin du fichier

## Étape 4 : Vérifier l'installation

Exécutez ces requêtes pour vérifier que tout est créé :

```sql
-- Vérifier les tables
SELECT table_name FROM user_tables;
-- Devrait afficher : ETUDIANT, ADMIN, RECLAMATION, TRAITEMENT, NOTIFICATION

-- Vérifier les séquences
SELECT sequence_name FROM user_sequences;
-- Devrait afficher : SEQ_ETUDIANT, SEQ_ADMIN, SEQ_RECLAMATION, etc.

-- Vérifier les données de test
SELECT * FROM ETUDIANT;
SELECT * FROM ADMIN;
-- Devrait afficher les étudiants et admins de test
```

## Étape 5 : Tester (Optionnel)

Exécutez le script de test :

```sql
@oracle/06_requetes_test.sql
```

## ✅ Si tout fonctionne

Vous devriez voir :
- ✓ 5 tables créées
- ✓ 5 séquences créées
- ✓ 8 triggers créés
- ✓ 6 fonctions créées
- ✓ 4 procédures créées
- ✓ 6 vues créées
- ✓ Des données de test insérées

## ⚠️ Problèmes courants

### Erreur : "ORA-01031: insufficient privileges"
- **Solution** : Assurez-vous d'être connecté en tant que SYSDBA pour créer l'utilisateur

### Erreur : "ORA-00955: name is already in use"
- **Solution** : Les objets existent déjà. Vous pouvez les supprimer ou ignorer l'erreur

### Erreur : "SP2-0310: unable to open file"
- **Solution** : Vérifiez que vous êtes dans le bon répertoire ou utilisez le chemin complet

### Les scripts ne s'exécutent pas dans SQL Developer
- **Solution** : Utilisez "Exécuter le script" (F5) et non "Exécuter la déclaration" (F9)

## 📝 Prochaines étapes

Une fois Oracle configuré :
1. ✅ Notez vos identifiants Oracle (utilisateur, mot de passe, service)
2. ✅ Configurez le backend (voir `INSTALLATION.md`)
3. ✅ Configurez le frontend (voir `INSTALLATION.md`)

## 💡 Astuce

Pour tester rapidement si Oracle fonctionne, exécutez :
```sql
SELECT 'Oracle fonctionne !' AS message FROM DUAL;
```

