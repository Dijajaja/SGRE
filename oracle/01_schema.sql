-- ============================================
-- SYSTÈME DE GESTION DES RÉCLAMATIONS ÉTUDIANTES (SGRE)
-- Script de création du schéma Oracle
-- ============================================

-- Suppression des tables si elles existent (dans l'ordre inverse des dépendances)
DROP TABLE NOTIFICATION CASCADE CONSTRAINTS;
DROP TABLE TRAITEMENT CASCADE CONSTRAINTS;
DROP TABLE RECLAMATION CASCADE CONSTRAINTS;
DROP TABLE ADMIN CASCADE CONSTRAINTS;
DROP TABLE ETUDIANT CASCADE CONSTRAINTS;

-- Suppression des séquences
DROP SEQUENCE seq_etudiant;
DROP SEQUENCE seq_admin;
DROP SEQUENCE seq_reclamation;
DROP SEQUENCE seq_traitement;
DROP SEQUENCE seq_notification;

-- ============================================
-- CRÉATION DES TABLES
-- ============================================

-- Table ETUDIANT
CREATE TABLE ETUDIANT (
    id NUMBER PRIMARY KEY,
    nom VARCHAR2(100) NOT NULL,
    prenom VARCHAR2(100) NOT NULL,
    email VARCHAR2(150) NOT NULL UNIQUE,
    filiere VARCHAR2(50) NOT NULL,
    niveau VARCHAR2(20) NOT NULL,
    date_inscription DATE DEFAULT SYSDATE,
    CONSTRAINT chk_niveau CHECK (niveau IN ('L1', 'L2', 'L3', 'M1', 'M2'))
);

-- Table ADMIN
CREATE TABLE ADMIN (
    id NUMBER PRIMARY KEY,
    nom VARCHAR2(100) NOT NULL,
    prenom VARCHAR2(100) NOT NULL,
    email VARCHAR2(150) NOT NULL UNIQUE,
    role VARCHAR2(50) NOT NULL,
    date_creation DATE DEFAULT SYSDATE,
    CONSTRAINT chk_role CHECK (role IN ('ADMINISTRATEUR', 'RESPONSABLE', 'SUPPORT'))
);

-- Table RECLAMATION
CREATE TABLE RECLAMATION (
    id NUMBER PRIMARY KEY,
    etudiant_id NUMBER NOT NULL,
    type_reclamation VARCHAR2(30) NOT NULL,
    titre VARCHAR2(200) NOT NULL,
    description CLOB NOT NULL,
    date_creation DATE DEFAULT SYSDATE,
    statut VARCHAR2(20) NOT NULL,
    priorite VARCHAR2(15) NOT NULL,
    admin_assignee_id NUMBER,
    CONSTRAINT fk_reclamation_etudiant FOREIGN KEY (etudiant_id) REFERENCES ETUDIANT(id) ON DELETE CASCADE,
    CONSTRAINT fk_reclamation_admin FOREIGN KEY (admin_assignee_id) REFERENCES ADMIN(id) ON DELETE SET NULL,
    CONSTRAINT chk_type_reclamation CHECK (type_reclamation IN ('ACADEMIQUE', 'ADMINISTRATIF', 'TECHNIQUE')),
    CONSTRAINT chk_statut CHECK (statut IN ('EN ATTENTE', 'EN COURS', 'RESOLUE', 'FERMEE')),
    CONSTRAINT chk_priorite CHECK (priorite IN ('FAIBLE', 'MOYENNE', 'ELEVEE', 'URGENTE'))
);

-- Table TRAITEMENT
CREATE TABLE TRAITEMENT (
    id NUMBER PRIMARY KEY,
    reclamation_id NUMBER NOT NULL,
    admin_id NUMBER NOT NULL,
    date_traitement DATE DEFAULT SYSDATE,
    commentaire CLOB,
    ancien_statut VARCHAR2(20),
    nouveau_statut VARCHAR2(20) NOT NULL,
    CONSTRAINT fk_traitement_reclamation FOREIGN KEY (reclamation_id) REFERENCES RECLAMATION(id) ON DELETE CASCADE,
    CONSTRAINT fk_traitement_admin FOREIGN KEY (admin_id) REFERENCES ADMIN(id) ON DELETE CASCADE,
    CONSTRAINT chk_nouveau_statut CHECK (nouveau_statut IN ('EN ATTENTE', 'EN COURS', 'RESOLUE', 'FERMEE'))
);

-- Table NOTIFICATION
CREATE TABLE NOTIFICATION (
    id NUMBER PRIMARY KEY,
    etudiant_id NUMBER NOT NULL,
    reclamation_id NUMBER NOT NULL,
    message VARCHAR2(500) NOT NULL,
    date_notification DATE DEFAULT SYSDATE,
    lu NUMBER(1) DEFAULT 0,
    CONSTRAINT fk_notification_etudiant FOREIGN KEY (etudiant_id) REFERENCES ETUDIANT(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_reclamation FOREIGN KEY (reclamation_id) REFERENCES RECLAMATION(id) ON DELETE CASCADE,
    CONSTRAINT chk_lu CHECK (lu IN (0, 1))
);

-- ============================================
-- CRÉATION DES SÉQUENCES
-- ============================================

CREATE SEQUENCE seq_etudiant START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_admin START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_reclamation START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_traitement START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_notification START WITH 1 INCREMENT BY 1;

-- ============================================
-- CRÉATION DES INDEX
-- ============================================

CREATE INDEX idx_reclamation_etudiant ON RECLAMATION(etudiant_id);
CREATE INDEX idx_reclamation_statut ON RECLAMATION(statut);
CREATE INDEX idx_reclamation_type ON RECLAMATION(type_reclamation);
CREATE INDEX idx_traitement_reclamation ON TRAITEMENT(reclamation_id);
CREATE INDEX idx_notification_etudiant ON NOTIFICATION(etudiant_id);

-- ============================================
-- DONNÉES DE TEST
-- ============================================

-- Insertion d'étudiants de test
INSERT INTO ETUDIANT (id, nom, prenom, email, filiere, niveau) VALUES
(seq_etudiant.NEXTVAL, 'Ahmed', 'Mohamed', 'mohamed.ahmed@iscae.mr', 'Informatique', 'L3');
INSERT INTO ETUDIANT (id, nom, prenom, email, filiere, niveau) VALUES
(seq_etudiant.NEXTVAL, 'Aicha', 'Fatima', 'aicha.fatima@iscae.mr', 'Mathématiques', 'M1');
INSERT INTO ETUDIANT (id, nom, prenom, email, filiere, niveau) VALUES
(seq_etudiant.NEXTVAL, 'Ousman', 'Sall', 'assa.salld@iscae.mr', 'Physique', 'L2');

-- Insertion d'admins de test
INSERT INTO ADMIN (id, nom, prenom, email, role) VALUES
(seq_admin.NEXTVAL, 'Diary', 'Ba', 'diary.ba@iscae.mr', 'ADMINISTRATEUR');
INSERT INTO ADMIN (id, nom, prenom, email, role) VALUES
(seq_admin.NEXTVAL, 'Aissata', 'Sall', 'sall.aissa@iscae.mr', 'RESPONSABLE');
INSERT INTO ADMIN (id, nom, prenom, email, role) VALUES
(seq_admin.NEXTVAL, 'Meimouna', 'Diallo', 'mei.diallo@iscae.mr', 'SUPPORT');

COMMIT;

