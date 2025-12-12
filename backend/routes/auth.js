const express = require('express');
const router = express.Router();
const db = require('../db/oracle');

// Authentification étudiant
router.post('/login/etudiant', async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;
        
        if (!email || !mot_de_passe) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const sql = 'SELECT * FROM ETUDIANT WHERE email = :email AND mot_de_passe = :mot_de_passe';
        const result = await db.executeQuery(sql, { email, mot_de_passe: mot_de_passe });
        
        if (result.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const row = result[0];
        const formattedResult = {
            id: row.ID || row.id,
            nom: row.NOM || row.nom,
            prenom: row.PRENOM || row.prenom,
            email: row.EMAIL || row.email,
            filiere: row.FILIERE || row.filiere,
            niveau: row.NIVEAU || row.niveau,
            date_inscription: row.DATE_INSCRIPTION || row.date_inscription
        };

        res.json({ user: formattedResult, type: 'etudiant' });
    } catch (error) {
        console.error('Erreur lors de l\'authentification étudiant:', error);
        res.status(500).json({ error: error.message });
    }
});

// Authentification admin
router.post('/login/admin', async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;
        
        if (!email || !mot_de_passe) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const sql = 'SELECT * FROM ADMIN WHERE email = :email AND mot_de_passe = :mot_de_passe';
        const result = await db.executeQuery(sql, { email, mot_de_passe: mot_de_passe });
        
        if (result.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const row = result[0];
        const formattedResult = {
            id: row.ID || row.id,
            nom: row.NOM || row.nom,
            prenom: row.PRENOM || row.prenom,
            email: row.EMAIL || row.email,
            role: row.ROLE || row.role,
            date_creation: row.DATE_CREATION || row.date_creation
        };

        res.json({ user: formattedResult, type: 'admin' });
    } catch (error) {
        console.error('Erreur lors de l\'authentification admin:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

