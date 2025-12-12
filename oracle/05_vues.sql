-- ============================================
-- VUES ORACLE - AFFICHAGE ET STATISTIQUES
-- ============================================

-- ============================================
-- VUE 1: Historique complet d'un étudiant
-- ============================================
CREATE OR REPLACE VIEW v_historique_etudiant AS
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.type_reclamation,
    r.description,
    r.date_creation,
    r.statut,
    r.priorite,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    e.filiere,
    a.nom || ' ' || a.prenom AS admin_nom,
    a.role AS admin_role,
    (SELECT COUNT(*) FROM TRAITEMENT WHERE reclamation_id = r.id) AS nb_traitements,
    (SELECT MAX(date_traitement) FROM TRAITEMENT WHERE reclamation_id = r.id) AS derniere_modification
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
ORDER BY r.date_creation DESC;

-- ============================================
-- VUE 2: Tableau de bord administratif
-- ============================================
CREATE OR REPLACE VIEW v_dashboard_admin AS
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.type_reclamation,
    r.statut,
    r.priorite,
    r.date_creation,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    e.filiere,
    e.email AS etudiant_email,
    a.nom || ' ' || a.prenom AS admin_assignee,
    a.role AS admin_role,
    (SELECT COUNT(*) FROM TRAITEMENT WHERE reclamation_id = r.id) AS nb_traitements,
    temps_traitement_reclamation(r.id) AS jours_traitement,
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

-- ============================================
-- VUE 3: Réclamations urgentes
-- ============================================
CREATE OR REPLACE VIEW v_reclamations_urgentes AS
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.type_reclamation,
    r.statut,
    r.priorite,
    r.date_creation,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    e.filiere,
    e.email AS etudiant_email,
    a.nom || ' ' || a.prenom AS admin_assignee,
    ROUND(SYSDATE - r.date_creation) AS jours_attente,
    temps_traitement_reclamation(r.id) AS jours_traitement
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
WHERE r.priorite IN ('URGENTE', 'ELEVEE')
AND r.statut IN ('EN ATTENTE', 'EN COURS')
ORDER BY 
    CASE r.priorite
        WHEN 'URGENTE' THEN 1
        ELSE 2
    END,
    r.date_creation ASC;

-- ============================================
-- VUE 4: Statistiques globales
-- ============================================
CREATE OR REPLACE VIEW v_statistiques_globales AS
SELECT 
    (SELECT COUNT(*) FROM RECLAMATION) AS total_reclamations,
    (SELECT COUNT(*) FROM RECLAMATION WHERE statut = 'EN ATTENTE') AS en_attente,
    (SELECT COUNT(*) FROM RECLAMATION WHERE statut = 'EN COURS') AS en_cours,
    (SELECT COUNT(*) FROM RECLAMATION WHERE statut = 'RESOLUE') AS resolues,
    (SELECT COUNT(*) FROM RECLAMATION WHERE statut = 'FERMEE') AS fermees,
    (SELECT COUNT(*) FROM RECLAMATION WHERE type_reclamation = 'ACADEMIQUE') AS academiques,
    (SELECT COUNT(*) FROM RECLAMATION WHERE type_reclamation = 'ADMINISTRATIF') AS administratives,
    (SELECT COUNT(*) FROM RECLAMATION WHERE type_reclamation = 'TECHNIQUE') AS techniques,
    temps_moyen_resolution() AS temps_moyen_jours,
    (SELECT COUNT(*) FROM NOTIFICATION WHERE lu = 0) AS notifications_non_lues
FROM DUAL;

-- ============================================
-- VUE 5: Détails complets d'une réclamation avec historique
-- ============================================
CREATE OR REPLACE VIEW v_detail_reclamation AS
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.type_reclamation,
    r.description,
    r.date_creation,
    r.statut,
    r.priorite,
    e.id AS etudiant_id,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    e.email AS etudiant_email,
    e.filiere,
    e.niveau,
    a.id AS admin_id,
    a.nom || ' ' || a.prenom AS admin_nom,
    a.email AS admin_email,
    a.role AS admin_role,
    t.id AS traitement_id,
    t.date_traitement,
    t.commentaire AS traitement_commentaire,
    t.ancien_statut,
    t.nouveau_statut,
    admin_t.nom || ' ' || admin_t.prenom AS traitement_admin_nom
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
LEFT JOIN TRAITEMENT t ON r.id = t.reclamation_id
LEFT JOIN ADMIN admin_t ON t.admin_id = admin_t.id
ORDER BY r.id, t.date_traitement DESC;

-- ============================================
-- VUE 6: Réclamations par filière
-- ============================================
CREATE OR REPLACE VIEW v_reclamations_par_filiere AS
SELECT 
    e.filiere,
    COUNT(*) AS nombre_reclamations,
    COUNT(CASE WHEN r.statut = 'EN ATTENTE' THEN 1 END) AS en_attente,
    COUNT(CASE WHEN r.statut = 'EN COURS' THEN 1 END) AS en_cours,
    COUNT(CASE WHEN r.statut = 'RESOLUE' THEN 1 END) AS resolues,
    COUNT(CASE WHEN r.statut = 'FERMEE' THEN 1 END) AS fermees,
    AVG(temps_traitement_reclamation(r.id)) AS temps_moyen_jours
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
GROUP BY e.filiere
ORDER BY nombre_reclamations DESC;

