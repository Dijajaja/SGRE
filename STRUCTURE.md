# Structure du Projet SGRE

## 📁 Arborescence Complète

```
BD/
│
├── oracle/                          # Scripts Oracle Database (80% du projet)
│   ├── 01_schema.sql                # Schéma de base : tables, contraintes, séquences, index
│   ├── 02_triggers.sql              # Triggers : auto-increment, changements de statut, notifications
│   ├── 03_fonctions.sql             # Fonctions PL/SQL : statistiques, calculs
│   ├── 04_procedures.sql            # Procédures PL/SQL : traitement, attribution
│   ├── 05_vues.sql                  # Vues : dashboard, historique, statistiques
│   └── 06_requetes_test.sql         # Requêtes de test et validation
│
├── backend/                          # Backend Node.js + Express (API REST)
│   ├── db/
│   │   └── oracle.js                # Configuration et gestion des connexions Oracle
│   ├── routes/
│   │   ├── index.js                 # Routeur principal
│   │   ├── etudiant.js              # Routes pour les étudiants
│   │   ├── admin.js                 # Routes pour les administrateurs
│   │   ├── reclamation.js           # Routes pour les réclamations
│   │   └── statistiques.js          # Routes pour les statistiques
│   ├── server.js                    # Serveur Express principal
│   └── package.json                 # Dépendances Node.js
│
├── frontend/                         # Frontend React (20% du projet)
│   ├── public/
│   │   └── index.html               # Page HTML principale
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js              # Composant de connexion
│   │   │   ├── Login.css            # Styles du login
│   │   │   ├── EtudiantDashboard.js # Tableau de bord étudiant
│   │   │   ├── AdminDashboard.js    # Tableau de bord administrateur
│   │   │   └── Dashboard.css        # Styles des dashboards
│   │   ├── App.js                   # Composant principal React
│   │   ├── App.css                  # Styles globaux de l'application
│   │   ├── index.js                 # Point d'entrée React
│   │   └── index.css                # Styles globaux
│   └── package.json                 # Dépendances React
│
├── README.md                         # Documentation principale du projet
├── INSTALLATION.md                   # Guide d'installation détaillé
├── DIAGRAMME_CAS_UTILISATION.md     # Diagramme de cas d'utilisation
├── STRUCTURE.md                      # Ce fichier : structure du projet
└── .gitignore                       # Fichiers à ignorer par Git

```

## 🗄️ Détails des Scripts Oracle

### 01_schema.sql
- **Tables** : ETUDIANT, ADMIN, RECLAMATION, TRAITEMENT, NOTIFICATION
- **Contraintes** : PK, FK, CHECK (statuts, types, priorités)
- **Séquences** : Pour l'auto-increment des IDs
- **Index** : Pour optimiser les requêtes
- **Données de test** : Étudiants et admins de démonstration

### 02_triggers.sql
- `trg_etudiant_id` : Auto-increment pour ETUDIANT
- `trg_admin_id` : Auto-increment pour ADMIN
- `trg_reclamation_id` : Auto-increment pour RECLAMATION
- `trg_traitement_id` : Auto-increment pour TRAITEMENT
- `trg_notification_id` : Auto-increment pour NOTIFICATION
- `trg_reclamation_statut_change` : Crée TRAITEMENT lors du changement de statut
- `trg_reclamation_resolue` : Crée NOTIFICATION quand résolu
- `trg_calcul_priorite` : Calcule la priorité automatiquement

### 03_fonctions.sql
- `temps_moyen_resolution()` : Temps moyen en jours
- `nbr_reclamations_par_type(type)` : Comptage par type
- `calcul_priorite(type, anciennete)` : Calcul de priorité
- `nbr_reclamations_non_resolues()` : Nombre en attente
- `nbr_reclamations_par_statut(statut)` : Comptage par statut
- `temps_traitement_reclamation(id)` : Temps pour une réclamation

### 04_procedures.sql
- `traiter_reclamation(id, admin, statut, commentaire)` : Traiter une réclamation
- `attribuer_responsable(id_reclamation, admin)` : Attribuer un responsable
- `creer_reclamation(etudiant, type, titre, description)` : Créer une réclamation
- `marquer_notification_lue(id)` : Marquer notification comme lue

