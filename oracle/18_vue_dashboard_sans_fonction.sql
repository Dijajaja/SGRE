-- Version SIMPLIFIÉE sans la fonction temps_traitement_reclamation
-- À exécuter dans SQL*Plus

DROP VIEW v_dashboard_admin;
/

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
    0 AS jours_traitement,
    CASE 
        WHEN r.statut IN ('EN ATTENTE', 'EN COURS') THEN 
            ROUND(SYSDATE - r.date_creation)
        ELSE NULL
    END AS jours_attente
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id;
/

-- Vérifier
SELECT reclamation_id, titre, statut, admin_assignee_id 
FROM v_dashboard_admin 
FETCH FIRST 5 ROWS ONLY;
/

