const express = require('express');
const router = express.Router();
const db = require('../db/oracle');

// Obtenir tous les admins
router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT * FROM ADMIN ORDER BY nom, prenom';
        const result = await db.executeQuery(sql);
        
        const formattedResult = result.map(row => ({
            id: row.ID || row.id,
            nom: row.NOM || row.nom,
            prenom: row.PRENOM || row.prenom,
            email: row.EMAIL || row.email,
            role: row.ROLE || row.role,
            date_creation: row.DATE_CREATION || row.date_creation
        }));
        res.json(formattedResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtenir un admin par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'SELECT * FROM ADMIN WHERE id = :id';
        const result = await db.executeQuery(sql, [id]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Admin non trouvé' });
        }
        const row = result[0];
        // Convertir les noms de colonnes en minuscules
        const formattedResult = {
            id: row.ID || row.id,
            nom: row.NOM || row.nom,
            prenom: row.PRENOM || row.prenom,
            email: row.EMAIL || row.email,
            role: row.ROLE || row.role,
            date_creation: row.DATE_CREATION || row.date_creation
        };
        res.json(formattedResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtenir les réclamations assignées à un admin
router.get('/:id/reclamations', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT * FROM v_dashboard_admin 
            WHERE admin_id = :id
            ORDER BY date_creation DESC
        `;
        const result = await db.executeQuery(sql, [id]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

