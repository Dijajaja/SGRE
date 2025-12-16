const express = require('express');
const router = express.Router();
const db = require('../db/oracle');

console.log('📚 Route POST /etudiants enregistrée');

// Créer un nouvel étudiant (inscription)
router.post('/', async (req, res) => {
    console.log('📝 POST /api/etudiants appelé');
    try {
        const { nom, prenom, matricule, filiere, niveau, mot_de_passe } = req.body;
        
        console.log('📝 Données reçues pour inscription:', { nom, prenom, matricule, filiere, niveau, mot_de_passe: mot_de_passe ? '***' : 'non fourni' });
        
        if (!nom || !prenom || !matricule || !filiere || !niveau) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        // Valider le format du matricule (I suivi de 5 chiffres)
        const matriculeUpper = matricule.toUpperCase();
        if (!/^I[0-9]{5}$/.test(matriculeUpper)) {
            return res.status(400).json({ error: 'Le matricule doit être au format I suivi de 5 chiffres (ex: I12345)' });
        }

        // Générer l'email automatiquement au format i12345.etu@iscae.mr
        const email = `${matriculeUpper.toLowerCase()}.etu@iscae.mr`;
        console.log('📧 Email généré:', email);

        // Vérifier si l'email existe déjà
        console.log('🔍 Vérification de l\'existence de l\'email...');
        const checkEmail = await db.executeQuery(
            'SELECT COUNT(*) as COUNT FROM ETUDIANT WHERE email = :email',
            { email }
        );
        
        console.log('📊 Résultat de la vérification:', checkEmail);
        const countEmail = checkEmail[0]?.COUNT || checkEmail[0]?.count || 0;
        if (countEmail > 0) {
            return res.status(400).json({ error: 'Ce matricule est déjà utilisé' });
        }

        // Insérer le nouvel étudiant (le trigger générera automatiquement l'ID)
        let connection;
        const oracledb = require('oracledb');
        try {
            connection = await db.getConnection();
            console.log('✅ Connexion obtenue');
            
            // Utiliser le mot de passe fourni (obligatoire maintenant)
            if (!mot_de_passe || mot_de_passe.length < 4) {
                return res.status(400).json({ error: 'Le mot de passe est requis et doit contenir au moins 4 caractères' });
            }
            const password = mot_de_passe;
            console.log('💾 Insertion de l\'étudiant...');
            const insertResult = await connection.execute(
                `INSERT INTO ETUDIANT (nom, prenom, email, filiere, niveau, mot_de_passe, date_inscription)
                 VALUES (:nom, :prenom, :email, :filiere, :niveau, :password, SYSDATE)`,
                { nom, prenom, email, filiere, niveau, password },
                { autoCommit: true }
            );
            console.log('✅ Étudiant inséré, lignes affectées:', insertResult.rowsAffected);
            
            // Récupérer l'étudiant créé
            console.log('🔍 Récupération de l\'étudiant créé...');
            const result = await connection.execute(
                'SELECT * FROM ETUDIANT WHERE email = :email',
                { email },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            console.log('✅ Étudiant récupéré:', result.rows[0]);
            
            await connection.close();
        
            const row = result.rows[0];
            const formattedResult = {
                id: row.ID || row.id,
                nom: row.NOM || row.nom,
                prenom: row.PRENOM || row.prenom,
                email: row.EMAIL || row.email,
                filiere: row.FILIERE || row.filiere,
                niveau: row.NIVEAU || row.niveau,
                date_inscription: row.DATE_INSCRIPTION || row.date_inscription
            };
            
            res.status(201).json({ 
                message: 'Étudiant inscrit avec succès',
                etudiant: formattedResult
            });
        } catch (dbError) {
            console.error('❌ Erreur base de données:', dbError);
            if (connection) {
                try {
                    await connection.rollback();
                } catch (rollbackErr) {
                    console.error('❌ Erreur lors du rollback:', rollbackErr);
                }
                try {
                    await connection.close();
                } catch (closeErr) {
                    console.error('❌ Erreur lors de la fermeture:', closeErr);
                }
            }
            throw dbError;
        }
    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'étudiant:', error);
        console.error('Détails de l\'erreur:', {
            message: error.message,
            code: error.errorNum || error.code || error.errorCode,
            errorNum: error.errorNum,
            errorCode: error.errorCode,
            stack: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') : 'Pas de stack trace'
        });
        
        // Message d'erreur plus détaillé
        let errorMessage = 'Erreur lors de l\'inscription';
        if (error.message) {
            errorMessage = error.message;
        } else if (error.errorNum) {
            errorMessage = `Erreur Oracle ${error.errorNum}: ${error.message || 'Erreur inconnue'}`;
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? {
                code: error.errorNum || error.code || error.errorCode,
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
});

// Obtenir l'historique des réclamations d'un étudiant
// IMPORTANT: Cette route doit être définie AVANT router.get('/:id', ...)
router.get('/:id/reclamations', async (req, res) => {
    console.log('🚀 Route GET /:id/reclamations appelée');
    console.log('📋 Params:', req.params);
    try {
        const { id } = req.params;
        const studentId = parseInt(id);
        console.log('📋 Récupération des réclamations pour l\'étudiant:', studentId);
        
        // Requête simplifiée directement depuis RECLAMATION
        // Utiliser DBMS_LOB.SUBSTR pour gérer le CLOB description
        const sql = `
            SELECT 
                r.id AS reclamation_id,
                r.titre,
                r.type_reclamation,
                DBMS_LOB.SUBSTR(r.description, 4000, 1) AS description,
                r.date_creation,
                r.statut,
                r.priorite,
                r.etudiant_id,
                e.nom || ' ' || e.prenom AS etudiant_nom,
                e.filiere,
                a.nom || ' ' || a.prenom AS admin_nom,
                a.role AS admin_role
            FROM RECLAMATION r
            JOIN ETUDIANT e ON r.etudiant_id = e.id
            LEFT JOIN ADMIN a ON r.admin_assignee_id = a.id
            WHERE r.etudiant_id = :student_id
            ORDER BY r.date_creation DESC
        `;
        
        console.log('🔍 Exécution de la requête SQL avec id:', studentId);
        console.log('🔍 Type de studentId:', typeof studentId);
        const result = await db.executeQuery(sql, { student_id: studentId });
        console.log('✅ Réclamations trouvées:', result ? result.length : 0);
        if (result && result.length > 0) {
            console.log('📋 Première réclamation:', JSON.stringify(result[0], null, 2));
        }
        
        // Formater les résultats pour le frontend
        const formattedResult = (result || []).map(row => ({
            reclamation_id: row.RECLAMATION_ID || row.reclamation_id || row.ID || row.id,
            titre: row.TITRE || row.titre,
            type_reclamation: row.TYPE_RECLAMATION || row.type_reclamation,
            description: row.DESCRIPTION || row.description,
            date_creation: row.DATE_CREATION || row.date_creation,
            statut: row.STATUT || row.statut,
            priorite: row.PRIORITE || row.priorite,
            etudiant_id: row.ETUDIANT_ID || row.etudiant_id,
            etudiant_nom: row.ETUDIANT_NOM || row.etudiant_nom,
            filiere: row.FILIERE || row.filiere,
            admin_nom: row.ADMIN_NOM || row.admin_nom,
            admin_role: row.ADMIN_ROLE || row.admin_role
        }));
        
        console.log('📤 Envoi de', formattedResult.length, 'réclamations au frontend');
        res.json(formattedResult);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des réclamations:', error);
        console.error('❌ Détails de l\'erreur:', {
            message: error.message,
            code: error.errorNum || error.code,
            stack: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') : 'Pas de stack trace'
        });
        res.status(500).json({ 
            error: error.message || 'Erreur lors de la récupération des réclamations',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Obtenir les notifications d'un étudiant
router.get('/:id/notifications', async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = parseInt(id);
        console.log('🔔 Récupération des notifications pour l\'étudiant:', studentId);
        
        const sql = `
            SELECT * FROM NOTIFICATION 
            WHERE etudiant_id = :id 
            ORDER BY date_notification DESC
        `;
        const result = await db.executeQuery(sql, { id: studentId });
        console.log('✅ Notifications trouvées:', result ? result.length : 0);
        
        // Formater les résultats
        const formattedResult = (result || []).map(row => ({
            id: row.ID || row.id,
            etudiant_id: row.ETUDIANT_ID || row.etudiant_id,
            reclamation_id: row.RECLAMATION_ID || row.reclamation_id,
            message: row.MESSAGE || row.message,
            date_notification: row.DATE_NOTIFICATION || row.date_notification,
            lu: row.LU || row.lu
        }));
        
        res.json(formattedResult);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des notifications:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtenir un étudiant par ID
// IMPORTANT: Cette route doit être définie APRÈS les routes plus spécifiques comme /:id/reclamations
router.get('/:id', async (req, res) => {
    console.log('🚀 Route GET /:id appelée');
    console.log('📋 Path complet:', req.path);
    console.log('📋 Params:', req.params);
    
    // Si le path se termine par /reclamations ou /notifications, ne pas traiter ici
    if (req.path.includes('/reclamations') || req.path.includes('/notifications')) {
        console.log('⚠️ Path contient /reclamations ou /notifications, ignoré par cette route');
        return; // Ne pas traiter, laisser les routes spécifiques gérer
    }
    
    try {
        const { id } = req.params;
        console.log('📋 Récupération de l\'étudiant:', id);
        const sql = 'SELECT * FROM ETUDIANT WHERE id = :id';
        const result = await db.executeQuery(sql, { id: parseInt(id) });
        if (result.length === 0) {
            return res.status(404).json({ error: 'Étudiant non trouvé' });
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
        res.json(formattedResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtenir tous les étudiants
router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT * FROM ETUDIANT ORDER BY nom, prenom';
        const result = await db.executeQuery(sql);
        
        const formattedResult = result.map(row => ({
            id: row.ID || row.id,
            nom: row.NOM || row.nom,
            prenom: row.PRENOM || row.prenom,
            email: row.EMAIL || row.email,
            filiere: row.FILIERE || row.filiere,
            niveau: row.NIVEAU || row.niveau,
            date_inscription: row.DATE_INSCRIPTION || row.date_inscription
        }));
        res.json(formattedResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
