-- Script pour recréer la vue v_dashboard_admin avec admin_assignee_id
-- À exécuter dans SQL*Plus connecté en SGRE_USER

-- Supprimer la vue si elle existe
DROP VIEW v_dashboard_admin;

-- Recréer la vue avec admin_assignee_id
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
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
ORDER BY 
    CASE r.priorite
        WHEN 'URGENTE' THEN 1
        WHEN 'ELEVEE' THEN 2
        WHEN 'MOYENNE' THEN 3
        ELSE 4
    END,
    r.date_creation DESC;

-- Vérifier que la vue fonctionne
SELECT column_name, data_type 
FROM user_tab_columns 
WHERE table_name = 'V_DASHBOARD_ADMIN'
ORDER BY column_id;

-- Tester la vue
SELECT 
    reclamation_id,
    titre,
    statut,
    admin_assignee_id,
    admin_assignee
FROM v_dashboard_admin
FETCH FIRST 5 ROWS ONLY;

