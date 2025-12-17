-- Script pour vérifier les admins et leurs identifiants
-- À exécuter sur le PC qui a des problèmes de connexion admin

PROMPT ============================================
PROMPT VÉRIFICATION DES ADMINS
PROMPT ============================================
PROMPT

-- 1. Vérifier que la table ADMIN existe
PROMPT 1. Vérification de la table ADMIN:
SELECT COUNT(*) AS nombre_admins FROM ADMIN;

-- 2. Voir tous les admins avec leurs emails
PROMPT
PROMPT 2. Liste des admins:
SELECT 
    id,
    nom,
    prenom,
    email,
    role,
    CASE 
        WHEN mot_de_passe IS NULL THEN 'NULL (problème!)'
        WHEN LENGTH(mot_de_passe) = 0 THEN 'VIDE (problème!)'
        ELSE 'OK (' || LENGTH(mot_de_passe) || ' caractères)'
    END AS statut_mot_de_passe
FROM ADMIN
ORDER BY id;

-- 3. Vérifier la structure de la table
PROMPT
PROMPT 3. Structure de la table ADMIN:
SELECT 
    column_name,
    data_type,
    nullable
FROM user_tab_columns
WHERE table_name = 'ADMIN'
ORDER BY column_id;

-- 4. Tester la connexion avec les identifiants
PROMPT
PROMPT 4. Test de connexion (exemple avec le premier admin):
SELECT 
    id,
    nom || ' ' || prenom AS nom_complet,
    email,
    role,
    CASE 
        WHEN mot_de_passe = email THEN 'Mot de passe = email (par défaut)'
        ELSE 'Mot de passe personnalisé'
    END AS type_mot_de_passe
FROM ADMIN
WHERE ROWNUM = 1;

PROMPT
PROMPT ============================================
PROMPT IDENTIFIANTS POUR CONNEXION
PROMPT ============================================
PROMPT
PROMPT Pour se connecter, utilise:
PROMPT - Email: (voir colonne EMAIL ci-dessus)
PROMPT - Mot de passe: (généralement = email par défaut)
PROMPT

SELECT 
    'Email: ' || email || ' | Mot de passe: ' || COALESCE(mot_de_passe, email) AS identifiants
FROM ADMIN
ORDER BY id;

PROMPT
PROMPT ============================================
PROMPT FIN DE LA VÉRIFICATION
PROMPT ============================================

