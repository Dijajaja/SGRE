-- Script pour ajouter la colonne MOT_DE_PASSE à la table ADMIN
-- À exécuter si la colonne n'existe pas

PROMPT ============================================
PROMPT AJOUT DE LA COLONNE MOT_DE_PASSE À ADMIN
PROMPT ============================================
PROMPT

-- 1. Vérifier si la colonne existe déjà
PROMPT 1. Vérification de l'existence de la colonne...
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'La colonne existe déjà'
        ELSE 'La colonne n''existe pas - sera créée'
    END AS statut
FROM user_tab_columns
WHERE table_name = 'ADMIN' AND column_name = 'MOT_DE_PASSE';

-- 2. Ajouter la colonne si elle n'existe pas
PROMPT
PROMPT 2. Ajout de la colonne MOT_DE_PASSE...
ALTER TABLE ADMIN ADD mot_de_passe VARCHAR2(100);

PROMPT ✅ Colonne ajoutée avec succès !

-- 3. Mettre à jour les mots de passe (par défaut = email)
PROMPT
PROMPT 3. Mise à jour des mots de passe (par défaut = email)...
UPDATE ADMIN 
SET mot_de_passe = email 
WHERE mot_de_passe IS NULL;

COMMIT;

PROMPT ✅ Mots de passe mis à jour !

-- 4. Vérifier les admins et leurs mots de passe
PROMPT
PROMPT 4. Vérification des admins:
SELECT 
    id,
    nom || ' ' || prenom AS nom_complet,
    email,
    role,
    CASE 
        WHEN mot_de_passe IS NULL THEN '❌ NULL'
        WHEN mot_de_passe = '' THEN '❌ VIDE'
        ELSE '✅ ' || mot_de_passe
    END AS mot_de_passe
FROM ADMIN
ORDER BY id;

PROMPT
PROMPT ============================================
PROMPT ✅ TERMINÉ !
PROMPT ============================================
PROMPT
PROMPT Les identifiants pour se connecter sont:
PROMPT - Email: (voir colonne EMAIL ci-dessus)
PROMPT - Mot de passe: (généralement = email)
PROMPT

