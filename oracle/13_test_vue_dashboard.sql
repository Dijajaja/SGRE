-- Script pour tester la vue v_dashboard_admin
-- À exécuter dans SQL*Plus pour vérifier que la vue fonctionne

-- 1. Vérifier que la vue existe
SELECT view_name FROM user_views WHERE view_name = 'V_DASHBOARD_ADMIN';

-- 2. Tester la vue sans filtres
SELECT 
    reclamation_id,
    titre,
    statut,
    admin_assignee_id,
    admin_assignee,
    etudiant_nom
FROM v_dashboard_admin
ORDER BY reclamation_id DESC
FETCH FIRST 5 ROWS ONLY;

-- 3. Tester avec un filtre statut
SELECT 
    reclamation_id,
    titre,
    statut,
    admin_assignee_id,
    admin_assignee
FROM v_dashboard_admin
WHERE statut = 'EN ATTENTE'
ORDER BY reclamation_id DESC;

-- 4. Tester avec un filtre admin_assignee_id (remplace X par un ID d'admin existant)
SELECT 
    reclamation_id,
    titre,
    statut,
    admin_assignee_id,
    admin_assignee
FROM v_dashboard_admin
WHERE admin_assignee_id = 1  -- Remplace 1 par un ID d'admin existant
ORDER BY reclamation_id DESC;

-- 5. Vérifier les colonnes de la vue
SELECT column_name, data_type 
FROM user_tab_columns 
WHERE table_name = 'V_DASHBOARD_ADMIN'
ORDER BY column_id;

