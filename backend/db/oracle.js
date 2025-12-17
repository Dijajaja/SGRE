const oracledb = require('oracledb');
require('dotenv').config();

// Configuration Oracle
const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`
};

// Pool de connexions
let pool;

// Initialiser le pool de connexions
async function initialize() {
    try {
        pool = await oracledb.createPool({
            ...dbConfig,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1,
            poolTimeout: 60
        });
        console.log(' Pool de connexions Oracle créé avec succès');
    } catch (err) {
        console.error(' Erreur lors de la création du pool Oracle:', err);
        throw err;
    }
}

// Obtenir une connexion du pool
async function getConnection() {
    try {
        return await pool.getConnection();
    } catch (err) {
        console.error('❌ Erreur lors de l\'obtention de la connexion:', err);
        throw err;
    }
}

// Exécuter une requête
async function executeQuery(sql, binds = {}, options = {}) {
    let connection;
    try {
        connection = await getConnection();
        
        // Si binds est un objet (pour les requêtes avec RETURNING ou binds nommés), utiliser execute avec bindVars
        if (typeof binds === 'object' && !Array.isArray(binds)) {
            // Si l'objet a des clés, utiliser les binds nommés
            if (Object.keys(binds).length > 0) {
                const result = await connection.execute(
                    sql,
                    binds,
                    {
                        outFormat: oracledb.OUT_FORMAT_OBJECT,
                        autoCommit: options.autoCommit || false,
                        ...options
                    }
                );
                
                // Si autoCommit est activé, commit manuellement
                if (options.autoCommit) {
                    await connection.commit();
                }
                
                // Retourner result si c'est pour RETURNING, sinon result.rows
                return options.returnResult ? result : result.rows;
            } else {
                // Objet vide, exécuter sans binds (tableau vide)
                const result = await connection.execute(
                    sql,
                    [],
                    {
                        outFormat: oracledb.OUT_FORMAT_OBJECT,
                        ...options
                    }
                );
                return result.rows;
            }
        } else {
            // Tableau de paramètres
            const result = await connection.execute(
                sql,
                binds || [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                    ...options
                }
            );
            return result.rows;
        }
    } catch (err) {
        console.error('❌ Erreur lors de l\'exécution de la requête:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('❌ Erreur lors de la fermeture de la connexion:', err);
            }
        }
    }
}

// Exécuter une procédure
async function executeProcedure(procedureName, params = {}) {
    let connection;
    try {
        connection = await getConnection();
        
        // Construire la chaîne de paramètres (sans OUT dans la chaîne SQL)
        const paramNames = Object.keys(params);
        const paramPlaceholders = paramNames.map(name => `:${name}`).join(', ');
        
        const sql = `BEGIN ${procedureName}(${paramPlaceholders}); END;`;
        
        const bindVars = {};
        paramNames.forEach(name => {
            const param = params[name];
            let bindType = param.type;
            
            // Si pas de type spécifié, déterminer automatiquement
            if (!bindType) {
                if (param.out) {
                    bindType = oracledb.NUMBER; // Par défaut pour les OUT
                } else if (typeof param.val === 'number') {
                    bindType = oracledb.NUMBER;
                } else if (param.val && param.val.length > 4000) {
                    bindType = oracledb.STRING; // Pour les longs textes, utiliser STRING au lieu de CLOB
                } else {
                    bindType = oracledb.STRING;
                }
            }
            
            bindVars[name] = {
                val: param.val,
                dir: param.out ? oracledb.BIND_OUT : oracledb.BIND_IN,
                type: bindType,
                maxSize: bindType === oracledb.STRING && !param.out ? 32767 : undefined
            };
        });
        
        console.log('🔍 Exécution de la procédure:', procedureName);
        console.log('🔍 SQL:', sql);
        console.log('🔍 BindVars:', Object.keys(bindVars).map(k => ({ 
            name: k, 
            dir: bindVars[k].dir === oracledb.BIND_OUT ? 'OUT' : 'IN',
            type: bindVars[k].type === oracledb.NUMBER ? 'NUMBER' : 'STRING',
            val: typeof bindVars[k].val === 'string' ? bindVars[k].val.substring(0, 50) + '...' : bindVars[k].val
        })));
        
        const result = await connection.execute(sql, bindVars, {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });
        await connection.commit();
        
        // Extraire les valeurs OUT
        const outParams = {};
        paramNames.forEach(name => {
            if (params[name].out) {
                outParams[name] = bindVars[name].val;
                console.log('📤 Paramètre OUT', name, '=', bindVars[name].val);
            }
        });
        
        return outParams;
    } catch (err) {
        console.error('❌ Erreur lors de l\'exécution de la procédure:', err);
        console.error('❌ Code d\'erreur Oracle:', err.errorNum);
        console.error('❌ Message:', err.message);
        if (connection) {
            await connection.rollback();
        }
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('❌ Erreur lors de la fermeture de la connexion:', err);
            }
        }
    }
}

// Fermer le pool
async function close() {
    try {
        await pool.close();
        console.log('✅ Pool de connexions Oracle fermé');
    } catch (err) {
        console.error('❌ Erreur lors de la fermeture du pool:', err);
    }
}

module.exports = {
    initialize,
    executeQuery,
    executeProcedure,
    close,
    getConnection
};

