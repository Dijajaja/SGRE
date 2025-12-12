# Diagramme de Cas d'Utilisation - SGRE

## 📊 Vue d'Ensemble

Le diagramme de cas d'utilisation représente les interactions entre les acteurs (Étudiant et Administrateur) et le système SGRE, ainsi que les traitements métiers automatisés par Oracle.

## 🎭 Acteurs

1. **Étudiant** : Utilisateur qui soumet et consulte ses réclamations
2. **Administrateur** : Utilisateur qui traite et gère les réclamations
3. **Système Oracle** : Automatisations et logique métier (triggers, procédures)

## 📋 Cas d'Utilisation

### Côté Étudiant

```
┌─────────────────────────────────────────────────────────┐
│                    ACTEUR: ÉTUDIANT                     │
└─────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Se connecter │   │ Consulter    │   │ Soumettre    │
│              │   │ historique   │   │ réclamation │
└──────────────┘   └──────────────┘   └──────────────┘
                            │
                            │
                            ▼
                    ┌──────────────┐
                    │ Recevoir     │
                    │ notification │
                    │ (automatique)│
                    └──────────────┘
```

### Côté Administrateur

```
┌─────────────────────────────────────────────────────────┐
│                ACTEUR: ADMINISTRATEUR                   │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Se connecter │   │ Consulter    │   │ Traiter      │
│              │   │ réclamations │   │ réclamation  │
└──────────────┘   └──────────────┘   └──────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Filtrer      │   │ Attribuer    │   │ Consulter    │
│ réclamations │   │ responsable  │   │ statistiques │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Automatisations Oracle (Système)

```
┌─────────────────────────────────────────────────────────┐
│              SYSTÈME ORACLE (AUTOMATIQUE)               │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Générer ID   │   │ Créer        │   │ Créer        │
│ auto-increment│   │ traitement   │   │ notification │
│              │   │ (trigger)    │   │ (trigger)    │
└──────────────┘   └──────────────┘   └──────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Calculer     │   │ Calculer     │   │ Mettre à     │
│ priorité     │   │ temps moyen  │   │ jour vues    │
│ (trigger)    │   │ (fonction)   │   │ (automatique)│
└──────────────┘   └──────────────┘   └──────────────┘
```

## 🔄 Flux Complet de Traitement

```
┌─────────────┐
│  ÉTUDIANT   │
└──────┬──────┘
       │
       │ 1. Soumettre réclamation
       ▼
┌─────────────────────────────────┐
│  Interface React                │
│  (Formulaire)                   │
└──────┬──────────────────────────┘
       │
       │ 2. POST /api/reclamations
       ▼
┌─────────────────────────────────┐
│  Backend Node.js                │
│  (API REST)                     │
└──────┬──────────────────────────┘
       │
       │ 3. Appel procédure Oracle
       ▼
┌─────────────────────────────────┐
│  Oracle Database                │
│  ┌──────────────────────────┐   │
│  │ Procédure:              │   │
│  │ creer_reclamation()     │   │
│  └──────┬──────────────────┘   │
│         │                        │
│         │ 4. INSERT RECLAMATION  │
│         ▼                        │
│  ┌──────────────────────────┐   │
│  │ Trigger:                 │   │
│  │ trg_reclamation_id       │   │
│  │ (auto-increment)         │   │
│  └──────┬──────────────────┘   │
│         │                        │
│         │ 5. Trigger:            │
│         │ trg_calcul_priorite    │
│         │ (calcul priorité)     │
│         └────────────────────────┘
└─────────────────────────────────┘
       │
       │ 6. Réclamation créée
       │    Statut: "EN ATTENTE"
       ▼
┌─────────────┐
│ ADMIN       │
└──────┬──────┘
       │
       │ 7. Consulter réclamations
       │    (via v_dashboard_admin)
       │
       │ 8. Attribuer responsable
       │    (procédure attribuer_responsable)
       │
       │ 9. Traiter réclamation
       │    (procédure traiter_reclamation)
       │    Statut: "EN COURS" → "RESOLUE"
       ▼
┌─────────────────────────────────┐
│  Oracle Database                │
│  ┌──────────────────────────┐   │
│  │ Trigger:                │   │
│  │ trg_reclamation_statut_ │   │
│  │ change                  │   │
│  │ → Crée TRAITEMENT       │   │
│  └──────┬──────────────────┘   │
│         │                        │
│         │ 10. Si statut = RESOLUE│
│         ▼                        │
│  ┌──────────────────────────┐   │
│  │ Trigger:                │   │
│  │ trg_reclamation_resolue  │   │
│  │ → Crée NOTIFICATION      │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
       │
       │ 11. Notification créée
       ▼
┌─────────────┐
│  ÉTUDIANT   │
└──────┬──────┘
       │
       │ 12. Consulter notifications
       │     (GET /api/etudiants/:id/notifications)
       │
       │ 13. Voir réclamation résolue
```

## 📊 Interactions avec les Vues Oracle

### Vue: v_historique_etudiant
- **Acteur** : Étudiant
- **Action** : Consulter son historique
- **Déclencheur** : GET /api/etudiants/:id/reclamations

### Vue: v_dashboard_admin
- **Acteur** : Administrateur
- **Action** : Consulter toutes les réclamations
- **Déclencheur** : GET /api/reclamations

### Vue: v_reclamations_urgentes
- **Acteur** : Administrateur
- **Action** : Voir les réclamations prioritaires
- **Déclencheur** : GET /api/statistiques/urgentes

### Vue: v_statistiques_globales
- **Acteur** : Administrateur
- **Action** : Consulter les statistiques
- **Déclencheur** : GET /api/statistiques/globales

## 🔧 Traitements Métiers Automatisés

### 1. Création de Réclamation
- **Trigger** : `trg_reclamation_id` → Génère l'ID automatiquement
- **Trigger** : `trg_calcul_priorite` → Calcule la priorité selon le type
- **Résultat** : Réclamation créée avec statut "EN ATTENTE"

### 2. Changement de Statut
- **Trigger** : `trg_reclamation_statut_change` → Crée une entrée dans TRAITEMENT
- **Résultat** : Historique complet des modifications

### 3. Résolution de Réclamation
- **Trigger** : `trg_reclamation_resolue` → Crée une NOTIFICATION pour l'étudiant
- **Résultat** : Étudiant notifié automatiquement

### 4. Calculs Statistiques
- **Fonction** : `temps_moyen_resolution()` → Calcul automatique
- **Fonction** : `nbr_reclamations_par_type()` → Comptage automatique
- **Résultat** : Statistiques toujours à jour

## 📝 Légende

- **Rectangle** : Cas d'utilisation
- **Flèche** : Relation/Flux
- **Acteur** : Utilisateur du système
- **Système** : Automatisations Oracle

## 🎯 Objectifs du Diagramme

Ce diagramme démontre que :
1. **Oracle gère automatiquement** une grande partie de la logique métier
2. **L'application React** sert uniquement d'interface pour interagir avec Oracle
3. **Les triggers** assurent la cohérence et l'automatisation
4. **Les vues** fournissent des données pré-calculées et optimisées
5. **Les procédures** encapsulent les opérations complexes

