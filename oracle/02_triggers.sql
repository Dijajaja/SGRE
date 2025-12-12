-- ============================================
-- TRIGGERS ORACLE - LOGIQUE MÉTIER AUTOMATIQUE
-- ============================================

-- ============================================
-- TRIGGER 1: Auto-increment pour ETUDIANT
-- ============================================
CREATE OR REPLACE TRIGGER trg_etudiant_id
BEFORE INSERT ON ETUDIANT
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := seq_etudiant.NEXTVAL;
    END IF;
END;
/

-- ============================================
-- TRIGGER 2: Auto-increment pour ADMIN
-- ============================================
CREATE OR REPLACE TRIGGER trg_admin_id
BEFORE INSERT ON ADMIN
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := seq_admin.NEXTVAL;
    END IF;
END;
/

-- ============================================
-- TRIGGER 3: Auto-increment pour RECLAMATION
-- ============================================
CREATE OR REPLACE TRIGGER trg_reclamation_id
BEFORE INSERT ON RECLAMATION
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := seq_reclamation.NEXTVAL;
    END IF;
END;
/

-- ============================================
-- TRIGGER 4: Auto-increment pour TRAITEMENT
-- ============================================
CREATE OR REPLACE TRIGGER trg_traitement_id
BEFORE INSERT ON TRAITEMENT
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := seq_traitement.NEXTVAL;
    END IF;
END;
/

-- ============================================
-- TRIGGER 5: Auto-increment pour NOTIFICATION
-- ============================================
CREATE OR REPLACE TRIGGER trg_notification_id
BEFORE INSERT ON NOTIFICATION
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := seq_notification.NEXTVAL;
    END IF;
END;
/

-- ============================================
-- TRIGGER 6: Création automatique d'un TRAITEMENT lors du changement de statut
-- ============================================
CREATE OR REPLACE TRIGGER trg_reclamation_statut_change
AFTER UPDATE OF statut ON RECLAMATION
FOR EACH ROW
WHEN (OLD.statut != NEW.statut)
DECLARE
    v_admin_id NUMBER;
    v_admin_exists NUMBER;
BEGIN
    -- Utiliser l'admin assigné ou trouver le premier admin disponible
    IF :NEW.admin_assignee_id IS NOT NULL THEN
        v_admin_id := :NEW.admin_assignee_id;
    ELSE
        -- Chercher le premier admin disponible
        SELECT MIN(id) INTO v_admin_id
        FROM ADMIN
        WHERE id IS NOT NULL;
        
        -- Si aucun admin n'existe, utiliser NULL (sera géré par la contrainte)
        IF v_admin_id IS NULL THEN
            -- Ne pas créer de traitement si aucun admin n'existe
            RETURN;
        END IF;
    END IF;
    
    -- Vérifier que l'admin existe
    SELECT COUNT(*) INTO v_admin_exists
    FROM ADMIN
    WHERE id = v_admin_id;
    
    IF v_admin_exists = 0 THEN
        -- Si l'admin n'existe pas, ne pas créer de traitement
        RETURN;
    END IF;
    
    -- Créer une entrée dans TRAITEMENT
    INSERT INTO TRAITEMENT (
        id,
        reclamation_id,
        admin_id,
        date_traitement,
        ancien_statut,
        nouveau_statut,
        commentaire
    ) VALUES (
        seq_traitement.NEXTVAL,
        :NEW.id,
        v_admin_id,
        SYSDATE,
        :OLD.statut,
        :NEW.statut,
        CASE 
            WHEN :NEW.statut = 'FERMEE' AND :OLD.statut = 'EN ATTENTE' THEN 'Réclamation annulée par l''étudiant'
            ELSE 'Changement de statut automatique'
        END
    );
    -- Note: Pas de COMMIT dans un trigger - Oracle gère automatiquement la transaction
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, ne pas bloquer la mise à jour du statut
        NULL;
END;
/

-- ============================================
-- TRIGGER 7: Création d'une NOTIFICATION quand une réclamation devient "RESOLUE"
-- ============================================
CREATE OR REPLACE TRIGGER trg_reclamation_resolue
AFTER UPDATE OF statut ON RECLAMATION
FOR EACH ROW
WHEN (NEW.statut = 'RESOLUE' AND OLD.statut != 'RESOLUE')
BEGIN
    -- Créer une notification pour l'étudiant
    INSERT INTO NOTIFICATION (
        id,
        etudiant_id,
        reclamation_id,
        message,
        date_notification,
        lu
    ) VALUES (
        seq_notification.NEXTVAL,
        :NEW.etudiant_id,
        :NEW.id,
        'Votre réclamation #' || :NEW.id || ' a été résolue. Merci de vérifier.',
        SYSDATE,
        0
    );
    -- Note: Pas de COMMIT dans un trigger - Oracle gère automatiquement la transaction
END;
/

-- ============================================
-- TRIGGER 8: Calcul automatique de la priorité lors de l'insertion
-- ============================================
CREATE OR REPLACE TRIGGER trg_calcul_priorite
BEFORE INSERT OR UPDATE ON RECLAMATION
FOR EACH ROW
DECLARE
    v_priorite VARCHAR2(15);
BEGIN
    -- Si la priorité n'est pas définie, la calculer automatiquement
    IF :NEW.priorite IS NULL OR :NEW.priorite = '' THEN
        -- Logique de calcul de priorité
        IF :NEW.type_reclamation = 'ACADEMIQUE' THEN
            v_priorite := 'ELEVEE';
        ELSIF :NEW.type_reclamation = 'TECHNIQUE' THEN
            v_priorite := 'MOYENNE';
        ELSE
            v_priorite := 'FAIBLE';
        END IF;
        
        :NEW.priorite := v_priorite;
    END IF;
END;
/

