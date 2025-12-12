const express = require('express');
const router = express.Router();

console.log('📦 Chargement des routes...');

const etudiantRoutes = require('./etudiant');
const adminRoutes = require('./admin');
const reclamationRoutes = require('./reclamation');
const statistiquesRoutes = require('./statistiques');
const authRoutes = require('./auth');

console.log('Routes chargées avec succès');

// Route de test
router.get('/', (req, res) => {
    console.log('GET /api appelé');
    res.json({ 
        message: 'API SGRE - Routes disponibles',
        routes: [
            '/api/etudiants',
            '/api/admin',
            '/api/reclamations',
            '/api/statistiques',
            '/api/auth'
        ]
    });
});

router.use('/etudiants', etudiantRoutes);

// Vérifier que les routes sont bien enregistrées
console.log('Routes enregistrées dans le router:');
console.log('- GET /');
console.log('- POST /etudiants');
console.log('- GET /etudiants');

router.use('/admin', adminRoutes);
router.use('/reclamations', reclamationRoutes);
router.use('/statistiques', statistiquesRoutes);
router.use('/auth', authRoutes);

console.log('✅ Toutes les routes sont montées');

module.exports = router;

