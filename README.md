# Système de Gestion des Réclamations Étudiantes (SGRE)

## 📋 Description du Projet

Le **Système de Gestion des Réclamations Étudiantes (SGRE)** est une application complète permettant aux étudiants de soumettre leurs réclamations (problèmes académiques, administratifs ou techniques) et aux administrateurs de les traiter efficacement.

Ce projet démontre l'utilisation avancée d'Oracle Database avec des triggers, fonctions, procédures PL/SQL, vues, et une interface React pour l'interaction utilisateur.

## 🏗️ Architecture du Projet

Le projet est divisé en trois parties principales :

1. **Base de données Oracle (80%)** : Schéma complet avec logique métier automatisée
2. **Backend Node.js (20%)** : API REST pour connecter React à Oracle
3. **Frontend React (20%)** : Interface utilisateur moderne et intuitive

## 📁 Structure du Projet

```
BD/
├── oracle/                    # Scripts Oracle
│   ├── 01_schema.sql          # Création des tables, contraintes, séquences
│   ├── 02_triggers.sql        # Triggers (auto-increment, notifications, etc.)
│   ├── 03_fonctions.sql       # Fonctions PL/SQL (statistiques, calculs)
│   ├── 04_procedures.sql      # Procédures PL/SQL (traitement, attribution)
│   ├── 05_vues.sql            # Vues (dashboard, historique, statistiques)
│   └── 06_requetes_test.sql   # Requêtes de test et validation
├── backend/                   # Backend Node.js
│   ├── db/
│   │   └── oracle.js          # Configuration et connexion Oracle
│   ├── routes/                # Routes API REST
│   │   ├── index.js
│   │   ├── etudiant.js
│   │   ├── admin.js
│   │   ├── reclamation.js
│   │   └── statistiques.js
│   ├── server.js              # Serveur Express
│   └── package.json
├── frontend/                  # Application React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── EtudiantDashboard.js
│   │   │   └── AdminDashboard.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🗄️ Base de Données Oracle

### Tables Principales

- **ETUDIANT** : Informations des étudiants
- **ADMIN** : Administrateurs et responsables
- **RECLAMATION** : Réclamations soumises par les étudiants
- **TRAITEMENT** : Historique des traitements des réclamations
- **NOTIFICATION** : Notifications automatiques pour les étudiants

### Contraintes

- **Clés primaires (PK)** : Sur toutes les tables
- **Clés étrangères (FK)** : Relations entre tables
- **CHECK** : Validation des statuts, types, priorités

### Séquences et Auto-increment

Toutes les tables utilisent des séquences Oracle avec des triggers pour l'auto-increment des IDs.

### Triggers Oracle

1. **Auto-increment** : Génération automatique des IDs
2. **Changement de statut** : Création automatique d'une entrée dans TRAITEMENT
3. **Notification** : Création automatique d'une notification quand une réclamation est résolue
4. **Calcul de priorité** : Attribution automatique de la priorité selon le type

### Fonctions PL/SQL

- `temps_moyen_resolution()` : Temps moyen de résolution en jours
- `nbr_reclamations_par_type(type)` : Nombre de réclamations par type
- `calcul_priorite(type, anciennete)` : Calcul automatique de la priorité
- `nbr_reclamations_non_resolues()` : Nombre de réclamations en attente
- `temps_traitement_reclamation(id)` : Temps de traitement d'une réclamation

### Procédures PL/SQL

- `traiter_reclamation(id, admin, statut, commentaire)` : Traiter une réclamation
- `attribuer_responsable(id_reclamation, admin)` : Attribuer un responsable
- `creer_reclamation(etudiant, type, titre, description)` : Créer une réclamation
- `marquer_notification_lue(id)` : Marquer une notification comme lue

### Vues Oracle

- `v_historique_etudiant` : Historique complet d'un étudiant
- `v_dashboard_admin` : Tableau de bord administratif
- `v_reclamations_urgentes` : Réclamations nécessitant une attention immédiate
- `v_statistiques_globales` : Statistiques globales du système
- `v_detail_reclamation` : Détails complets d'une réclamation avec historique
- `v_reclamations_par_filiere` : Statistiques par filière

## 🚀 Installation et Configuration

### Prérequis

- Oracle Database (11g ou supérieur)
- Node.js (v14 ou supérieur)
- npm ou yarn
- Git

### 0. Cloner le Projet

Pour cloner le projet sur votre machine locale :

```bash
git clone https://github.com/Dijajaja/SGRE.git
cd SGRE
```

### 1. Configuration Oracle

1. Connectez-vous à Oracle en tant qu'administrateur
2. Exécutez les scripts dans l'ordre :
   ```sql
   @oracle/01_schema.sql
   @oracle/02_triggers.sql
   @oracle/03_fonctions.sql
   @oracle/04_procedures.sql
   @oracle/05_vues.sql
   ```
3. (Optionnel) Exécutez les tests :
   ```sql
   @oracle/06_requetes_test.sql
   ```

### 2. Configuration Backend

1. Naviguez vers le dossier backend :
   ```bash
   cd backend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env` en copiant le modèle (si disponible) ou créez-le manuellement :
   ```bash
   # Sur Windows (PowerShell)
   Copy-Item .env.example .env
   
   # Sur Linux/Mac
   cp .env.example .env
   ```
   
   Puis modifiez le fichier `.env` avec vos identifiants Oracle :
   ```env
   ORACLE_HOST=localhost
   ORACLE_PORT=1521
   ORACLE_SERVICE=XEPDB1
   ORACLE_USER=SGRE_USER
   ORACLE_PASSWORD=votre_mot_de_passe
   PORT=3001
   NODE_ENV=development
   ```
   
   **Note** : Contactez l'administrateur du projet pour obtenir les identifiants Oracle.

4. Démarrez le serveur :
   ```bash
   npm start
   # ou en mode développement
   npm run dev
   ```

### 3. Configuration Frontend

1. Naviguez vers le dossier frontend :
   ```bash
   cd frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env` (optionnel, par défaut utilise localhost:3001) :
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. Démarrez l'application :
   ```bash
   npm start
   ```

L'application sera accessible sur `http://localhost:3000`

