-- ============================================
-- VÉRIFICATION DE L'ATTRIBUTION D'UN RESPONSABLE
-- ============================================

PROMPT ============================================
PROMPT VÉRIFICATION DE L'ATTRIBUTION D'UN RESPONSABLE
PROMPT ============================================

-- 1. Vérifier les réclamations avec leurs responsables assignés
PROMPT 
PROMPT 1. RÉCLAMATIONS AVEC RESPONSABLES ASSIGNÉS:
PROMPT ============================================
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.statut,
    r.priorite,
    e.nom || ' ' || e.prenom AS etudiant,
    a.nom || ' ' || a.prenom AS responsable,
    a.role AS role_responsable,
    r.date_creation
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
ORDER BY r.date_creation DESC;

-- 2. Vérifier les réclamations sans responsable
PROMPT 
PROMPT 2. RÉCLAMATIONS SANS RESPONSABLE:
PROMPT ============================================
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.statut,
    r.priorite,
    e.nom || ' ' || e.prenom AS etudiant,
    r.date_creation
FROM RECLAMATION r
JOIN ETUDIANT e ON r.etudiant_id = e.id
WHERE r.admin_assignee_id IS NULL
ORDER BY r.date_creation DESC;

-- 3. Vérifier l'historique des traitements après attribution
PROMPT 
PROMPT 3. HISTORIQUE DES TRAITEMENTS (après attribution):
PROMPT ============================================
SELECT 
    t.id AS traitement_id,
    t.reclamation_id,
    r.titre AS reclamation_titre,
    a.nom || ' ' || a.prenom AS admin_traitant,
    t.ancien_statut,
    t.nouveau_statut,
    t.date_traitement,
    t.commentaire
FROM TRAITEMENT t
JOIN RECLAMATION r ON t.reclamation_id = r.id
JOIN ADMIN a ON t.admin_id = a.id
ORDER BY t.date_traitement DESC;

-- 4. Vérifier que le statut passe bien à "EN COURS" après attribution
PROMPT 
PROMPT 4. RÉCLAMATIONS PASSÉES EN "EN COURS" APRÈS ATTRIBUTION:
PROMPT ============================================
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.statut,
    a.nom || ' ' || a.prenom AS responsable,
    t.date_traitement AS date_attribution
FROM RECLAMATION r
JOIN ADMIN a ON r.admin_assignee_id = a.id
LEFT JOIN TRAITEMENT t ON r.id = t.reclamation_id 
    AND t.nouveau_statut = 'EN COURS'
WHERE r.statut = 'EN COURS'
ORDER BY t.date_traitement DESC;

-- 5. Statistiques par responsable
PROMPT 
PROMPT 5. STATISTIQUES PAR RESPONSABLE:
PROMPT ============================================
SELECT 
    a.id AS admin_id,
    a.nom || ' ' || a.prenom AS responsable,
    a.role,
    COUNT(r.id) AS nb_reclamations_assignees,
    COUNT(CASE WHEN r.statut = 'EN ATTENTE' THEN 1 END) AS en_attente,
    COUNT(CASE WHEN r.statut = 'EN COURS' THEN 1 END) AS en_cours,
    COUNT(CASE WHEN r.statut = 'RESOLUE' THEN 1 END) AS resolues,
    COUNT(CASE WHEN r.statut = 'FERMEE' THEN 1 END) AS fermees
FROM ADMIN a
LEFT JOIN RECLAMATION r ON a.id = r.admin_assignee_id
GROUP BY a.id, a.nom, a.prenom, a.role
ORDER BY nb_reclamations_assignees DESC;

PROMPT 
PROMPT ============================================
PROMPT VÉRIFICATION TERMINÉE
PROMPT ============================================

