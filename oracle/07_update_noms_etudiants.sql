-- ============================================
-- MISE À JOUR DES DONNÉES AVEC DES NOMS D'ÉTUDIANTS
-- ============================================

-- Supprimer les anciennes données de test
DELETE FROM NOTIFICATION;
DELETE FROM TRAITEMENT;
DELETE FROM RECLAMATION;
DELETE FROM ETUDIANT;
DELETE FROM ADMIN;

-- Réinitialiser les séquences (Oracle ne supporte pas RESTART, on les recrée)
DROP SEQUENCE seq_etudiant;
DROP SEQUENCE seq_admin;
DROP SEQUENCE seq_reclamation;
DROP SEQUENCE seq_traitement;
DROP SEQUENCE seq_notification;

CREATE SEQUENCE seq_etudiant START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_admin START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_reclamation START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_traitement START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_notification START WITH 1 INCREMENT BY 1;

-- Insertion d'étudiants
INSERT INTO ETUDIANT (id, nom, prenom, email, filiere, niveau) VALUES
(seq_etudiant.NEXTVAL, 'Ahmed', 'Mohamed', 'mohamed.ahmed@iscae.mr', 'Informatique', 'L3');

INSERT INTO ETUDIANT (id, nom, prenom, email, filiere, niveau) VALUES
(seq_etudiant.NEXTVAL, 'Aicha', 'Fatima', 'aicha.fatima@iscae.mr', 'Mathématiques', 'M1');

INSERT INTO ETUDIANT (id, nom, prenom, email, filiere, niveau) VALUES
(seq_etudiant.NEXTVAL, 'Ousman', 'Sall', 'assa.salld@iscae.mr', 'Physique', 'L2');

-- Insertion d'admins
INSERT INTO ADMIN (id, nom, prenom, email, role) VALUES
(seq_admin.NEXTVAL, 'Diary', 'Ba', 'diary.ba@iscae.mr', 'ADMINISTRATEUR');

INSERT INTO ADMIN (id, nom, prenom, email, role) VALUES
(seq_admin.NEXTVAL, 'Aissata', 'Sall', 'sall.aissa@iscae.mr', 'RESPONSABLE');

INSERT INTO ADMIN (id, nom, prenom, email, role) VALUES
(seq_admin.NEXTVAL, 'Meimouna', 'Diallo', 'mei.diallo@iscae.mr', 'SUPPORT');

COMMIT;

-- Vérification
SELECT * FROM ETUDIANT;
SELECT * FROM ADMIN;

PROMPT Données mises à jour avec des noms d'étudiants !