### 05_vues.sql
- `v_historique_etudiant` : Historique complet d'un étudiant
- `v_dashboard_admin` : Tableau de bord avec toutes les infos
- `v_reclamations_urgentes` : Réclamations prioritaires
- `v_statistiques_globales` : Statistiques du système
- `v_detail_reclamation` : Détails avec historique des traitements
- `v_reclamations_par_filiere` : Statistiques par filière

## 🔌 API REST (Backend)

### Routes Étudiant
- `GET /api/etudiants` : Liste tous les étudiants
- `GET /api/etudiants/:id` : Détails d'un étudiant
- `GET /api/etudiants/:id/reclamations` : Réclamations d'un étudiant
- `GET /api/etudiants/:id/notifications` : Notifications d'un étudiant

### Routes Réclamation
- `GET /api/reclamations` : Liste toutes les réclamations (avec filtres)
- `GET /api/reclamations/:id` : Détails d'une réclamation
- `POST /api/reclamations` : Créer une réclamation
- `PUT /api/reclamations/:id/statut` : Modifier le statut
- `PUT /api/reclamations/:id/responsable` : Attribuer un responsable

### Routes Admin
- `GET /api/admin` : Liste tous les admins
- `GET /api/admin/:id` : Détails d'un admin
- `GET /api/admin/:id/reclamations` : Réclamations assignées à un admin

### Routes Statistiques
- `GET /api/statistiques/globales` : Statistiques globales
- `GET /api/statistiques/urgentes` : Réclamations urgentes
- `GET /api/statistiques/par-filiere` : Par filière
- `GET /api/statistiques/temps-moyen` : Temps moyen de résolution
- `GET /api/statistiques/par-type` : Par type

## 🎨 Composants React

### Login.js
- Sélection du type d'utilisateur (étudiant/admin)
- Sélection d'un utilisateur dans la liste
- Affichage des informations de l'utilisateur
- Gestion de la connexion

### EtudiantDashboard.js
- Affichage des notifications non lues
- Liste des réclamations de l'étudiant
- Formulaire de création de réclamation
- Affichage du statut et de la priorité

### AdminDashboard.js
- Statistiques globales (cartes)
- Liste des réclamations urgentes
- Filtres (statut, type)
- Tableau de toutes les réclamations
- Modal pour modifier le statut
- Attribution de responsable

## 🔄 Flux de Données

```
React (Frontend)
    ↓ (HTTP Request)
Express (Backend)
    ↓ (SQL/PL-SQL)
Oracle Database
    ↓ (Triggers/Functions/Procedures)
Résultat
    ↓ (JSON Response)
React (Affichage)
```

## 📊 Points Clés du Projet

### Oracle (80%)
✅ Tables avec contraintes complètes
✅ Séquences et auto-increment
✅ Triggers pour automatisation
✅ Fonctions PL/SQL pour calculs
✅ Procédures PL/SQL pour traitements
✅ Vues pour affichage optimisé
✅ Transactions (COMMIT/ROLLBACK)

### Application (20%)
✅ Interface React moderne
✅ API REST complète
✅ Connexion Oracle via Node.js
✅ Gestion d'état locale
✅ Formulaires et tableaux
✅ Statistiques en temps réel

## 🎯 Conformité aux Exigences

- ✅ **MCD/MPD** : Schéma Oracle complet et normalisé
- ✅ **Contraintes** : PK, FK, CHECK sur toutes les tables
- ✅ **Séquences** : Auto-increment pour tous les IDs
- ✅ **Triggers** : Automatisation de la logique métier
- ✅ **Fonctions** : Calculs et statistiques
- ✅ **Procédures** : Traitements métier encapsulés
- ✅ **Vues** : Affichage optimisé et statistiques
- ✅ **Transactions** : COMMIT/ROLLBACK dans les procédures
- ✅ **Application** : Interface React simple et fonctionnelle
- ✅ **Diagramme** : Cas d'utilisation documenté

