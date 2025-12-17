-- Script pour vérifier toutes les réclamations dans la base
-- À exécuter dans SQL*Plus

-- 1. Compter toutes les réclamations
SELECT COUNT(*) AS total_reclamations FROM RECLAMATION;

-- 2. Voir toutes les réclamations avec leurs responsables
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.statut,
    r.admin_assignee_id,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    a.nom || ' ' || a.prenom AS admin_assignee
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
ORDER BY r.id;

-- 3. Vérifier la vue v_dashboard_admin
SELECT COUNT(*) AS total_dans_vue FROM v_dashboard_admin;

-- 4. Voir toutes les réclamations dans la vue
SELECT 
    reclamation_id,
    titre,
    statut,
    admin_assignee_id,
    admin_assignee,
    etudiant_nom
FROM v_dashboard_admin
ORDER BY reclamation_id;

-- 5. Compter par admin assigné
SELECT 
    admin_assignee_id,
    COUNT(*) AS nombre_reclamations
FROM RECLAMATION
WHERE admin_assignee_id IS NOT NULL
GROUP BY admin_assignee_id
ORDER BY admin_assignee_id;

-- 6. Voir les réclamations non assignées
SELECT 
    id AS reclamation_id,
    titre,
    statut,
    admin_assignee_id
FROM RECLAMATION
WHERE admin_assignee_id IS NULL;

