-- Script pour vider les données existantes avant l'import
-- À exécuter AVANT d'importer export_donnees_complet.sql
-- ATTENTION : Ceci supprimera TOUTES les données existantes !

PROMPT ============================================
PROMPT VIDAGE DES DONNÉES EXISTANTES
PROMPT ============================================
PROMPT
PROMPT ATTENTION : Ce script va supprimer toutes les données !
PROMPT

-- Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
DELETE FROM NOTIFICATION;
PROMPT Notifications supprimées...

DELETE FROM TRAITEMENT;
PROMPT Traitements supprimés...

DELETE FROM RECLAMATION;
PROMPT Réclamations supprimées...

DELETE FROM ETUDIANT;
PROMPT Étudiants supprimés...

DELETE FROM ADMIN;
PROMPT Admins supprimés...

-- Réinitialiser les séquences
ALTER SEQUENCE seq_etudiant RESTART START WITH 1;
ALTER SEQUENCE seq_admin RESTART START WITH 1;
ALTER SEQUENCE seq_reclamation RESTART START WITH 1;
ALTER SEQUENCE seq_traitement RESTART START WITH 1;
ALTER SEQUENCE seq_notification RESTART START WITH 1;

PROMPT Séquences réinitialisées...

COMMIT;

PROMPT ============================================
PROMPT ✅ Données supprimées avec succès !
PROMPT ============================================
PROMPT
PROMPT Tu peux maintenant importer les données avec :
PROMPT @oracle/export_donnees_complet.sql
PROMPT

