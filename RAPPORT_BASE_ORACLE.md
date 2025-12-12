# 📊 RAPPORT RÉCAPITULATIF - BASE DE DONNÉES ORACLE
## Système de Gestion des Réclamations Étudiantes (SGRE)

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de la base de données](#architecture-de-la-base-de-données)
3. [Tables et structures](#tables-et-structures)
4. [Séquences](#séquences)
5. [Triggers](#triggers)
6. [Fonctions PL/SQL](#fonctions-plsql)
7. [Procédures PL/SQL](#procédures-plsql)
8. [Vues](#vues)
9. [Scripts d'installation](#scripts-dinstallation)
10. [Fonctionnalités implémentées](#fonctionnalités-implémentées)

---

## 🎯 VUE D'ENSEMBLE

### Objectif
Créer une base de données Oracle complète pour gérer les réclamations étudiantes avec :
- Gestion automatique des identifiants
- Suivi des statuts et historiques
- Notifications automatiques
- Calculs statistiques et de priorité
- Tableaux de bord pour étudiants et administrateurs

### Technologies utilisées
- **SGBD** : Oracle Database 21c Express Edition
- **Langage** : PL/SQL
- **Architecture** : Multitenant (PDB: XEPDB1)
- **Utilisateur** : SGRE_USER

---

## 🗄️ ARCHITECTURE DE LA BASE DE DONNÉES

### Schéma relationnel

```
ETUDIANT (1) ────< (N) RECLAMATION (N) ────> (1) ADMIN
                          │
                          │
                          ▼
                    TRAITEMENT
                          │
                          ▼
                    NOTIFICATION
```

### Relations
- **ETUDIANT ↔ RECLAMATION** : Un étudiant peut créer plusieurs réclamations (1-N)
- **ADMIN ↔ RECLAMATION** : Un admin peut être assigné à plusieurs réclamations (1-N)
- **RECLAMATION ↔ TRAITEMENT** : Une réclamation peut avoir plusieurs traitements (1-N)
- **RECLAMATION ↔ NOTIFICATION** : Une réclamation peut générer plusieurs notifications (1-N)

---

## 📊 TABLES ET STRUCTURES

### 1. Table ETUDIANT

**Description** : Stocke les informations des étudiants

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | NUMBER | PRIMARY KEY | Identifiant unique (auto-incrémenté) |
| `nom` | VARCHAR2(100) | NOT NULL | Nom de l'étudiant |
| `prenom` | VARCHAR2(100) | NOT NULL | Prénom de l'étudiant |
| `email` | VARCHAR2(150) | NOT NULL, UNIQUE | Email unique de l'étudiant |
| `filiere` | VARCHAR2(50) | NOT NULL | Filière d'étude |
| `niveau` | VARCHAR2(20) | NOT NULL, CHECK | Niveau (L1, L2, L3, M1, M2) |
| `mot_de_passe` | VARCHAR2(255) | NOT NULL | Mot de passe pour authentification |
| `date_inscription` | DATE | DEFAULT SYSDATE | Date d'inscription |

**Filières supportées** :
- Banques & Assurances
- Finance & Comptabilité
- Gestion des Ressources Humaines
- Techniques Commerciales et Marketing
- Développement Informatique
- Informatique de Gestion
- Pro Finance et Comptabilité (Master)
- Pro en Informatique Appliqué à la Gestion (Master)

### 2. Table ADMIN

**Description** : Stocke les informations des administrateurs

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | NUMBER | PRIMARY KEY | Identifiant unique (auto-incrémenté) |
| `nom` | VARCHAR2(100) | NOT NULL | Nom de l'administrateur |
| `prenom` | VARCHAR2(100) | NOT NULL | Prénom de l'administrateur |
| `email` | VARCHAR2(150) | NOT NULL, UNIQUE | Email unique de l'admin |
| `role` | VARCHAR2(50) | NOT NULL, CHECK | Rôle (ADMINISTRATEUR, RESPONSABLE, SUPPORT) |
| `mot_de_passe` | VARCHAR2(255) | NOT NULL | Mot de passe pour authentification |
| `date_creation` | DATE | DEFAULT SYSDATE | Date de création du compte |

### 3. Table RECLAMATION

**Description** : Stocke les réclamations créées par les étudiants

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | NUMBER | PRIMARY KEY | Identifiant unique (auto-incrémenté) |
| `etudiant_id` | NUMBER | NOT NULL, FK → ETUDIANT | Référence à l'étudiant |
| `type_reclamation` | VARCHAR2(30) | NOT NULL, CHECK | Type (ACADEMIQUE, ADMINISTRATIF, TECHNIQUE) |
| `titre` | VARCHAR2(200) | NOT NULL | Titre de la réclamation |
| `description` | CLOB | NOT NULL | Description détaillée |
| `date_creation` | DATE | DEFAULT SYSDATE | Date de création |
| `statut` | VARCHAR2(20) | NOT NULL, CHECK | Statut (EN ATTENTE, EN COURS, RESOLUE, FERMEE) |
| `priorite` | VARCHAR2(15) | NOT NULL, CHECK | Priorité (FAIBLE, MOYENNE, ELEVEE, URGENTE) |
| `admin_assignee_id` | NUMBER | FK → ADMIN | Admin assigné (peut être NULL) |

**Contraintes** :
- `chk_type_reclamation` : Vérifie que le type est valide
- `chk_statut` : Vérifie que le statut est valide
- `chk_priorite` : Vérifie que la priorité est valide
- `fk_reclamation_etudiant` : Clé étrangère vers ETUDIANT (ON DELETE CASCADE)
- `fk_reclamation_admin` : Clé étrangère vers ADMIN (ON DELETE SET NULL)

### 4. Table TRAITEMENT

**Description** : Historique des modifications de statut des réclamations

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | NUMBER | PRIMARY KEY | Identifiant unique (auto-incrémenté) |
| `reclamation_id` | NUMBER | NOT NULL, FK → RECLAMATION | Référence à la réclamation |
| `admin_id` | NUMBER | NOT NULL, FK → ADMIN | Admin ayant effectué le traitement |
| `date_traitement` | DATE | DEFAULT SYSDATE | Date du traitement |
| `commentaire` | CLOB | | Commentaire du traitement |
| `ancien_statut` | VARCHAR2(20) | | Statut avant modification |
| `nouveau_statut` | VARCHAR2(20) | NOT NULL, CHECK | Nouveau statut |

**Contraintes** :
- `fk_traitement_reclamation` : Clé étrangère vers RECLAMATION (ON DELETE CASCADE)
- `fk_traitement_admin` : Clé étrangère vers ADMIN (ON DELETE CASCADE)
- `chk_nouveau_statut` : Vérifie que le nouveau statut est valide

### 5. Table NOTIFICATION

**Description** : Notifications envoyées aux étudiants

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | NUMBER | PRIMARY KEY | Identifiant unique (auto-incrémenté) |
| `etudiant_id` | NUMBER | NOT NULL, FK → ETUDIANT | Étudiant destinataire |
| `reclamation_id` | NUMBER | FK → RECLAMATION | Réclamation concernée |
| `message` | VARCHAR2(500) | NOT NULL | Message de notification |
| `date_notification` | DATE | DEFAULT SYSDATE | Date de création |
| `lu` | NUMBER(1) | DEFAULT 0 | 0 = non lu, 1 = lu |

**Contraintes** :
- `fk_notification_etudiant` : Clé étrangère vers ETUDIANT (ON DELETE CASCADE)
- `fk_notification_reclamation` : Clé étrangère vers RECLAMATION (ON DELETE CASCADE)
- `chk_lu` : Vérifie que lu est 0 ou 1

---

## 🔢 SÉQUENCES

### 1. `seq_etudiant`
- **Usage** : Génération automatique des IDs pour la table ETUDIANT
- **Valeur initiale** : 1
- **Incrément** : 1

### 2. `seq_admin`
- **Usage** : Génération automatique des IDs pour la table ADMIN
- **Valeur initiale** : 1
- **Incrément** : 1

### 3. `seq_reclamation`
- **Usage** : Génération automatique des IDs pour la table RECLAMATION
- **Valeur initiale** : 1
- **Incrément** : 1

### 4. `seq_traitement`
- **Usage** : Génération automatique des IDs pour la table TRAITEMENT
- **Valeur initiale** : 1
- **Incrément** : 1

### 5. `seq_notification`
- **Usage** : Génération automatique des IDs pour la table NOTIFICATION
- **Valeur initiale** : 1
- **Incrément** : 1

---

## ⚡ TRIGGERS

### 1. `trg_etudiant_id`
- **Table** : ETUDIANT
- **Événement** : BEFORE INSERT
- **Fonctionnalité** : Auto-incrémente l'ID de l'étudiant avant insertion
- **Séquence utilisée** : `seq_etudiant`

### 2. `trg_admin_id`
- **Table** : ADMIN
- **Événement** : BEFORE INSERT
- **Fonctionnalité** : Auto-incrémente l'ID de l'admin avant insertion
- **Séquence utilisée** : `seq_admin`

### 3. `trg_reclamation_id`
- **Table** : RECLAMATION
- **Événement** : BEFORE INSERT
- **Fonctionnalité** : Auto-incrémente l'ID de la réclamation avant insertion
- **Séquence utilisée** : `seq_reclamation`

### 4. `trg_traitement_id`
- **Table** : TRAITEMENT
- **Événement** : BEFORE INSERT
- **Fonctionnalité** : Auto-incrémente l'ID du traitement avant insertion
- **Séquence utilisée** : `seq_traitement`

### 5. `trg_notification_id`
- **Table** : NOTIFICATION
- **Événement** : BEFORE INSERT
- **Fonctionnalité** : Auto-incrémente l'ID de la notification avant insertion
- **Séquence utilisée** : `seq_notification`

### 6. `trg_reclamation_statut_change`
- **Table** : RECLAMATION
- **Événement** : AFTER UPDATE OF statut
- **Fonctionnalité** : 
  - Crée automatiquement un enregistrement dans TRAITEMENT lors d'un changement de statut
  - Enregistre l'ancien et le nouveau statut
  - Enregistre l'admin qui a effectué le changement

### 7. `trg_reclamation_resolue_notification`
- **Table** : RECLAMATION
- **Événement** : AFTER UPDATE OF statut
- **Fonctionnalité** : 
  - Crée automatiquement une notification pour l'étudiant lorsque le statut passe à "RESOLUE"
  - Message : "Votre réclamation #[ID] a été résolue"

---

## 🔧 FONCTIONS PL/SQL

### 1. `calcul_priorite(p_type_reclamation VARCHAR2, p_anciennete_jours NUMBER)`
- **Type de retour** : VARCHAR2(15)
- **Paramètres** :
  - `p_type_reclamation` : Type de réclamation (ACADEMIQUE, ADMINISTRATIF, TECHNIQUE)
  - `p_anciennete_jours` : Nombre de jours depuis la création (défaut: 0)
- **Fonctionnalité** : 
  - Calcule la priorité initiale selon le type :
    - ACADEMIQUE → ELEVEE
    - TECHNIQUE → MOYENNE
    - ADMINISTRATIF → FAIBLE
  - Ajuste la priorité selon l'ancienneté :
    - Si > 7 jours : augmente la priorité
    - Si > 14 jours : passe à URGENTE
- **Retour** : FAIBLE, MOYENNE, ELEVEE, ou URGENTE

### 2. `temps_moyen_resolution()`
- **Type de retour** : NUMBER
- **Paramètres** : Aucun
- **Fonctionnalité** : 
  - Calcule le temps moyen de résolution en jours
  - Pour toutes les réclamations avec statut RESOLUE ou FERMEE
  - Formule : `ROUND(AVG(date_fermeture - date_creation))`
- **Retour** : Nombre de jours (ou NULL si aucune réclamation résolue)

### 3. `temps_traitement_reclamation(p_reclamation_id NUMBER)`
- **Type de retour** : NUMBER
- **Paramètres** :
  - `p_reclamation_id` : ID de la réclamation
- **Fonctionnalité** : 
  - Calcule le temps de traitement d'une réclamation en jours
  - Si résolue : `ROUND(date_fermeture - date_creation)`
  - Sinon : `ROUND(SYSDATE - date_creation)`
- **Retour** : Nombre de jours de traitement

### 4. `nbr_reclamations_par_type(p_type VARCHAR2)`
- **Type de retour** : NUMBER
- **Paramètres** :
  - `p_type` : Type de réclamation
- **Fonctionnalité** : Compte le nombre de réclamations d'un type donné
- **Retour** : Nombre de réclamations

### 5. `nbr_reclamations_par_statut(p_statut VARCHAR2)`
- **Type de retour** : NUMBER
- **Paramètres** :
  - `p_statut` : Statut de réclamation
- **Fonctionnalité** : Compte le nombre de réclamations avec un statut donné
- **Retour** : Nombre de réclamations

### 6. `nbr_reclamations_non_resolues()`
- **Type de retour** : NUMBER
- **Paramètres** : Aucun
- **Fonctionnalité** : Compte les réclamations non résolues (EN ATTENTE ou EN COURS)
- **Retour** : Nombre de réclamations non résolues

---

## 📝 PROCÉDURES PL/SQL

### 1. `traiter_reclamation(p_reclamation_id NUMBER, p_admin_id NUMBER, p_nouveau_statut VARCHAR2, p_commentaire CLOB)`
- **Paramètres** :
  - `p_reclamation_id` : ID de la réclamation à traiter
  - `p_admin_id` : ID de l'admin qui traite
  - `p_nouveau_statut` : Nouveau statut à appliquer
  - `p_commentaire` : Commentaire optionnel
- **Fonctionnalité** : 
  - Met à jour le statut de la réclamation
  - Assigne l'admin à la réclamation
  - Crée un enregistrement dans TRAITEMENT avec l'historique
  - Le trigger `trg_reclamation_statut_change` crée automatiquement l'entrée TRAITEMENT
  - Si un commentaire est fourni, crée une entrée TRAITEMENT supplémentaire
- **Exceptions** : 
  - `-20001` : Réclamation introuvable

### 2. `attribuer_responsable(p_reclamation_id NUMBER, p_admin_id NUMBER)`
- **Paramètres** :
  - `p_reclamation_id` : ID de la réclamation
  - `p_admin_id` : ID de l'admin à assigner
- **Fonctionnalité** : 
  - Assigne un administrateur responsable à une réclamation
  - Si la réclamation est EN ATTENTE, passe automatiquement à EN COURS
- **Exceptions** : 
  - `-20002` : Réclamation introuvable
  - `-20003` : Administrateur introuvable

### 3. `creer_reclamation(p_etudiant_id NUMBER, p_type_reclamation VARCHAR2, p_titre VARCHAR2, p_description CLOB, p_reclamation_id OUT NUMBER)`
- **Paramètres d'entrée** :
  - `p_etudiant_id` : ID de l'étudiant
  - `p_type_reclamation` : Type de réclamation
  - `p_titre` : Titre de la réclamation
  - `p_description` : Description (CLOB)
- **Paramètres de sortie** :
  - `p_reclamation_id` : ID de la réclamation créée (OUT)
- **Fonctionnalité** : 
  - Vérifie que l'étudiant existe
  - Crée une nouvelle réclamation avec :
    - Statut initial : EN ATTENTE
    - Priorité calculée automatiquement via `calcul_priorite()`
    - Date de création : SYSDATE
  - Retourne l'ID de la réclamation créée
- **Exceptions** : 
  - `-20004` : Étudiant introuvable

### 4. `marquer_notification_lue(p_notification_id NUMBER)`
- **Paramètres** :
  - `p_notification_id` : ID de la notification
- **Fonctionnalité** : Marque une notification comme lue (lu = 1)
- **Exceptions** : 
  - `-20005` : Notification introuvable

---

## 👁️ VUES

### 1. `v_historique_etudiant`
**Description** : Historique complet de toutes les réclamations d'un étudiant

**Colonnes** :
- `reclamation_id`, `titre`, `type_reclamation`, `description`
- `date_creation`, `statut`, `priorite`
- `etudiant_nom`, `filiere`
- `admin_nom`, `admin_role`
- `nb_traitements`, `derniere_modification`

**Tri** : Par date de création (décroissant)

### 2. `v_dashboard_admin`
**Description** : Vue complète pour le tableau de bord administrateur

**Colonnes** :
- `reclamation_id`, `titre`, `type_reclamation`, `statut`, `priorite`
- `date_creation`, `etudiant_nom`, `filiere`, `etudiant_email`
- `admin_assignee`, `admin_role`
- `nb_traitements`, `jours_traitement`, `jours_attente`

**Tri** : Par priorité (URGENTE → FAIBLE), puis par date (décroissant)

### 3. `v_reclamations_urgentes`
**Description** : Liste des réclamations urgentes nécessitant une attention immédiate

**Filtres** :
- Priorité : URGENTE ou ELEVEE
- Statut : EN ATTENTE ou EN COURS

**Colonnes** :
- `reclamation_id`, `titre`, `type_reclamation`, `statut`, `priorite`
- `date_creation`, `etudiant_nom`, `filiere`, `etudiant_email`
- `admin_assignee`, `jours_attente`, `jours_traitement`

**Tri** : Par priorité (URGENTE d'abord), puis par date (croissant)

### 4. `v_statistiques_globales`
**Description** : Statistiques globales du système

**Colonnes** :
- `total_reclamations` : Nombre total de réclamations
- `en_attente` : Réclamations en attente
- `en_cours` : Réclamations en cours
- `resolues` : Réclamations résolues
- `fermees` : Réclamations fermées
- `academiques` : Réclamations académiques
- `administratives` : Réclamations administratives
- `techniques` : Réclamations techniques
- `temps_moyen_jours` : Temps moyen de résolution (jours)
- `notifications_non_lues` : Nombre de notifications non lues

### 5. `v_detail_reclamation`
**Description** : Détails complets d'une réclamation avec son historique de traitements

**Colonnes** :
- Informations de la réclamation
- Informations de l'étudiant
- Informations de l'admin assigné
- Historique des traitements (traitement_id, date_traitement, commentaire, etc.)

**Tri** : Par réclamation, puis par date de traitement (décroissant)

### 6. `v_reclamations_par_filiere`
**Description** : Statistiques des réclamations groupées par filière

**Colonnes** :
- `filiere` : Nom de la filière
- `nombre_reclamations` : Total de réclamations
- `en_attente`, `en_cours`, `resolues`, `fermees` : Par statut
- `temps_moyen_jours` : Temps moyen de traitement par filière

**Tri** : Par nombre de réclamations (décroissant)

---

## 📦 SCRIPTS D'INSTALLATION

### Structure des fichiers

1. **`00_install_complete.sql`**
   - Script principal d'installation
   - Exécute tous les autres scripts dans l'ordre
   - Affiche des messages de progression

2. **`01_schema.sql`**
   - Création des tables
   - Définition des contraintes (PK, FK, CHECK)
   - Création des séquences
   - Insertion des données de test

3. **`02_triggers.sql`**
   - Création de tous les triggers
   - Auto-incrémentation des IDs
   - Gestion des changements de statut
   - Génération automatique des notifications

4. **`03_fonctions.sql`**
   - Création de toutes les fonctions PL/SQL
   - Calculs de priorité, statistiques, temps de traitement

5. **`04_procedures.sql`**
   - Création de toutes les procédures PL/SQL
   - Traitement des réclamations
   - Attribution de responsables
   - Création de réclamations

6. **`05_vues.sql`**
   - Création de toutes les vues
   - Tableaux de bord
   - Statistiques
   - Historiques

7. **`06_requetes_test.sql`**
   - Requêtes de test et validation
   - Exemples d'utilisation des procédures
   - Tests des fonctions

8. **`07_update_noms_etudiants.sql`**
   - Script de mise à jour des données de test
   - Suppression des anciennes données
   - Réinitialisation des séquences
   - Insertion de nouvelles données avec noms d'étudiants

9. **`08_add_password.sql`**
   - Ajout du champ `mot_de_passe` aux tables ETUDIANT et ADMIN
   - Mise à jour des mots de passe existants (par défaut = email)
   - Rendre le champ obligatoire

---

## ⚙️ FONCTIONNALITÉS IMPLÉMENTÉES

### 1. Gestion automatique des identifiants
- ✅ Auto-incrémentation via triggers et séquences
- ✅ Pas besoin de spécifier manuellement les IDs

### 2. Calcul automatique de priorité
- ✅ Priorité initiale basée sur le type de réclamation
- ✅ Ajustement dynamique selon l'ancienneté
- ✅ Passage automatique à URGENTE après 14 jours

### 3. Historique complet
- ✅ Enregistrement automatique de tous les changements de statut
- ✅ Traçabilité complète via la table TRAITEMENT
- ✅ Conservation de l'ancien et du nouveau statut

### 4. Notifications automatiques
- ✅ Génération automatique lors de la résolution d'une réclamation
- ✅ Suivi de l'état de lecture (lu/non lu)

### 5. Statistiques en temps réel
- ✅ Temps moyen de résolution
- ✅ Nombre de réclamations par type et statut
- ✅ Statistiques par filière
- ✅ Réclamations urgentes identifiées automatiquement

### 6. Tableaux de bord
- ✅ Vue complète pour les administrateurs
- ✅ Historique détaillé pour les étudiants
- ✅ Filtrage et tri automatiques

### 7. Intégrité référentielle
- ✅ Contraintes de clés étrangères avec CASCADE
- ✅ Contraintes CHECK pour valider les valeurs
- ✅ Contraintes UNIQUE pour les emails

### 8. Authentification
- ✅ Champ mot de passe ajouté aux tables
- ✅ Support de l'authentification par email/mot de passe

---

## 📈 STATISTIQUES DE LA BASE

### Nombre d'objets créés

| Type d'objet | Nombre |
|--------------|--------|
| Tables | 5 |
| Séquences | 5 |
| Triggers | 7 |
| Fonctions PL/SQL | 6 |
| Procédures PL/SQL | 4 |
| Vues | 6 |
| **TOTAL** | **33 objets** |

### Contraintes

| Type de contrainte | Nombre |
|-------------------|--------|
| Clés primaires (PK) | 5 |
| Clés étrangères (FK) | 6 |
| Contraintes CHECK | 8 |
| Contraintes UNIQUE | 2 |
| **TOTAL** | **21 contraintes** |

---

## 🔐 SÉCURITÉ ET PERMISSIONS

### Utilisateur de la base
- **Nom** : `SGRE_USER`
- **Privilèges accordés** :
  - `CONNECT` : Connexion à la base
  - `RESOURCE` : Création d'objets (tables, séquences, etc.)
  - `CREATE VIEW` : Création de vues
  - `CREATE PROCEDURE` : Création de procédures
  - `CREATE TRIGGER` : Création de triggers
  - `UNLIMITED TABLESPACE` : Espace illimité

### Contexte d'exécution
- **CDB** : Container Database (racine)
- **PDB** : XEPDB1 (Pluggable Database)
- **Connexion** : `SGRE_USER/sgre_password@localhost:1521/XEPDB1`

---

## 🧪 DONNÉES DE TEST

### Étudiants (3)
1. Ahmed Mohamed - Informatique - L3
2. Aicha Fatima - Mathématiques - M1
3. Ousman Sall - Physique - L2

### Administrateurs (3)
1. Admin Principal - ADMINISTRATEUR
2. Aissata Sall - RESPONSABLE
3. Meimouna Diallo - SUPPORT

### Format des emails
- Étudiants : `[prenom].[nom]@iscae.mr`
- Admins : `[nom].[prenom]@iscae.mr` ou `[role]@iscae.mr`

---

## 📝 NOTES IMPORTANTES

### Corrections apportées

1. **Fonctions de calcul de temps** :
   - Correction de `EXTRACT(DAY FROM (date1 - date2))` → `ROUND(date1 - date2)`
   - Résolution de l'erreur `ORA-30076`

2. **Vues** :
   - Correction des calculs de jours d'attente
   - Utilisation de `ROUND(SYSDATE - date_creation)` au lieu de `EXTRACT`

3. **Procédures** :
   - Gestion correcte des paramètres OUT
   - Support des types CLOB pour les descriptions

### Bonnes pratiques implémentées

- ✅ Utilisation de séquences pour les IDs (meilleure performance)
- ✅ Triggers pour l'auto-incrémentation (transparence)
- ✅ Contraintes CHECK pour la validation des données
- ✅ Clés étrangères avec CASCADE pour l'intégrité
- ✅ Vues matérialisables pour les statistiques
- ✅ Fonctions réutilisables pour les calculs
- ✅ Procédures pour les opérations complexes

---

## 🚀 UTILISATION

### Installation complète
```sql
CONNECT SGRE_USER/sgre_password@localhost:1521/XEPDB1;
@oracle/00_install_complete.sql
```

### Ajout des mots de passe
```sql
CONNECT SGRE_USER/sgre_password@localhost:1521/XEPDB1;
@oracle/08_add_password.sql
```

### Mise à jour des données de test
```sql
CONNECT SGRE_USER/sgre_password@localhost:1521/XEPDB1;
@oracle/07_update_noms_etudiants.sql
```

### Tests
```sql
CONNECT SGRE_USER/sgre_password@localhost:1521/XEPDB1;
@oracle/06_requetes_test.sql
```

---

## 📊 EXEMPLES D'UTILISATION

### Créer une réclamation
```sql
DECLARE
    v_id NUMBER;
BEGIN
    creer_reclamation(
        p_etudiant_id => 1,
        p_type_reclamation => 'ACADEMIQUE',
        p_titre => 'Problème avec ma note',
        p_description => 'Je pense qu''il y a une erreur...',
        p_reclamation_id => v_id
    );
    DBMS_OUTPUT.PUT_LINE('Réclamation créée: ' || v_id);
END;
/
```

### Consulter les statistiques
```sql
SELECT * FROM v_statistiques_globales;
```

### Voir les réclamations urgentes
```sql
SELECT * FROM v_reclamations_urgentes;
```

### Historique d'un étudiant
```sql
SELECT * FROM v_historique_etudiant 
WHERE etudiant_nom LIKE '%Ahmed%';
```

---

## ✅ VALIDATION ET TESTS

### Tests effectués

1. ✅ Création de réclamations via procédure
2. ✅ Attribution de responsables
3. ✅ Changement de statuts (déclenchement des triggers)
4. ✅ Génération automatique des notifications
5. ✅ Calculs de statistiques
6. ✅ Vues fonctionnelles
7. ✅ Intégrité référentielle
8. ✅ Authentification par email/mot de passe

### État des objets

Tous les objets sont en état **VALID** :
- ✅ Toutes les fonctions compilées sans erreur
- ✅ Toutes les procédures compilées sans erreur
- ✅ Toutes les vues créées avec succès
- ✅ Tous les triggers actifs

---

## 📌 CONCLUSION

La base de données Oracle pour le système SGRE est **complète et fonctionnelle**. Elle comprend :

- ✅ **5 tables** avec toutes les contraintes nécessaires
- ✅ **5 séquences** pour l'auto-incrémentation
- ✅ **7 triggers** pour l'automatisation
- ✅ **6 fonctions PL/SQL** pour les calculs
- ✅ **4 procédures PL/SQL** pour les opérations métier
- ✅ **6 vues** pour les tableaux de bord et statistiques
- ✅ **Système d'authentification** avec mots de passe
- ✅ **Gestion automatique** des priorités et notifications

La base est prête pour la production et peut être utilisée avec l'application React/Node.js développée.

---

**Date de création** : Décembre 2025  
**Version** : 1.0  
**Auteur** : Équipe de développement SGRE

