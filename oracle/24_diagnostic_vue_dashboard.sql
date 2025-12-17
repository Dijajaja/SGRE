-- Script de diagnostic pour v_dashboard_admin
-- À exécuter sur le PC qui ne voit que 2 réclamations

PROMPT ============================================
PROMPT DIAGNOSTIC : Pourquoi seulement 2 réclamations ?
PROMPT ============================================
PROMPT

-- 1. Compter toutes les réclamations dans la table
PROMPT 1. Nombre total de réclamations dans la table RECLAMATION:
SELECT COUNT(*) AS total_reclamations FROM RECLAMATION;

-- 2. Voir toutes les réclamations avec leurs étudiants
PROMPT
PROMPT 2. Toutes les réclamations avec leurs étudiants:
SELECT 
    r.id AS reclamation_id,
    r.etudiant_id,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    r.statut,
    r.titre
FROM RECLAMATION r
LEFT JOIN ETUDIANT e ON r.etudiant_id = e.id
ORDER BY r.id;

-- 3. Vérifier s'il y a des réclamations sans étudiant (NULL)
PROMPT
PROMPT 3. Réclamations SANS étudiant (problème potentiel):
SELECT 
    r.id AS reclamation_id,
    r.etudiant_id,
    r.statut,
    r.titre
FROM RECLAMATION r
WHERE r.etudiant_id NOT IN (SELECT id FROM ETUDIANT)
   OR r.etudiant_id IS NULL;

-- 4. Compter dans la vue
PROMPT
PROMPT 4. Nombre de réclamations dans la vue v_dashboard_admin:
SELECT COUNT(*) AS total_dans_vue FROM v_dashboard_admin;

-- 5. Voir toutes les réclamations dans la vue
PROMPT
PROMPT 5. Toutes les réclamations dans la vue:
SELECT 
    reclamation_id,
    titre,
    statut,
    etudiant_nom
FROM v_dashboard_admin
ORDER BY reclamation_id;

-- 6. Tester la fonction temps_traitement_reclamation pour chaque réclamation
PROMPT
PROMPT 6. Test de la fonction temps_traitement_reclamation:
SELECT 
    r.id AS reclamation_id,
    temps_traitement_reclamation(r.id) AS jours_traitement
FROM RECLAMATION r
ORDER BY r.id;

-- 7. Vérifier les étudiants manquants
PROMPT
PROMPT 7. Étudiants référencés dans RECLAMATION mais absents de ETUDIANT:
SELECT DISTINCT r.etudiant_id
FROM RECLAMATION r
WHERE r.etudiant_id NOT IN (SELECT id FROM ETUDIANT)
   OR NOT EXISTS (SELECT 1 FROM ETUDIANT e WHERE e.id = r.etudiant_id);

PROMPT
PROMPT ============================================
PROMPT FIN DU DIAGNOSTIC
PROMPT ============================================

