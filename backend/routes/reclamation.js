const express = require('express');
const router = express.Router();
const db = require('../db/oracle');

// Créer une nouvelle réclamation
router.post('/', async (req, res) => {
    try {
        const { etudiant_id, type_reclamation, titre, description } = req.body;
        
        if (!etudiant_id || !type_reclamation || !titre || !description) {
            return res.status(400).json({ error: 'Données manquantes' });
        }

        console.log('📝 Création de réclamation:', { etudiant_id, type_reclamation, titre, description: description.substring(0, 50) + '...' });

        // Utiliser INSERT direct avec RETURNING pour éviter les problèmes de CLOB dans la procédure
        const oracledb = require('oracledb');
        const sql = `
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
                :etudiant_id,
                :type_reclamation,
                :titre,
                :description,
                SYSDATE,
                'EN ATTENTE',
                calcul_priorite(:type_reclamation, 0)
            )
            RETURNING id INTO :reclamation_id
        `;
        
        const binds = {
            etudiant_id: parseInt(etudiant_id),
            type_reclamation: type_reclamation,
            titre: titre,
            description: description,
            reclamation_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };
        
        const result = await db.executeQuery(sql, binds, { autoCommit: true, returnResult: true });
        console.log('📊 Résultat de l\'insertion:', result);
        console.log('📊 outBinds:', result.outBinds);
        const reclamationId = result.outBinds?.reclamation_id?.[0] || binds.reclamation_id?.val;
        
        console.log('✅ Réclamation créée avec succès, ID:', reclamationId);

        res.status(201).json({ 
            message: 'Réclamation créée avec succès',
            reclamation_id: reclamationId
        });
    } catch (error) {
        console.error('❌ Erreur lors de la création de la réclamation:', error);
        console.error('❌ Détails de l\'erreur:', {
            message: error.message,
            code: error.errorNum,
            offset: error.offset
        });
        res.status(500).json({ 
            error: error.message || 'Erreur lors de la création de la réclamation',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Obtenir toutes les réclamations
router.get('/', async (req, res) => {
    try {
        const { statut, type, etudiant_id } = req.query;
        let sql = 'SELECT * FROM v_dashboard_admin WHERE 1=1';
        const binds = [];
        let bindIndex = 1;

        if (statut) {
            sql += ` AND statut = :${bindIndex}`;
            binds.push(statut);
            bindIndex++;
        }
        if (type) {
            sql += ` AND type_reclamation = :${bindIndex}`;
            binds.push(type);
            bindIndex++;
        }
        if (etudiant_id) {
            sql += ` AND reclamation_id IN (SELECT id FROM RECLAMATION WHERE etudiant_id = :${bindIndex})`;
            binds.push(etudiant_id);
            bindIndex++;
        }

        sql += ' ORDER BY jours_attente DESC NULLS LAST, date_creation DESC';
        
        const result = await db.executeQuery(sql, binds);
        
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
            admin_role: row.ADMIN_ROLE || row.admin_role,
            nb_traitements: row.NB_TRAITEMENTS || row.nb_traitements,
            jours_traitement: row.JOURS_TRAITEMENT || row.jours_traitement,
            jours_attente: row.JOURS_ATTENTE || row.jours_attente
        }));
        
        res.json(formattedResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtenir une réclamation par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT * FROM v_detail_reclamation 
            WHERE reclamation_id = :id
            ORDER BY traitement_id DESC NULLS LAST
        `;
        const result = await db.executeQuery(sql, [id]);
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Réclamation non trouvée' });
        }

        // Grouper les traitements
        const reclamation = {
            ...result[0],
            traitements: result
                .filter(r => r.traitement_id)
                .map(r => ({
                    id: r.traitement_id,
                    date_traitement: r.date_traitement,
                    commentaire: r.traitement_commentaire,
                    ancien_statut: r.ancien_statut,
                    nouveau_statut: r.nouveau_statut,
                    admin_nom: r.traitement_admin_nom
                }))
        };

        res.json(reclamation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mettre à jour le statut d'une réclamation
router.put('/:id/statut', async (req, res) => {
    console.log('📝 PUT /api/reclamations/:id/statut appelé');
    console.log('📋 Params:', req.params);
    console.log('📋 Body:', req.body);
    try {
        const { id } = req.params;
        const { admin_id, nouveau_statut, commentaire } = req.body;

        if (!id || id === 'undefined') {
            return res.status(400).json({ error: 'ID de réclamation manquant' });
        }

        if (!admin_id || !nouveau_statut) {
            return res.status(400).json({ error: 'Données manquantes: admin_id et nouveau_statut requis' });
        }

        const oracledb = require('oracledb');
        await db.executeProcedure('traiter_reclamation', {
            p_reclamation_id: { val: parseInt(id), type: oracledb.NUMBER },
            p_admin_id: { val: parseInt(admin_id), type: oracledb.NUMBER },
            p_nouveau_statut: { val: nouveau_statut },
            p_commentaire: { val: commentaire || null }
        });

        res.json({ message: 'Statut mis à jour avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Attribuer un responsable
router.put('/:id/responsable', async (req, res) => {
    console.log('👤 PUT /api/reclamations/:id/responsable appelé');
    console.log('📋 Params:', req.params);
    console.log('📋 Body:', req.body);
    try {
        const { id } = req.params;
        const { admin_id } = req.body;

        if (!id || id === 'undefined') {
            return res.status(400).json({ error: 'ID de réclamation manquant' });
        }

        if (!admin_id) {
            return res.status(400).json({ error: 'admin_id requis' });
        }

        const oracledb = require('oracledb');
        await db.executeProcedure('attribuer_responsable', {
            p_reclamation_id: { val: parseInt(id), type: oracledb.NUMBER },
            p_admin_id: { val: parseInt(admin_id), type: oracledb.NUMBER }
        });

        res.json({ message: 'Responsable attribué avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Modifier une réclamation (uniquement si EN ATTENTE)
router.put('/:id', async (req, res) => {
    console.log('📝 PUT /api/reclamations/:id appelé');
    try {
        const { id } = req.params;
        const { titre, description, type_reclamation } = req.body;
        const { etudiant_id } = req.body; // Vérifier que l'étudiant est le propriétaire

        // Vérifier que la réclamation existe et appartient à l'étudiant
        const checkSql = `
            SELECT statut, etudiant_id 
            FROM RECLAMATION 
            WHERE id = :id
        `;
        const checkResult = await db.executeQuery(checkSql, { id: parseInt(id) });

        if (!checkResult || checkResult.length === 0) {
            return res.status(404).json({ error: 'Réclamation non trouvée' });
        }

        const reclamation = checkResult[0];
        
        // Vérifier que la réclamation appartient à l'étudiant
        if (reclamation.ETUDIANT_ID !== parseInt(etudiant_id)) {
            return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette réclamation' });
        }

        // Vérifier que le statut est EN ATTENTE
        if (reclamation.STATUT !== 'EN ATTENTE') {
            return res.status(400).json({ error: 'Seules les réclamations en attente peuvent être modifiées' });
        }

        // Mettre à jour la réclamation
        const updateSql = `
            UPDATE RECLAMATION 
            SET titre = :titre,
                description = :description,
                type_reclamation = :type_reclamation
            WHERE id = :id
        `;
        
        await db.executeQuery(updateSql, {
            id: parseInt(id),
            titre,
            description,
            type_reclamation
        }, { autoCommit: true });

        console.log('✅ Réclamation modifiée avec succès');
        res.json({ message: 'Réclamation modifiée avec succès' });
    } catch (error) {
        console.error('❌ Erreur lors de la modification:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la modification de la réclamation' });
    }
});

// Annuler une réclamation (uniquement si EN ATTENTE)
router.delete('/:id', async (req, res) => {
    console.log('🗑️ DELETE /api/reclamations/:id appelé');
    console.log('📋 Params:', req.params);
    console.log('📋 Body:', req.body);
    try {
        const { id } = req.params;
        const { etudiant_id } = req.body; // Vérifier que l'étudiant est le propriétaire

        if (!etudiant_id) {
            return res.status(400).json({ error: 'etudiant_id requis dans le body' });
        }

        // Vérifier que la réclamation existe et appartient à l'étudiant
        const checkSql = `
            SELECT statut, etudiant_id, admin_assignee_id
            FROM RECLAMATION 
            WHERE id = :id
        `;
        const checkResult = await db.executeQuery(checkSql, { id: parseInt(id) });

        if (!checkResult || checkResult.length === 0) {
            return res.status(404).json({ error: 'Réclamation non trouvée' });
        }

        const reclamation = checkResult[0];
        console.log('📋 Réclamation trouvée:', {
            statut: reclamation.STATUT,
            etudiant_id: reclamation.ETUDIANT_ID,
            admin_assignee_id: reclamation.ADMIN_ASSIGNEE_ID
        });
        
        // Vérifier que la réclamation appartient à l'étudiant
        if (reclamation.ETUDIANT_ID !== parseInt(etudiant_id)) {
            return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à annuler cette réclamation' });
        }

        // Vérifier que le statut est EN ATTENTE
        if (reclamation.STATUT !== 'EN ATTENTE') {
            return res.status(400).json({ error: 'Seules les réclamations en attente peuvent être annulées' });
        }

        // Vérifier qu'un admin existe (pour le trigger)
        const adminCheckSql = `SELECT COUNT(*) as cnt FROM ADMIN WHERE id = 1`;
        const adminCheck = await db.executeQuery(adminCheckSql);
        const adminExists = adminCheck && adminCheck[0] && adminCheck[0].CNT > 0;
        
        if (!adminExists && !reclamation.ADMIN_ASSIGNEE_ID) {
            console.log('⚠️ Aucun admin trouvé, création d\'un admin par défaut...');
            // Créer un admin par défaut si nécessaire
            const createAdminSql = `
                INSERT INTO ADMIN (id, nom, prenom, email, role, date_creation)
                SELECT 1, 'Admin', 'Système', 'admin@iscae.edu', 'ADMINISTRATEUR', SYSDATE
                FROM DUAL
                WHERE NOT EXISTS (SELECT 1 FROM ADMIN WHERE id = 1)
            `;
            await db.executeQuery(createAdminSql, {}, { autoCommit: true });
        }

        // Supprimer la réclamation (ou changer le statut à FERMEE)
        // On va changer le statut à FERMEE plutôt que de supprimer pour garder l'historique
        const deleteSql = `
            UPDATE RECLAMATION 
            SET statut = 'FERMEE'
            WHERE id = :id
        `;
        
        console.log('🔄 Mise à jour du statut à FERMEE...');
        await db.executeQuery(deleteSql, { id: parseInt(id) }, { autoCommit: true });

        console.log('✅ Réclamation annulée avec succès');
        res.json({ message: 'Réclamation annulée avec succès' });
    } catch (error) {
        console.error('❌ Erreur lors de l\'annulation:', error);
        console.error('❌ Détails de l\'erreur:', {
            message: error.message,
            code: error.errorNum || error.code,
            stack: error.stack ? error.stack.split('\n').slice(0, 10).join('\n') : 'Pas de stack trace'
        });
        res.status(500).json({ 
            error: error.message || 'Erreur lors de l\'annulation de la réclamation',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;

