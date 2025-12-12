# 📊 RAPPORT RÉCAPITULATIF - BASE DE DONNÉES ORACLE
## Système de Gestion des Réclamations Étudiantes (SGRE)
### ISCAE - Institut Supérieur de Comptabilité et d'Administration des Entreprises

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de la base de données](#architecture-de-la-base-de-données)
3. [Tables et structures](#tables-et-structures)
4. [Contraintes et intégrité](#contraintes-et-intégrité)
5. [Séquences](#séquences)
6. [Triggers](#triggers)
7. [Fonctions PL/SQL](#fonctions-plsql)
8. [Procédures PL/SQL](#procédures-plsql)
9. [Vues](#vues)
10. [Index](#index)
11. [Sécurité et authentification](#sécurité-et-authentification)
12. [Flux de données](#flux-de-données)
13. [Statistiques et rapports](#statistiques-et-rapports)

---

## 🎯 VUE D'ENSEMBLE

### Objectif
Le système SGRE permet de gérer les réclamations des étudiants de l'ISCAE, depuis leur création jusqu'à leur résolution, avec un suivi complet par l'administration.

### Technologies utilisées
- **SGBD**: Oracle Database 21c Express Edition
- **Langage**: PL/SQL, SQL
- **Architecture**: Base de données relationnelle avec triggers, fonctions, procédures et vues

### Utilisateur de la base de données
- **Utilisateur**: `SGRE_USER`
- **Mot de passe**: `12345` (à changer en production)
- **Service**: `XEPDB1`

---

## 🗄️ ARCHITECTURE DE LA BASE DE DONNÉES

### Schéma relationnel

```
ETUDIANT (1) ────< (N) RECLAMATION (N) >─── (1) ADMIN
                          │
                          │
                          ▼
                    TRAITEMENT
                          │
                          ▼
                    NOTIFICATION
```

### Relations
- **ETUDIANT** → **RECLAMATION** : Un étudiant peut créer plusieurs réclamations (1:N)
- **ADMIN** → **RECLAMATION** : Un admin peut être assigné à plusieurs réclamations (1:N)
- **RECLAMATION** → **TRAITEMENT** : Une réclamation peut avoir plusieurs traitements (1:N)
- **RECLAMATION** → **NOTIFICATION** : Une réclamation peut générer des notifications (1:N)
- **ADMIN** → **TRAITEMENT** : Un admin peut effectuer plusieurs traitements (1:N)

---

## 📊 TABLES ET STRUCTURES

### 1. Table ETUDIANT

**Description**: Stocke les informations des étudiants de l'ISCAE.

**Colonnes**:
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | NUMBER | PRIMARY KEY | Identifiant unique (auto-généré) |
| `nom` | VARCHAR2(100) | NOT NULL | Nom de l'étudiant |
| `prenom` | VARCHAR2(100) | NOT NULL | Prénom de l'étudiant |
| `email` | VARCHAR2(150) | NOT NULL, UNIQUE | Email au format `matricule.etu@iscae.mr` |
| `filiere` | VARCHAR2(50) | NOT NULL | Filière de l'étudiant |
| `niveau` | VARCHAR2(20) | NOT NULL, CHECK | Niveau (L1, L2, L3, M1, M2) |
| `date_inscription` | DATE | DEFAULT SYSDATE | Date d'inscription |
| `mot_de_passe` | VARCHAR2(255) | NOT NULL | Mot de passe (ajouté via script 08) |

**Filières disponibles**:
- Banques & Assurances
- Finance & Comptabilité
- Gestion des Ressources Humaines
- Techniques Commerciales et Marketing
- Développement Informatique
- Informatique de Gestion
- Pro Finance et Comptabilité (Master)
- Pro en Informatique Appliqué à la Gestion (Master)

**Séquence**: `seq_etudiant` (auto-increment via trigger)

---

### 2. Table ADMIN

**Description**: Stocke les informations des administrateurs du système.

**Colonnes**:
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | NUMBER | PRIMARY KEY | Identifiant unique (auto-généré) |
| `nom` | VARCHAR2(100) | NOT NULL | Nom de l'administrateur |
| `prenom` | VARCHAR2(100) | NOT NULL | Prénom de l'administrateur |
| `email` | VARCHAR2(150) | NOT NULL, UNIQUE | Email de l'administrateur |
| `role` | VARCHAR2(50) | NOT NULL, CHECK | Rôle (ADMINISTRATEUR, RESPONSABLE, SUPPORT) |
| `date_creation` | DATE | DEFAULT SYSDATE | Date de création du compte |
| `mot_de_passe` | VARCHAR2(255) | NOT NULL | Mot de passe (ajouté via script 08) |

**Rôles disponibles**:
- `ADMINISTRATEUR`: Accès complet au système
- `RESPONSABLE`: Gestion des réclamations académiques
- `SUPPORT`: Support technique

**Séquence**: `seq_admin` (auto-increment via trigger)

---

### 3. Table RECLAMATION

**Description**: Stocke les réclamations créées par les étudiants.

**Colonnes**:
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | NUMBER | PRIMARY KEY | Identifiant unique (auto-généré) |
| `etudiant_id` | NUMBER | NOT NULL, FK → ETUDIANT | Référence à l'étudiant |
| `type_reclamation` | VARCHAR2(30) | NOT NULL, CHECK | Type (ACADEMIQUE, ADMINISTRATIF, TECHNIQUE) |
| `titre` | VARCHAR2(200) | NOT NULL | Titre de la réclamation |
| `description` | CLOB | NOT NULL | Description détaillée |
| `date_creation` | DATE | DEFAULT SYSDATE | Date de création |
| `statut` | VARCHAR2(20) | NOT NULL, CHECK | Statut (EN ATTENTE, EN COURS, RESOLUE, FERMEE) |
| `priorite` | VARCHAR2(15) | NOT NULL, CHECK | Priorité (FAIBLE, MOYENNE, ELEVEE, URGENTE) |
| `admin_assignee_id` | NUMBER | FK → ADMIN | Responsable assigné (peut être NULL) |

**Types de réclamations**:
- `ACADEMIQUE`: Problèmes liés aux notes, examens, cours
- `ADMINISTRATIF`: Problèmes liés aux inscriptions, documents
- `TECHNIQUE`: Problèmes liés aux salles, équipements

**Statuts possibles**:
- `EN ATTENTE`: Réclamation créée, en attente de traitement
- `EN COURS`: Réclamation prise en charge par un admin
- `RESOLUE`: Réclamation résolue (génère une notification)
- `FERMEE`: Réclamation fermée/annulée

**Priorités**:
- `FAIBLE`: Priorité faible
- `MOYENNE`: Priorité moyenne
- `ELEVEE`: Priorité élevée
- `URGENTE`: Priorité urgente

**Séquence**: `seq_reclamation` (auto-increment via trigger)

**Contraintes de clés étrangères**:
- `fk_reclamation_etudiant`: ON DELETE CASCADE (si étudiant supprimé, réclamations supprimées)
- `fk_reclamation_admin`: ON DELETE SET NULL (si admin supprimé, réclamation reste mais sans responsable)

---

### 4. Table TRAITEMENT

**Description**: Historique des traitements effectués sur les réclamations.

**Colonnes**:
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | NUMBER | PRIMARY KEY | Identifiant unique (auto-généré) |
| `reclamation_id` | NUMBER | NOT NULL, FK → RECLAMATION | Référence à la réclamation |
| `admin_id` | NUMBER | NOT NULL, FK → ADMIN | Admin ayant effectué le traitement |
| `date_traitement` | DATE | DEFAULT SYSDATE | Date du traitement |
| `commentaire` | CLOB | NULL | Commentaire du traitement |
| `ancien_statut` | VARCHAR2(20) | NULL | Statut avant le traitement |
| `nouveau_statut` | VARCHAR2(20) | NOT NULL, CHECK | Nouveau statut après traitement |

**Séquence**: `seq_traitement` (auto-increment via trigger)

**Contraintes de clés étrangères**:
- `fk_traitement_reclamation`: ON DELETE CASCADE
- `fk_traitement_admin`: ON DELETE CASCADE

---

### 5. Table NOTIFICATION

**Description**: Notifications envoyées aux étudiants.

**Colonnes**:
| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | NUMBER | PRIMARY KEY | Identifiant unique (auto-généré) |
| `etudiant_id` | NUMBER | NOT NULL, FK → ETUDIANT | Étudiant destinataire |
| `reclamation_id` | NUMBER | NULL, FK → RECLAMATION | Réclamation concernée (peut être NULL) |
| `message` | VARCHAR2(500) | NOT NULL | Message de la notification |
| `date_notification` | DATE | DEFAULT SYSDATE | Date de création |
| `lu` | NUMBER(1) | DEFAULT 0, CHECK | 0 = non lu, 1 = lu |

**Séquence**: `seq_notification` (auto-increment via trigger)

**Contraintes de clés étrangères**:
- `fk_notification_etudiant`: ON DELETE CASCADE
- `fk_notification_reclamation`: ON DELETE CASCADE

---

## 🔒 CONTRAINTES ET INTÉGRITÉ

### Contraintes de domaine (CHECK)

1. **ETUDIANT.niveau**: `IN ('L1', 'L2', 'L3', 'M1', 'M2')`
2. **ADMIN.role**: `IN ('ADMINISTRATEUR', 'RESPONSABLE', 'SUPPORT')`
3. **RECLAMATION.type_reclamation**: `IN ('ACADEMIQUE', 'ADMINISTRATIF', 'TECHNIQUE')`
4. **RECLAMATION.statut**: `IN ('EN ATTENTE', 'EN COURS', 'RESOLUE', 'FERMEE')`
5. **RECLAMATION.priorite**: `IN ('FAIBLE', 'MOYENNE', 'ELEVEE', 'URGENTE')`
6. **TRAITEMENT.nouveau_statut**: `IN ('EN ATTENTE', 'EN COURS', 'RESOLUE', 'FERMEE')`
7. **NOTIFICATION.lu**: `IN (0, 1)`

### Contraintes de clés étrangères

| Contrainte | Table | Colonne | Table référencée | Action DELETE |
|------------|-------|---------|------------------|---------------|
| `fk_reclamation_etudiant` | RECLAMATION | etudiant_id | ETUDIANT | CASCADE |
| `fk_reclamation_admin` | RECLAMATION | admin_assignee_id | ADMIN | SET NULL |
| `fk_traitement_reclamation` | TRAITEMENT | reclamation_id | RECLAMATION | CASCADE |
| `fk_traitement_admin` | TRAITEMENT | admin_id | ADMIN | CASCADE |
| `fk_notification_etudiant` | NOTIFICATION | etudiant_id | ETUDIANT | CASCADE |
| `fk_notification_reclamation` | NOTIFICATION | reclamation_id | RECLAMATION | CASCADE |

---

## 🔢 SÉQUENCES

Toutes les séquences commencent à 1 et s'incrémentent de 1 :

| Séquence | Table associée | Usage |
|----------|---------------|-------|
| `seq_etudiant` | ETUDIANT | Auto-increment des IDs étudiants |
| `seq_admin` | ADMIN | Auto-increment des IDs admins |
| `seq_reclamation` | RECLAMATION | Auto-increment des IDs réclamations |
| `seq_traitement` | TRAITEMENT | Auto-increment des IDs traitements |
| `seq_notification` | NOTIFICATION | Auto-increment des IDs notifications |

---

## ⚡ TRIGGERS

### 1. Triggers d'auto-increment

**Objectif**: Générer automatiquement les IDs pour chaque table.

| Trigger | Table | Type | Action |
|---------|-------|------|--------|
| `trg_etudiant_id` | ETUDIANT | BEFORE INSERT | Génère l'ID si NULL |
| `trg_admin_id` | ADMIN | BEFORE INSERT | Génère l'ID si NULL |
| `trg_reclamation_id` | RECLAMATION | BEFORE INSERT | Génère l'ID si NULL |
| `trg_traitement_id` | TRAITEMENT | BEFORE INSERT | Génère l'ID si NULL |
| `trg_notification_id` | NOTIFICATION | BEFORE INSERT | Génère l'ID si NULL |

### 2. Trigger de changement de statut

**Nom**: `trg_reclamation_statut_change`

**Type**: AFTER UPDATE OF statut

**Déclenchement**: Lorsqu'une réclamation change de statut

**Actions**:
- Crée automatiquement une entrée dans `TRAITEMENT`
- Utilise l'admin assigné ou le premier admin disponible
- Enregistre l'ancien et le nouveau statut
- Gère les erreurs silencieusement pour ne pas bloquer la transaction

**Commentaire automatique**:
- Si statut passe de "EN ATTENTE" à "FERMEE": "Réclamation annulée par l'étudiant"
- Sinon: "Changement de statut automatique"

### 3. Trigger de notification

**Nom**: `trg_reclamation_resolue`

**Type**: AFTER UPDATE OF statut

**Déclenchement**: Lorsqu'une réclamation passe au statut "RESOLUE"

**Actions**:
- Crée automatiquement une notification pour l'étudiant
- Message: "Votre réclamation #X a été résolue. Merci de vérifier."
- Notification non lue par défaut (lu = 0)

### 4. Trigger de calcul de priorité

**Nom**: `trg_calcul_priorite`

**Type**: BEFORE INSERT OR UPDATE

**Déclenchement**: Avant l'insertion ou la mise à jour d'une réclamation

**Actions**:
- Calcule automatiquement la priorité si elle n'est pas définie
- Logique:
  - `ACADEMIQUE` → `ELEVEE`
  - `TECHNIQUE` → `MOYENNE`
  - `ADMINISTRATIF` → `FAIBLE`

---

## 🔧 FONCTIONS PL/SQL

### 1. `temps_moyen_resolution()`

**Type**: FUNCTION RETURNING NUMBER

**Description**: Calcule le temps moyen de résolution des réclamations (en jours).

**Logique**:
- Calcule la différence entre `date_creation` et la date de passage à "RESOLUE"
- Moyenne de toutes les réclamations résolues
- Retourne `NULL` si aucune réclamation résolue

**Utilisation**: Vue `v_statistiques_globales`

---

### 2. `temps_traitement_reclamation(p_reclamation_id NUMBER)`

**Type**: FUNCTION RETURNING NUMBER

**Description**: Calcule le temps de traitement d'une réclamation spécifique (en jours).

**Paramètres**:
- `p_reclamation_id`: ID de la réclamation

**Logique**:
- Si résolue: différence entre date de création et date de résolution
- Sinon: différence entre date de création et aujourd'hui
- Retourne `NULL` si réclamation introuvable

**Utilisation**: Vue `v_dashboard_admin`

---

### 3. `nbr_reclamations_par_type(p_type VARCHAR2)`

**Type**: FUNCTION RETURNING NUMBER

**Description**: Compte le nombre de réclamations d'un type donné.

**Paramètres**:
- `p_type`: Type de réclamation (ACADEMIQUE, ADMINISTRATIF, TECHNIQUE)

**Retourne**: Nombre de réclamations du type spécifié

---

### 4. `nbr_reclamations_par_statut(p_statut VARCHAR2)`

**Type**: FUNCTION RETURNING NUMBER

**Description**: Compte le nombre de réclamations avec un statut donné.

**Paramètres**:
- `p_statut`: Statut de la réclamation

**Retourne**: Nombre de réclamations avec ce statut

---

### 5. `nbr_reclamations_non_resolues()`

**Type**: FUNCTION RETURNING NUMBER

**Description**: Compte le nombre de réclamations non résolues (EN ATTENTE ou EN COURS).

**Retourne**: Nombre total de réclamations non résolues

---

### 6. `calcul_priorite(p_type_reclamation VARCHAR2, p_jours_attente NUMBER)`

**Type**: FUNCTION RETURNING VARCHAR2

**Description**: Calcule la priorité d'une réclamation basée sur son type et le nombre de jours d'attente.

**Paramètres**:
- `p_type_reclamation`: Type de réclamation
- `p_jours_attente`: Nombre de jours depuis la création

**Logique**:
- Base: Type de réclamation (ACADEMIQUE → ELEVEE, etc.)
- Si > 7 jours d'attente: Priorité augmentée
- Si > 14 jours d'attente: Priorité URGENTE

**Retourne**: Priorité calculée (FAIBLE, MOYENNE, ELEVEE, URGENTE)

---

## 📝 PROCÉDURES PL/SQL

### 1. `traiter_reclamation`

**Paramètres**:
- `p_reclamation_id` (IN): ID de la réclamation
- `p_admin_id` (IN): ID de l'admin traitant
- `p_nouveau_statut` (IN): Nouveau statut
- `p_commentaire` (IN, optionnel): Commentaire du traitement

**Actions**:
1. Vérifie que la réclamation existe
2. Récupère l'ancien statut
3. Met à jour le statut et assigne l'admin
4. Crée une entrée dans `TRAITEMENT` avec le commentaire personnalisé
5. Le trigger `trg_reclamation_statut_change` peut aussi créer une entrée automatique

**Utilisation**: Backend API route `PUT /api/reclamations/:id/statut`

---

### 2. `attribuer_responsable`

**Paramètres**:
- `p_reclamation_id` (IN): ID de la réclamation
- `p_admin_id` (IN): ID de l'admin à assigner

**Actions**:
1. Vérifie que la réclamation existe
2. Vérifie que l'admin existe
3. Met à jour `admin_assignee_id` dans `RECLAMATION`
4. **Si la réclamation est "EN ATTENTE", passe automatiquement à "EN COURS"**
5. Le trigger `trg_reclamation_statut_change` crée une entrée dans `TRAITEMENT`

**Utilisation**: Backend API route `PUT /api/reclamations/:id/responsable`

**⚠️ Important**: Cette procédure contient un `COMMIT` qui doit être supprimé (déjà fait dans le code).

---

### 3. `creer_reclamation`

**Paramètres**:
- `p_etudiant_id` (IN): ID de l'étudiant
- `p_type_reclamation` (IN): Type de réclamation
- `p_titre` (IN): Titre
- `p_description` (IN): Description (CLOB)
- `p_reclamation_id` (OUT): ID de la réclamation créée

**Actions**:
1. Vérifie que l'étudiant existe
2. Insère la réclamation avec statut "EN ATTENTE"
3. Calcule la priorité automatiquement
4. Retourne l'ID de la réclamation créée

**Note**: Cette procédure n'est plus utilisée dans le backend (remplacée par INSERT direct avec RETURNING).

---

### 4. `marquer_notification_lue`

**Paramètres**:
- `p_notification_id` (IN): ID de la notification

**Actions**:
1. Vérifie que la notification existe
2. Met à jour `lu = 1`

---

## 👁️ VUES

### 1. `v_historique_etudiant`

**Description**: Historique complet des réclamations d'un étudiant.

**Colonnes**:
- `reclamation_id`, `titre`, `type_reclamation`, `description`
- `date_creation`, `statut`, `priorite`
- `etudiant_nom`, `filiere`
- `admin_nom`, `admin_role`
- `nb_traitements`, `derniere_modification`

**Utilisation**: Dashboard étudiant

---

### 2. `v_dashboard_admin`

**Description**: Vue complète pour le tableau de bord administratif.

**Colonnes**:
- `reclamation_id`, `titre`, `type_reclamation`, `statut`, `priorite`
- `date_creation`, `etudiant_nom`, `filiere`, `etudiant_email`
- `admin_assignee`, `admin_role`
- `nb_traitements`, `jours_traitement`, `jours_attente`

**Tri**: Par priorité (URGENTE → FAIBLE) puis par date de création

**Utilisation**: Dashboard admin, liste des réclamations

---

### 3. `v_reclamations_urgentes`

**Description**: Réclamations urgentes nécessitant une attention immédiate.

**Filtres**:
- Priorité: URGENTE ou ELEVEE
- Statut: EN ATTENTE ou EN COURS

**Colonnes**: Similaires à `v_dashboard_admin` avec `jours_attente` et `jours_traitement`

**Tri**: Par priorité (URGENTE d'abord) puis par date de création

**Utilisation**: Section "Réclamations urgentes" du dashboard admin

---

### 4. `v_statistiques_globales`

**Description**: Statistiques globales du système.

**Colonnes**:
- `total_reclamations`: Nombre total de réclamations
- `en_attente`, `en_cours`, `resolues`, `fermees`: Par statut
- `academiques`, `administratives`, `techniques`: Par type
- `temps_moyen_jours`: Temps moyen de résolution
- `notifications_non_lues`: Nombre de notifications non lues

**Utilisation**: Dashboard admin, statistiques

---

### 5. `v_detail_reclamation`

**Description**: Détails complets d'une réclamation avec historique des traitements.

**Colonnes**:
- Informations de la réclamation
- Informations de l'étudiant
- Informations de l'admin assigné
- Historique des traitements (avec admin traitant)

**Utilisation**: Détails d'une réclamation spécifique

---

### 6. `v_reclamations_par_filiere`

**Description**: Réclamations groupées par filière.

**Colonnes**: Filière, nombre de réclamations, statistiques par statut

**Utilisation**: Statistiques par filière

---

## 📑 INDEX

Index créés pour optimiser les performances :

| Index | Table | Colonne(s) | Usage |
|-------|-------|------------|-------|
| `idx_reclamation_etudiant` | RECLAMATION | etudiant_id | Recherche par étudiant |
| `idx_reclamation_statut` | RECLAMATION | statut | Filtrage par statut |
| `idx_reclamation_type` | RECLAMATION | type_reclamation | Filtrage par type |
| `idx_traitement_reclamation` | TRAITEMENT | reclamation_id | Jointures avec réclamations |
| `idx_notification_etudiant` | NOTIFICATION | etudiant_id | Recherche par étudiant |

---

## 🔐 SÉCURITÉ ET AUTHENTIFICATION

### Champs de mot de passe

Ajoutés via le script `08_add_password.sql`:
- `ETUDIANT.mot_de_passe`: VARCHAR2(255) NOT NULL
- `ADMIN.mot_de_passe`: VARCHAR2(255) NOT NULL

### Valeurs par défaut

- **Étudiants existants**: Mot de passe = email
- **Nouveaux étudiants**: Mot de passe = matricule (en majuscules)
- **Admins existants**: Mot de passe = email

### Authentification

- Les étudiants s'authentifient avec leur email et mot de passe
- Les admins s'authentifient avec leur email et mot de passe
- Format email étudiant: `matricule.etu@iscae.mr` (ex: `i12345.etu@iscae.mr`)

---

## 🔄 FLUX DE DONNÉES

### Création d'une réclamation

1. Étudiant crée une réclamation via le formulaire
2. Backend insère dans `RECLAMATION` avec statut "EN ATTENTE"
3. Trigger `trg_calcul_priorite` calcule la priorité
4. Trigger `trg_reclamation_id` génère l'ID
5. Réclamation visible dans le dashboard étudiant

### Attribution d'un responsable

1. Admin sélectionne un responsable dans le dropdown
2. Backend appelle `attribuer_responsable(p_reclamation_id, p_admin_id)`
3. Procédure met à jour `admin_assignee_id`
4. **Si statut = "EN ATTENTE", passe automatiquement à "EN COURS"**
5. Trigger `trg_reclamation_statut_change` crée une entrée dans `TRAITEMENT`
6. Réclamation visible avec le responsable assigné

### Traitement d'une réclamation

1. Admin change le statut via le modal
2. Backend appelle `traiter_reclamation(p_reclamation_id, p_admin_id, p_nouveau_statut, p_commentaire)`
3. Procédure met à jour le statut et crée un traitement avec commentaire
4. Trigger `trg_reclamation_statut_change` peut aussi créer un traitement automatique
5. **Si nouveau statut = "RESOLUE"**, trigger `trg_reclamation_resolue` crée une notification
6. Étudiant reçoit la notification dans son dashboard

### Annulation d'une réclamation

1. Étudiant annule sa réclamation (statut "EN ATTENTE" uniquement)
2. Backend met à jour le statut à "FERMEE"
3. Trigger `trg_reclamation_statut_change` crée un traitement avec commentaire "Réclamation annulée par l'étudiant"
4. Réclamation reste dans l'historique mais avec statut "FERMEE"

---

## 📈 STATISTIQUES ET RAPPORTS

### Requêtes de statistiques disponibles

1. **Statistiques globales**: `SELECT * FROM v_statistiques_globales`
2. **Réclamations urgentes**: `SELECT * FROM v_reclamations_urgentes`
3. **Réclamations par filière**: `SELECT * FROM v_reclamations_par_filiere`
4. **Temps moyen de résolution**: `SELECT temps_moyen_resolution() FROM DUAL`
5. **Historique étudiant**: `SELECT * FROM v_historique_etudiant WHERE ...`
6. **Dashboard admin**: `SELECT * FROM v_dashboard_admin`

### Scripts de vérification

- `06_requetes_test.sql`: Requêtes de test et validation
- `10_verification_attribution.sql`: Vérification de l'attribution des responsables

---

## 📁 FICHIERS SQL

| Fichier | Description |
|---------|-------------|
| `01_schema.sql` | Création des tables, contraintes, séquences, index, données de test |
| `02_triggers.sql` | Création de tous les triggers |
| `03_fonctions.sql` | Création de toutes les fonctions PL/SQL |
| `04_procedures.sql` | Création de toutes les procédures PL/SQL |
| `05_vues.sql` | Création de toutes les vues |
| `06_requetes_test.sql` | Requêtes de test et validation |
| `07_update_noms_etudiants.sql` | Mise à jour des données avec noms d'étudiants |
| `08_add_password.sql` | Ajout des champs mot de passe |
| `10_verification_attribution.sql` | Vérification de l'attribution des responsables |

---

## ✅ VÉRIFICATIONS IMPORTANTES

### Vérification de l'attribution d'un responsable

Après attribution d'un responsable à une réclamation, vérifier :

1. ✅ `RECLAMATION.admin_assignee_id` est mis à jour
2. ✅ Si statut était "EN ATTENTE", il passe à "EN COURS"
3. ✅ Une entrée est créée dans `TRAITEMENT` avec :
   - `ancien_statut` = ancien statut
   - `nouveau_statut` = "EN COURS" (si changement automatique)
   - `admin_id` = admin assigné
   - `date_traitement` = date actuelle

**Script de vérification**: `oracle/10_verification_attribution.sql`

---

## 🎯 POINTS CLÉS

### Fonctionnalités principales

1. ✅ **Gestion complète des réclamations**: Création, modification, annulation (étudiants)
2. ✅ **Attribution automatique**: Passage automatique à "EN COURS" lors de l'attribution
3. ✅ **Historique complet**: Tous les changements de statut sont enregistrés dans `TRAITEMENT`
4. ✅ **Notifications automatiques**: Notification créée automatiquement quand une réclamation est résolue
5. ✅ **Calcul automatique de priorité**: Basé sur le type et les jours d'attente
6. ✅ **Statistiques en temps réel**: Vues optimisées pour les dashboards

### Sécurité

- ✅ Contraintes CHECK pour valider les données
- ✅ Clés étrangères pour maintenir l'intégrité référentielle
- ✅ Authentification par email et mot de passe
- ✅ Gestion des erreurs dans les triggers (ne bloquent pas les transactions)

### Performance

- ✅ Index sur les colonnes fréquemment utilisées
- ✅ Vues matérialisables pour les statistiques
- ✅ Pool de connexions dans le backend

---

## 📝 NOTES IMPORTANTES

1. **COMMIT dans les procédures**: Les procédures contiennent des `COMMIT` qui doivent être gérés avec précaution. Les triggers ne doivent **jamais** contenir de `COMMIT`.

2. **Format des emails**: 
   - Étudiants: `matricule.etu@iscae.mr` (ex: `i12345.etu@iscae.mr`)
   - Admins: Format libre (ex: `admin@iscae.edu`, `diary.ba@iscae.mr`)

3. **Gestion des CLOB**: La colonne `description` est de type CLOB. Utiliser `DBMS_LOB.SUBSTR` pour les requêtes ou gérer directement dans le backend.

4. **Noms de colonnes**: Oracle retourne les noms en majuscules. Le backend formate en minuscules pour le frontend.

---

## 🔍 REQUÊTES DE VÉRIFICATION

### Vérifier l'attribution d'un responsable

```sql
-- Voir toutes les réclamations avec leurs responsables
SELECT 
    r.id,
    r.titre,
    r.statut,
    e.nom || ' ' || e.prenom AS etudiant,
    a.nom || ' ' || a.prenom AS responsable,
    a.role
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
ORDER BY r.date_creation DESC;
```

### Vérifier les traitements après attribution

```sql
-- Voir l'historique des traitements
SELECT 
    t.reclamation_id,
    r.titre,
    a.nom || ' ' || a.prenom AS admin,
    t.ancien_statut,
    t.nouveau_statut,
    t.date_traitement,
    t.commentaire
FROM TRAITEMENT t
JOIN RECLAMATION r ON t.reclamation_id = r.id
JOIN ADMIN a ON t.admin_id = a.id
ORDER BY t.date_traitement DESC;
```

---

**Date de création du rapport**: 12 décembre 2025  
**Version de la base de données**: Oracle Database 21c Express Edition  
**Utilisateur**: SGRE_USER