## 📊 Fonctionnalités

### Côté Étudiant

- ✅ Soumettre une nouvelle réclamation
- ✅ Consulter l'historique de ses réclamations
- ✅ Voir le statut en temps réel
- ✅ Recevoir des notifications automatiques lors de la résolution

### Côté Administrateur

- ✅ Consulter toutes les réclamations
- ✅ Filtrer par type, statut, filière
- ✅ Mettre à jour le statut d'une réclamation
- ✅ Attribuer un responsable
- ✅ Ajouter des commentaires
- ✅ Consulter les statistiques (temps moyen, réclamations par type, etc.)
- ✅ Voir les réclamations urgentes

## 🔄 Flux de Traitement

1. **Étudiant** soumet une réclamation → Statut : "EN ATTENTE"
2. **Admin** attribue un responsable → Statut : "EN COURS" (automatique)
3. **Admin** traite la réclamation → Statut : "RESOLUE"
4. **Trigger Oracle** crée automatiquement une notification pour l'étudiant
5. **Étudiant** reçoit la notification et peut consulter la réponse

## 🧪 Tests

Pour tester le système :

1. Exécutez les requêtes de test dans Oracle :
   ```sql
   @oracle/06_requetes_test.sql
   ```

2. Utilisez l'interface React pour créer des réclamations et les traiter

3. Vérifiez les statistiques dans le dashboard administrateur

## 📈 Statistiques Disponibles

- Nombre total de réclamations
- Réclamations par statut (En attente, En cours, Résolue, Fermée)
- Réclamations par type (Académique, Administratif, Technique)
- Temps moyen de résolution
- Réclamations par filière
- Réclamations urgentes

## 🔐 Sécurité

- Les contraintes CHECK garantissent l'intégrité des données
- Les triggers automatiques assurent la cohérence
- Les transactions (COMMIT/ROLLBACK) dans les procédures garantissent la fiabilité

## 📝 Notes Techniques

- **Oracle** : Utilisation de PL/SQL pour la logique métier
- **Node.js** : Pool de connexions Oracle pour de meilleures performances
- **React** : Interface moderne avec gestion d'état locale
- **API REST** : Communication asynchrone entre frontend et backend

## 🔗 Lien du Dépôt

**GitHub** : https://github.com/Dijajaja/SGRE.git

## 📋 Instructions pour l'Équipe

### Cloner le Projet

```bash
git clone https://github.com/Dijajaja/SGRE.git
cd SGRE
```

### Configuration Rapide

1. **Oracle** : Exécutez les scripts dans `oracle/` dans l'ordre (01 à 05)
2. **Backend** : 
   ```bash
   cd backend
   npm install
   # Créez votre fichier .env avec les identifiants Oracle
   npm start
   ```
3. **Frontend** :
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Identifiants de Test

- **Admin par défaut** : `admin@iscae.edu` (mot de passe : voir base de données)
- **Format email étudiant** : `i12345.etu@iscae.mr` (où `i12345` est le matricule)

## 👥 Auteurs

Projet réalisé dans le cadre du module **Base de Données Avancées Oracle** - **ISCAE**.

## 📄 Licence

Ce projet est à des fins éducatives.

