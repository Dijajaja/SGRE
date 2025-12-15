-- Script de test pour vérifier l'attribution de responsable
-- À exécuter après avoir attribué un responsable à une réclamation

-- 1. Vérifier les réclamations avec leur responsable
SELECT 
    r.id AS reclamation_id,
    r.statut,
    r.admin_assignee_id,
    a.nom || ' ' || a.prenom AS admin_nom,
    a.id AS admin_id
FROM RECLAMATION r
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
ORDER BY r.id DESC;

-- 2. Vérifier la vue v_dashboard_admin
SELECT 
    reclamation_id,
    statut,
    admin_assignee_id,
    admin_assignee,
    admin_role
FROM v_dashboard_admin
ORDER BY reclamation_id DESC;

-- 3. Vérifier une réclamation spécifique (remplacer 1 par l'ID de la réclamation testée)
SELECT 
    r.id,
    r.statut,
    r.admin_assignee_id,
    a.nom || ' ' || a.prenom AS admin_nom
FROM RECLAMATION r
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
WHERE r.id = 1;  -- Remplace 1 par l'ID de la réclamation

-- 4. Lister tous les admins disponibles
SELECT id, nom, prenom, email, role FROM ADMIN ORDER BY id;

