const express = require('express');
const router = express.Router();
const db = require('../db/oracle');

// Obtenir les statistiques globales
router.get('/globales', async (req, res) => {
    try {
        console.log('📊 Requête statistiques globales reçue');
        const sql = 'SELECT * FROM v_statistiques_globales';
        console.log('📊 Exécution SQL:', sql);
        
        const result = await db.executeQuery(sql);
        console.log('📊 Résultat brut Oracle:', result);
        console.log('📊 Nombre de lignes:', result ? result.length : 0);
        
        if (!result || result.length === 0) {
            console.warn('⚠️ Aucune donnée retournée par la vue, utilisation des valeurs par défaut');
            // Retourner des valeurs par défaut si aucune donnée
            return res.json({
                total_reclamations: 0,
                en_attente: 0,
                en_cours: 0,
                resolues: 0,
                fermees: 0,
                academiques: 0,
                administratives: 0,
                techniques: 0,
                temps_moyen_jours: 0,
                notifications_non_lues: 0
            });
        }
        
        // Formater les résultats pour utiliser des noms en minuscules
        const stats = result[0];
        console.log('📊 Première ligne brute:', stats);
        console.log('📊 Clés disponibles:', Object.keys(stats));
        console.log('📊 Valeurs brutes importantes:', {
            TOTAL_RECLAMATIONS: stats.TOTAL_RECLAMATIONS,
            EN_ATTENTE: stats.EN_ATTENTE,
            EN_COURS: stats.EN_COURS,
            RESOLUES: stats.RESOLUES,
            TEMPS_MOYEN_JOURS: stats.TEMPS_MOYEN_JOURS,
            'Type TOTAL_RECLAMATIONS': typeof stats.TOTAL_RECLAMATIONS,
            'Type TEMPS_MOYEN_JOURS': typeof stats.TEMPS_MOYEN_JOURS
        });
        
        // Fonction helper pour convertir en nombre
        const toNumber = (value) => {
            if (value === null || value === undefined) return 0;
            // Gérer les cas où Oracle retourne des strings avec virgule (format français)
            if (typeof value === 'string') {
                value = value.replace(',', '.');
            }
            const num = Number(value);
            return isNaN(num) ? 0 : num;
        };
        
        // Oracle retourne les colonnes en MAJUSCULES avec outFormat: OUT_FORMAT_OBJECT
        const formattedStats = {
            total_reclamations: toNumber(stats.TOTAL_RECLAMATIONS),
            en_attente: toNumber(stats.EN_ATTENTE),
            en_cours: toNumber(stats.EN_COURS),
            resolues: toNumber(stats.RESOLUES),
            fermees: toNumber(stats.FERMEES),
            academiques: toNumber(stats.ACADEMIQUES),
            administratives: toNumber(stats.ADMINISTRATIVES),
            techniques: toNumber(stats.TECHNIQUES),
            temps_moyen_jours: toNumber(stats.TEMPS_MOYEN_JOURS),
            notifications_non_lues: toNumber(stats.NOTIFICATIONS_NON_LUES)
        };
        
        console.log('📊 Statistiques après conversion:', formattedStats);
        
        console.log('📊 Statistiques formatées:', formattedStats);
        res.json(formattedStats);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des statistiques:', error);
        console.error('❌ Message:', error.message);
        console.error('❌ Stack:', error.stack);
        
        // Retourner des valeurs par défaut en cas d'erreur
        res.status(500).json({ 
            error: error.message,
            // Retourner aussi des valeurs par défaut pour que le frontend puisse afficher quelque chose
            total_reclamations: 0,
            en_attente: 0,
            en_cours: 0,
            resolues: 0,
            fermees: 0,
            academiques: 0,
            administratives: 0,
            techniques: 0,
            temps_moyen_jours: 0,
            notifications_non_lues: 0
        });
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

