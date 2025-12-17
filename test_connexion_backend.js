// Script de test pour vérifier la connexion Oracle depuis Node.js
// À exécuter avec : node test_connexion_backend.js

// Charger .env depuis différents emplacements possibles
const path = require('path');
const fs = require('fs');

const envPaths = [
    path.join(__dirname, 'backend', '.env'),
    path.join(__dirname, '.env'),
    './backend/.env',
    '.env'
];

let envLoaded = false;
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        console.log('✅ Fichier .env trouvé:', envPath);
        envLoaded = true;
        break;
    }
}

if (!envLoaded) {
    console.warn('⚠️ Aucun fichier .env trouvé, utilisation des valeurs par défaut');
}

const oracledb = require('oracledb');

// Configuration Oracle depuis .env
const dbConfig = {
    user: process.env.ORACLE_USER || 'SGRE_USER',
    password: process.env.ORACLE_PASSWORD || '12345',
    connectString: `${process.env.ORACLE_HOST || 'localhost'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_SERVICE || 'XEPDB1'}`
};

console.log('🔍 Configuration de connexion:');
console.log('  User:', dbConfig.user);
console.log('  Host:', process.env.ORACLE_HOST || 'localhost');
console.log('  Port:', process.env.ORACLE_PORT || '1521');
console.log('  Service:', process.env.ORACLE_SERVICE || 'XEPDB1');
console.log('  ConnectString:', dbConfig.connectString);
console.log('');

async function testConnection() {
    let connection;
    try {
        console.log('🔄 Tentative de connexion...');
        connection = await oracledb.getConnection(dbConfig);
        console.log('✅ Connexion réussie !');
        
        // Test 1: Vérifier les tables
        console.log('\n📊 Test 1: Vérification des tables...');
        const result1 = await connection.execute(
            `SELECT table_name FROM user_tables ORDER BY table_name`
        );
        console.log('  Tables trouvées:', result1.rows.map(r => r[0]).join(', '));
        
        // Test 2: Compter les réclamations
        console.log('\n📊 Test 2: Nombre de réclamations...');
        const result2 = await connection.execute(
            `SELECT COUNT(*) as count FROM RECLAMATION`
        );
        console.log('  Total réclamations:', result2.rows[0][0]);
        
        // Test 3: Vérifier la vue dashboard
        console.log('\n📊 Test 3: Vérification de la vue v_dashboard_admin...');
        const result3 = await connection.execute(
            `SELECT COUNT(*) as count FROM v_dashboard_admin`
        );
        console.log('  Réclamations dans la vue:', result3.rows[0][0]);
        
        // Test 4: Vérifier les admins
        console.log('\n📊 Test 4: Liste des admins...');
        const result4 = await connection.execute(
            `SELECT id, nom, prenom, email, role FROM ADMIN ORDER BY id`
        );
        result4.rows.forEach(row => {
            console.log(`  Admin #${row[0]}: ${row[1]} ${row[2]} (${row[4]})`);
        });
        
        console.log('\n✅ Tous les tests sont passés !');
        
    } catch (err) {
        console.error('❌ Erreur de connexion:', err.message);
        console.error('❌ Code d\'erreur:', err.errorNum);
        console.error('❌ Détails:', err);
        
        if (err.errorNum === 1017) {
            console.error('\n💡 Solution: Vérifiez le nom d\'utilisateur et le mot de passe dans backend/.env');
        } else if (err.errorNum === 12541) {
            console.error('\n💡 Solution: Vérifiez que le listener Oracle est démarré');
        } else if (err.errorNum === 12514) {
            console.error('\n💡 Solution: Vérifiez que le service XEPDB1 est démarré');
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('\n🔌 Connexion fermée');
            } catch (err) {
                console.error('❌ Erreur lors de la fermeture:', err.message);
            }
        }
    }
}

// Exécuter le test
testConnection();

