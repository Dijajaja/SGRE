const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db/oracle');

console.log('🔧 Chargement du module routes...');
let routes;
try {
    routes = require('./routes');
    console.log('✅ Module routes chargé avec succès');
} catch (error) {
    console.error('❌ Erreur lors du chargement des routes:', error);
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de logging pour déboguer
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Route de test (avant /api)
app.get('/', (req, res) => {
    res.json({ message: 'API SGRE - Système de Gestion des Réclamations Étudiantes' });
});

// Routes - IMPORTANT: Doit être après les middlewares mais avant le 404
console.log('🔗 Montage des routes sur /api...');
console.log('Type de routes:', typeof routes);
console.log('Routes:', routes);
if (routes && typeof routes === 'function') {
    app.use('/api', routes);
    console.log('✅ Routes montées sur /api');
} else {
    console.error('❌ Erreur: routes n\'est pas un router valide');
    console.error('Routes:', routes);
}

// Handler 404 pour les routes non trouvées (doit être en dernier)
app.use((req, res, next) => {
    console.error(`❌ Route non trouvée: ${req.method} ${req.path}`);
    res.status(404).json({ 
        error: 'Route non trouvée',
        method: req.method,
        path: req.path,
        availableRoutes: [
            'GET /',
            'GET /api',
            'POST /api/etudiants',
            'GET /api/etudiants',
            'POST /api/auth/login/etudiant',
            'POST /api/auth/login/admin'
        ]
    });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(500).json({ 
        error: 'Erreur serveur', 
        message: err.message 
    });
});

// Initialiser la base de données et démarrer le serveur
async function startServer() {
    try {
        await db.initialize();
        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`📍 Testez l'API sur: http://localhost:${PORT}/api`);
            console.log(`📍 Routes disponibles:`);
            console.log(`   - POST http://localhost:${PORT}/api/etudiants (inscription)`);
            console.log(`   - POST http://localhost:${PORT}/api/auth/login/etudiant`);
            console.log(`   - POST http://localhost:${PORT}/api/auth/login/admin`);
        });
    } catch (error) {
        console.error('❌ Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
}

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
    console.log('\n⏹️  Arrêt du serveur...');
    await db.close();
    process.exit(0);
});

startServer();

