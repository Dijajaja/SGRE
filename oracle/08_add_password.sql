-- ============================================
-- AJOUT DES CHAMPS MOT DE PASSE
-- ============================================

-- Ajouter le champ mot_de_passe à la table ETUDIANT
ALTER TABLE ETUDIANT ADD mot_de_passe VARCHAR2(255);

-- Ajouter le champ mot_de_passe à la table ADMIN
ALTER TABLE ADMIN ADD mot_de_passe VARCHAR2(255);

-- Mettre à jour les mots de passe existants avec une valeur par défaut (à changer en production)
-- Pour les étudiants : email comme mot de passe par défaut
UPDATE ETUDIANT SET mot_de_passe = email WHERE mot_de_passe IS NULL;

-- Pour les admins : email comme mot de passe par défaut
UPDATE ADMIN SET mot_de_passe = email WHERE mot_de_passe IS NULL;

-- Rendre le champ obligatoire
ALTER TABLE ETUDIANT MODIFY mot_de_passe VARCHAR2(255) NOT NULL;
ALTER TABLE ADMIN MODIFY mot_de_passe VARCHAR2(255) NOT NULL;

COMMIT;

PROMPT Champs mot_de_passe ajoutés avec succès !

