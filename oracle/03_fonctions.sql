-- ============================================
-- FONCTIONS PL/SQL - CALCULS ET STATISTIQUES
-- ============================================

-- ============================================
-- FONCTION 1: Calcul du temps moyen de résolution (en jours)
-- ============================================
CREATE OR REPLACE FUNCTION temps_moyen_resolution
RETURN NUMBER
IS
    v_temps_moyen NUMBER;
BEGIN
    SELECT AVG(
        t.date_traitement - r.date_creation
    )
    INTO v_temps_moyen
    FROM RECLAMATION r
    JOIN TRAITEMENT t ON r.id = t.reclamation_id
    WHERE r.statut IN ('RESOLUE', 'FERMEE')
    AND t.nouveau_statut IN ('RESOLUE', 'FERMEE');
    
    RETURN NVL(ROUND(v_temps_moyen, 2), 0);
END;
/

-- ============================================
-- FONCTION 2: Nombre de réclamations par type
-- ============================================
CREATE OR REPLACE FUNCTION nbr_reclamations_par_type(
    p_type VARCHAR2
)
RETURN NUMBER
IS
    v_nombre NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_nombre
    FROM RECLAMATION
    WHERE type_reclamation = p_type;
    
    RETURN NVL(v_nombre, 0);
END;
/

-- ============================================
-- FONCTION 3: Calcul de la priorité d'une réclamation
-- ============================================
CREATE OR REPLACE FUNCTION calcul_priorite(
    p_type_reclamation VARCHAR2,
    p_anciennete_jours NUMBER DEFAULT 0
)
RETURN VARCHAR2
IS
    v_priorite VARCHAR2(15);
BEGIN
    -- Base sur le type
    IF p_type_reclamation = 'ACADEMIQUE' THEN
        v_priorite := 'ELEVEE';
    ELSIF p_type_reclamation = 'TECHNIQUE' THEN
        v_priorite := 'MOYENNE';
    ELSE
        v_priorite := 'FAIBLE';
    END IF;
    
    -- Ajuster selon l'ancienneté
    IF p_anciennete_jours > 7 THEN
        IF v_priorite = 'FAIBLE' THEN
            v_priorite := 'MOYENNE';
        ELSIF v_priorite = 'MOYENNE' THEN
            v_priorite := 'ELEVEE';
        ELSE
            v_priorite := 'URGENTE';
        END IF;
    ELSIF p_anciennete_jours > 14 THEN
        v_priorite := 'URGENTE';
    END IF;
    
    RETURN v_priorite;
END;
/

-- ============================================
-- FONCTION 4: Nombre de réclamations non résolues
-- ============================================
CREATE OR REPLACE FUNCTION nbr_reclamations_non_resolues
RETURN NUMBER
IS
    v_nombre NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_nombre
    FROM RECLAMATION
    WHERE statut IN ('EN ATTENTE', 'EN COURS');
    
    RETURN NVL(v_nombre, 0);
END;
/

-- ============================================
-- FONCTION 5: Nombre de réclamations par statut
-- ============================================
CREATE OR REPLACE FUNCTION nbr_reclamations_par_statut(
    p_statut VARCHAR2
)
RETURN NUMBER
IS
    v_nombre NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_nombre
    FROM RECLAMATION
    WHERE statut = p_statut;
    
    RETURN NVL(v_nombre, 0);
END;
/

-- ============================================
-- FONCTION 6: Temps de traitement d'une réclamation spécifique (en jours)
-- ============================================
CREATE OR REPLACE FUNCTION temps_traitement_reclamation(
    p_reclamation_id NUMBER
)
RETURN NUMBER
IS
    v_temps NUMBER;
BEGIN
    SELECT 
        MAX(t.date_traitement) - r.date_creation
    INTO v_temps
    FROM RECLAMATION r
    JOIN TRAITEMENT t ON r.id = t.reclamation_id
    WHERE r.id = p_reclamation_id
    GROUP BY r.date_creation;
    
    RETURN NVL(ROUND(v_temps, 2), 0);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
END;
/

