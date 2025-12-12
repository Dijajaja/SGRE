const express = require('express');
const router = express.Router();
const db = require('../db/oracle');

// Obtenir les statistiques globales
router.get('/globales', async (req, res) => {
    try {
        const sql = 'SELECT * FROM v_statistiques_globales';
        const result = await db.executeQuery(sql);
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtenir les réclamations urgentes
router.get('/urgentes', async (req, res) => {
    try {
        const sql = 'SELECT * FROM v_reclamations_urgentes';
        const result = await db.executeQuery(sql);
        
        // Formater les résultats pour utiliser des noms en minuscules
        const formattedResult = (result || []).map(row => ({
            reclamation_id: row.RECLAMATION_ID || row.reclamation_id || row.ID || row.id,
            titre: row.TITRE || row.titre,
            type_reclamation: row.TYPE_RECLAMATION || row.type_reclamation,
            statut: row.STATUT || row.statut,
            priorite: row.PRIORITE || row.priorite,
            date_creation: row.DATE_CREATION || row.date_creation,
            etudiant_nom: row.ETUDIANT_NOM || row.etudiant_nom,
            filiere: row.FILIERE || row.filiere,
            etudiant_email: row.ETUDIANT_EMAIL || row.etudiant_email,
            admin_assignee: row.ADMIN_ASSIGNEE || row.admin_assignee,
            jours_attente: row.JOURS_ATTENTE || row.jours_attente,
            jours_traitement: row.JOURS_TRAITEMENT || row.jours_traitement
        }));
        
        res.json(formattedResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtenir les réclamations par filière
router.get('/par-filiere', async (req, res) => {
    try {
        const sql = 'SELECT * FROM v_reclamations_par_filiere';
        const result = await db.executeQuery(sql);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtenir le temps moyen de résolution
router.get('/temps-moyen', async (req, res) => {
    try {
        const sql = 'SELECT temps_moyen_resolution() AS temps_moyen FROM DUAL';
        const result = await db.executeQuery(sql);
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtenir le nombre de réclamations par type
router.get('/par-type', async (req, res) => {
    try {
        const sql = `
            SELECT 
                'ACADEMIQUE' AS type,
                nbr_reclamations_par_type('ACADEMIQUE') AS nombre
            FROM DUAL
            UNION ALL
            SELECT 
                'ADMINISTRATIF' AS type,
                nbr_reclamations_par_type('ADMINISTRATIF') AS nombre
            FROM DUAL
            UNION ALL
            SELECT 
                'TECHNIQUE' AS type,
                nbr_reclamations_par_type('TECHNIQUE') AS nombre
            FROM DUAL
        `;
        const result = await db.executeQuery(sql);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

