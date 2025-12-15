-- Script pour tester la vue v_statistiques_globales
-- À exécuter dans SQL*Plus pour vérifier que les statistiques fonctionnent

-- 1. Vérifier que la vue existe
SELECT view_name 
FROM user_views 
WHERE view_name = 'V_STATISTIQUES_GLOBALES';

-- 2. Tester la vue directement
SELECT * FROM v_statistiques_globales;

-- 3. Vérifier les colonnes de la vue
SELECT column_name, data_type 
FROM user_tab_columns 
WHERE table_name = 'V_STATISTIQUES_GLOBALES'
ORDER BY column_id;

-- 4. Vérifier les données brutes
SELECT 
    TOTAL_RECLAMATIONS,
    EN_ATTENTE,
    EN_COURS,
    RESOLUES,
    FERMEES,
    TEMPS_MOYEN_JOURS
FROM v_statistiques_globales;

-- 5. Vérifier manuellement les comptages
SELECT 
    COUNT(*) AS total_reclamations,
    COUNT(CASE WHEN statut = 'EN ATTENTE' THEN 1 END) AS en_attente,
    COUNT(CASE WHEN statut = 'EN COURS' THEN 1 END) AS en_cours,
    COUNT(CASE WHEN statut = 'RESOLUE' THEN 1 END) AS resolues,
    COUNT(CASE WHEN statut = 'FERMEE' THEN 1 END) AS fermees
FROM RECLAMATION;

-- 6. Vérifier la fonction temps_moyen_resolution
SELECT temps_moyen_resolution() AS temps_moyen FROM DUAL;

