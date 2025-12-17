-- Script d'export des données pour synchronisation
-- À exécuter sur le PC qui a toutes les données (PC serveur)
-- Génère des scripts SQL pour réimporter les données sur l'autre PC

SET PAGESIZE 0
SET FEEDBACK OFF
SET VERIFY OFF
SET HEADING OFF
SET ECHO OFF
SET LINESIZE 2000

-- Spooler vers un fichier
SPOOL C:\Users\PC\BD\oracle\export_donnees_complet.sql

PROMPT -- ============================================
PROMPT -- SCRIPT D'EXPORT DES DONNÉES SGRE
PROMPT -- Date: 
SELECT TO_CHAR(SYSDATE, 'DD/MM/YYYY HH24:MI:SS') FROM DUAL;
PROMPT -- ============================================
PROMPT

PROMPT -- Supprimer les données existantes (optionnel)
PROMPT -- DELETE FROM TRAITEMENT;
PROMPT -- DELETE FROM NOTIFICATION;
PROMPT -- DELETE FROM RECLAMATION;
PROMPT -- DELETE FROM ETUDIANT;
PROMPT -- DELETE FROM ADMIN;
PROMPT

PROMPT -- ============================================
PROMPT -- EXPORT DES ÉTUDIANTS
PROMPT -- ============================================
SELECT 'INSERT INTO ETUDIANT (id, nom, prenom, email, filiere, niveau, mot_de_passe, date_inscription) VALUES (' ||
       id || ', ''' ||
       REPLACE(nom, '''', '''''') || ''', ''' ||
       REPLACE(prenom, '''', '''''') || ''', ''' ||
       email || ''', ''' ||
       filiere || ''', ''' ||
       niveau || ''', ''' ||
       mot_de_passe || ''', ' ||
       'TO_DATE(''' || TO_CHAR(date_inscription, 'YYYY-MM-DD HH24:MI:SS') || ''', ''YYYY-MM-DD HH24:MI:SS''));'
FROM ETUDIANT
ORDER BY id;

PROMPT

PROMPT -- ============================================
PROMPT -- EXPORT DES ADMINS
PROMPT -- ============================================
SELECT 'INSERT INTO ADMIN (id, nom, prenom, email, role, mot_de_passe, date_creation) VALUES (' ||
       id || ', ''' ||
       REPLACE(nom, '''', '''''') || ''', ''' ||
       REPLACE(prenom, '''', '''''') || ''', ''' ||
       email || ''', ''' ||
       role || ''', ''' ||
       mot_de_passe || ''', ' ||
       'TO_DATE(''' || TO_CHAR(date_creation, 'YYYY-MM-DD HH24:MI:SS') || ''', ''YYYY-MM-DD HH24:MI:SS''));'
FROM ADMIN
ORDER BY id;

PROMPT

PROMPT -- ============================================
PROMPT -- EXPORT DES RÉCLAMATIONS
PROMPT -- ============================================
SELECT 'INSERT INTO RECLAMATION (id, etudiant_id, type_reclamation, titre, description, date_creation, statut, priorite, admin_assignee_id) VALUES (' ||
       id || ', ' ||
       etudiant_id || ', ''' ||
       type_reclamation || ''', ''' ||
       REPLACE(titre, '''', '''''') || ''', ''' ||
       REPLACE(DBMS_LOB.SUBSTR(description, 4000), '''', '''''') || ''', ' ||
       'TO_DATE(''' || TO_CHAR(date_creation, 'YYYY-MM-DD HH24:MI:SS') || ''', ''YYYY-MM-DD HH24:MI:SS''), ''' ||
       statut || ''', ''' ||
       priorite || ''', ' ||
       NVL(TO_CHAR(admin_assignee_id), 'NULL') || ');'
FROM RECLAMATION
ORDER BY id;

PROMPT

PROMPT -- ============================================
PROMPT -- EXPORT DES TRAITEMENTS
PROMPT -- ============================================
SELECT 'INSERT INTO TRAITEMENT (id, reclamation_id, admin_id, date_traitement, ancien_statut, nouveau_statut, commentaire) VALUES (' ||
       id || ', ' ||
       reclamation_id || ', ' ||
       admin_id || ', ' ||
       'TO_DATE(''' || TO_CHAR(date_traitement, 'YYYY-MM-DD HH24:MI:SS') || ''', ''YYYY-MM-DD HH24:MI:SS''), ''' ||
       NVL(ancien_statut, 'NULL') || ''', ''' ||
       NVL(nouveau_statut, 'NULL') || ''', ''' ||
       REPLACE(NVL(DBMS_LOB.SUBSTR(commentaire, 4000), ''), '''', '''''') || ''');'
FROM TRAITEMENT
ORDER BY id;

PROMPT

PROMPT -- ============================================
PROMPT -- EXPORT DES NOTIFICATIONS
PROMPT -- ============================================
SELECT 'INSERT INTO NOTIFICATION (id, etudiant_id, reclamation_id, message, date_notification, lu) VALUES (' ||
       id || ', ' ||
       etudiant_id || ', ' ||
       reclamation_id || ', ''' ||
       REPLACE(message, '''', '''''') || ''', ' ||
       'TO_DATE(''' || TO_CHAR(date_notification, 'YYYY-MM-DD HH24:MI:SS') || ''', ''YYYY-MM-DD HH24:MI:SS''), ' ||
       lu || ');'
FROM NOTIFICATION
ORDER BY id;

PROMPT
PROMPT -- ============================================
PROMPT -- FIN DE L'EXPORT
PROMPT -- ============================================
PROMPT COMMIT;

SPOOL OFF

PROMPT ✅ Export terminé ! Fichier créé : C:\Users\PC\BD\oracle\export_donnees_complet.sql

