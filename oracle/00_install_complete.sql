-- ============================================
-- SCRIPT D'INSTALLATION COMPLÈTE - SGRE
-- ============================================
-- Ce script exécute tous les scripts nécessaires
-- dans le bon ordre pour installer complètement
-- le système de gestion des réclamations étudiantes
-- ============================================

SET SERVEROUTPUT ON;
SET ECHO ON;

PROMPT ============================================
PROMPT Installation du Système SGRE
PROMPT ============================================
PROMPT

PROMPT [1/5] Création du schéma...
@01_schema.sql
PROMPT ✓ Schéma créé avec succès
PROMPT

PROMPT [2/5] Création des triggers...
@02_triggers.sql
PROMPT ✓ Triggers créés avec succès
PROMPT

PROMPT [3/5] Création des fonctions...
@03_fonctions.sql
PROMPT ✓ Fonctions créées avec succès
PROMPT

PROMPT [4/5] Création des procédures...
@04_procedures.sql
PROMPT ✓ Procédures créées avec succès
PROMPT

PROMPT [5/5] Création des vues...
@05_vues.sql
PROMPT ✓ Vues créées avec succès
PROMPT

PROMPT ============================================
PROMPT Installation terminée avec succès !
PROMPT ============================================
PROMPT
PROMPT Pour tester l'installation, exécutez :
PROMPT @06_requetes_test.sql
PROMPT

-- Vérification rapide
PROMPT Vérification de l'installation...
SELECT 
    (SELECT COUNT(*) FROM user_tables) AS nb_tables,
    (SELECT COUNT(*) FROM user_sequences) AS nb_sequences,
    (SELECT COUNT(*) FROM user_triggers) AS nb_triggers,
    (SELECT COUNT(*) FROM user_objects WHERE object_type = 'FUNCTION') AS nb_fonctions,
    (SELECT COUNT(*) FROM user_objects WHERE object_type = 'PROCEDURE') AS nb_procedures,
    (SELECT COUNT(*) FROM user_views) AS nb_vues
FROM DUAL;

PROMPT
PROMPT Installation complète ! Vous pouvez maintenant utiliser le système SGRE.

