-- ============================================
-- PROCÉDURES PL/SQL - TRAITEMENTS MÉTIER
-- ============================================

-- ============================================
-- PROCÉDURE 1: Traiter une réclamation
-- ============================================
CREATE OR REPLACE PROCEDURE traiter_reclamation(
    p_reclamation_id NUMBER,
    p_admin_id NUMBER,
    p_nouveau_statut VARCHAR2,
    p_commentaire CLOB DEFAULT NULL
)
IS
    v_ancien_statut VARCHAR2(20);
    v_etudiant_id NUMBER;
BEGIN
    -- Récupérer l'ancien statut et l'étudiant
    SELECT statut, etudiant_id
    INTO v_ancien_statut, v_etudiant_id
    FROM RECLAMATION
    WHERE id = p_reclamation_id;
    
    IF v_ancien_statut IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'Réclamation introuvable');
    END IF;
    
    -- Mettre à jour le statut de la réclamation
    UPDATE RECLAMATION
    SET statut = p_nouveau_statut,
        admin_assignee_id = p_admin_id
    WHERE id = p_reclamation_id;
    
    -- Le trigger trg_reclamation_statut_change créera automatiquement l'entrée dans TRAITEMENT
    -- Mais on peut aussi créer manuellement avec le commentaire personnalisé
    IF p_commentaire IS NOT NULL THEN
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
            p_reclamation_id,
            p_admin_id,
            SYSDATE,
            v_ancien_statut,
            p_nouveau_statut,
            p_commentaire
        );
    END IF;
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('Réclamation #' || p_reclamation_id || ' traitée avec succès');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- ============================================
-- PROCÉDURE 2: Attribuer un responsable à une réclamation
-- ============================================
CREATE OR REPLACE PROCEDURE attribuer_responsable(
    p_reclamation_id NUMBER,
    p_admin_id NUMBER
)
IS
    v_reclamation_exists NUMBER;
    v_admin_exists NUMBER;
BEGIN
    -- Vérifier que la réclamation existe
    SELECT COUNT(*)
    INTO v_reclamation_exists
    FROM RECLAMATION
    WHERE id = p_reclamation_id;
    
    IF v_reclamation_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Réclamation introuvable');
    END IF;
    
    -- Vérifier que l'admin existe
    SELECT COUNT(*)
    INTO v_admin_exists
    FROM ADMIN
    WHERE id = p_admin_id;
    
    IF v_admin_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Administrateur introuvable');
    END IF;
    
    -- Attribuer le responsable
    UPDATE RECLAMATION
    SET admin_assignee_id = p_admin_id
    WHERE id = p_reclamation_id;
    
    -- Si la réclamation est en attente, passer en cours
    UPDATE RECLAMATION
    SET statut = 'EN COURS'
    WHERE id = p_reclamation_id
    AND statut = 'EN ATTENTE';
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('Responsable attribué avec succès à la réclamation #' || p_reclamation_id);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- ============================================
-- PROCÉDURE 3: Créer une nouvelle réclamation
-- ============================================
CREATE OR REPLACE PROCEDURE creer_reclamation(
    p_etudiant_id NUMBER,
    p_type_reclamation VARCHAR2,
    p_titre VARCHAR2,
    p_description CLOB,
    p_reclamation_id OUT NUMBER
)
IS
    v_etudiant_exists NUMBER;
BEGIN
    -- Vérifier que l'étudiant existe
    SELECT COUNT(*)
    INTO v_etudiant_exists
    FROM ETUDIANT
    WHERE id = p_etudiant_id;
    
    IF v_etudiant_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20004, 'Étudiant introuvable');
    END IF;
    
    -- Insérer la réclamation
    INSERT INTO RECLAMATION (
        id,
        etudiant_id,
        type_reclamation,
        titre,
        description,
        date_creation,
        statut,
        priorite
    ) VALUES (
        seq_reclamation.NEXTVAL,
        p_etudiant_id,
        p_type_reclamation,
        p_titre,
        p_description,
        SYSDATE,
        'EN ATTENTE',
        calcul_priorite(p_type_reclamation, 0)
    )
    RETURNING id INTO p_reclamation_id;
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('Réclamation #' || p_reclamation_id || ' créée avec succès');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- ============================================
-- PROCÉDURE 4: Marquer une notification comme lue
-- ============================================
CREATE OR REPLACE PROCEDURE marquer_notification_lue(
    p_notification_id NUMBER
)
IS
BEGIN
    UPDATE NOTIFICATION
    SET lu = 1
    WHERE id = p_notification_id;
    
    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Notification introuvable');
    END IF;
    
    COMMIT;
END;
/

