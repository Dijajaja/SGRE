-- ============================================
-- REQUÊTES DE TEST ET VALIDATION
-- ============================================

-- Test 1: Créer une réclamation via procédure
DECLARE
    v_reclamation_id NUMBER;
BEGIN
    creer_reclamation(
        p_etudiant_id => 1,
        p_type_reclamation => 'ACADEMIQUE',
        p_titre => 'Problème avec ma note d''examen',
        p_description => 'Je pense qu''il y a une erreur dans le calcul de ma note finale.',
        p_reclamation_id => v_reclamation_id
    );
    DBMS_OUTPUT.PUT_LINE('Réclamation créée: ' || v_reclamation_id);
END;
/

-- Test 2: Attribuer un responsable
BEGIN
    attribuer_responsable(
        p_reclamation_id => 1,
        p_admin_id => 2
    );
END;
/

-- Test 3: Traiter une réclamation
BEGIN
    traiter_reclamation(
        p_reclamation_id => 1,
        p_admin_id => 2,
        p_nouveau_statut => 'EN COURS',
        p_commentaire => 'Réclamation prise en charge, vérification en cours.'
    );
END;
/

-- Test 4: Résoudre une réclamation (déclenchera le trigger de notification)
BEGIN
    traiter_reclamation(
        p_reclamation_id => 1,
        p_admin_id => 2,
        p_nouveau_statut => 'RESOLUE',
        p_commentaire => 'Note corrigée, problème résolu.'
    );
END;
/

-- Test 5: Afficher les statistiques
SELECT * FROM v_statistiques_globales;

-- Test 6: Afficher l'historique d'un étudiant
SELECT * FROM v_historique_etudiant WHERE etudiant_nom LIKE '%Dupont%';

-- Test 7: Afficher le dashboard admin
SELECT * FROM v_dashboard_admin;

-- Test 8: Afficher les réclamations urgentes
SELECT * FROM v_reclamations_urgentes;

-- Test 9: Tester les fonctions
SELECT 
    temps_moyen_resolution() AS temps_moyen,
    nbr_reclamations_par_type('ACADEMIQUE') AS academiques,
    nbr_reclamations_par_type('ADMINISTRATIF') AS administratives,
    nbr_reclamations_par_type('TECHNIQUE') AS techniques,
    nbr_reclamations_non_resolues() AS non_resolues
FROM DUAL;

-- Test 10: Vérifier les notifications créées
SELECT * FROM NOTIFICATION ORDER BY date_notification DESC;

