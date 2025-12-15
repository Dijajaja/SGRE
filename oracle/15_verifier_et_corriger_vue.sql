-- Script pour vérifier et corriger la vue v_dashboard_admin
-- À exécuter dans SQL*Plus connecté en SGRE_USER

-- 1. Vérifier que la colonne admin_assignee_id existe dans RECLAMATION
SELECT column_name, data_type, nullable
FROM user_tab_columns
WHERE table_name = 'RECLAMATION'
AND column_name = 'ADMIN_ASSIGNEE_ID';

-- 2. Si la colonne n'existe pas, l'ajouter
-- (Décommente ces lignes si la requête ci-dessus ne retourne rien)
-- ALTER TABLE RECLAMATION ADD admin_assignee_id NUMBER;
-- ALTER TABLE RECLAMATION ADD CONSTRAINT fk_reclamation_admin FOREIGN KEY (admin_assignee_id) REFERENCES ADMIN(id) ON DELETE SET NULL;

-- 3. Vérifier les colonnes de la vue actuelle
SELECT column_name
FROM user_tab_columns
WHERE table_name = 'V_DASHBOARD_ADMIN'
ORDER BY column_id;

-- 4. Supprimer la vue
DROP VIEW v_dashboard_admin;

-- 5. Recréer la vue avec admin_assignee_id
CREATE OR REPLACE VIEW v_dashboard_admin AS
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.type_reclamation,
    r.statut,
    r.priorite,
    r.date_creation,
    r.admin_assignee_id,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    e.filiere,
    e.email AS etudiant_email,
    a.nom || ' ' || a.prenom AS admin_assignee,
    a.role AS admin_role,
    (SELECT COUNT(*) FROM TRAITEMENT WHERE reclamation_id = r.id) AS nb_traitements,
    NVL(temps_traitement_reclamation(r.id), 0) AS jours_traitement,
    CASE 
        WHEN r.statut IN ('EN ATTENTE', 'EN COURS') THEN 
            ROUND(SYSDATE - r.date_creation)
        ELSE NULL
    END AS jours_attente
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id;

-- 6. Vérifier que la vue fonctionne maintenant
SELECT reclamation_id, titre, statut, admin_assignee_id, admin_assignee
FROM v_dashboard_admin
FETCH FIRST 5 ROWS ONLY;

-- 7. Vérifier les colonnes de la nouvelle vue
SELECT column_name
FROM user_tab_columns
WHERE table_name = 'V_DASHBOARD_ADMIN'
ORDER BY column_id;

