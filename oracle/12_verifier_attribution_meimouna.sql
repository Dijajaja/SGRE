-- Script pour vérifier les réclamations attribuées à Meimouna
-- Remplace l'ID de Meimouna par son vrai ID dans la table ADMIN

-- 1. Trouver l'ID de Meimouna
SELECT id, nom, prenom, email 
FROM ADMIN 
WHERE UPPER(nom) LIKE '%MEIMOUN%' OR UPPER(prenom) LIKE '%MEIMOUN%';

-- 2. Voir toutes les réclamations attribuées à cet admin (remplace X par l'ID trouvé)
SELECT 
    r.id AS reclamation_id,
    r.titre,
    r.statut,
    r.admin_assignee_id,
    a.nom || ' ' || a.prenom AS admin_nom,
    e.nom || ' ' || e.prenom AS etudiant_nom
FROM RECLAMATION r
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
JOIN ETUDIANT e ON r.etudiant_id = e.id
WHERE r.admin_assignee_id = (SELECT id FROM ADMIN WHERE UPPER(nom) LIKE '%MEIMOUN%' OR UPPER(prenom) LIKE '%MEIMOUN%' FETCH FIRST 1 ROW ONLY)
ORDER BY r.id DESC;

-- 3. Vérifier la vue v_dashboard_admin pour cet admin
SELECT 
    reclamation_id,
    titre,
    statut,
    admin_assignee_id,
    admin_assignee,
    etudiant_nom
FROM v_dashboard_admin
WHERE admin_assignee_id = (SELECT id FROM ADMIN WHERE UPPER(nom) LIKE '%MEIMOUN%' OR UPPER(prenom) LIKE '%MEIMOUN%' FETCH FIRST 1 ROW ONLY)
ORDER BY reclamation_id DESC;

-- 4. Voir toutes les réclamations avec leur admin assigné (pour vérifier globalement)
SELECT 
    r.id,
    r.titre,
    r.statut,
    r.admin_assignee_id,
    a.nom || ' ' || a.prenom AS admin_nom
FROM RECLAMATION r
LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
ORDER BY r.id DESC;

