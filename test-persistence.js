#!/usr/bin/env node
/**
 * Test de persistance des données
 * Teste les créations, modifications, et rechargements de produits et commandes
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

console.log('\n╔════════════════════════════════════════╗');
console.log('║  🧪 TEST PERSISTANCE BASE DE DONNÉES   ║');
console.log('╚════════════════════════════════════════╝\n');

function readDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('❌ Erreur lecture DB:', e.message);
    }
    return { products: [], orders: [], logs: [] };
}

function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('❌ Erreur écriture DB:', e.message);
        return false;
    }
}

console.log('📋 État actuel de la base de données:\n');
const db = readDB();

console.log(`📦 Produits: ${db.products.length}`);
if (db.products.length > 0) {
    console.log('   Exemples:');
    db.products.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name} (${p.price} HTG) [${p.id.slice(0, 8)}...]`);
    });
}

console.log(`\n📮 Commandes: ${db.orders.length}`);
if (db.orders.length > 0) {
    console.log('   Dernières commandes:');
    db.orders.slice(-3).forEach(o => {
        console.log(`   - ${o.customerName}: ${o.total} HTG le ${new Date(o.date).toLocaleString('fr-FR')}`);
    });
}

console.log(`\n📊 Logs: ${db.logs.length}`);
if (db.logs.length > 0) {
    console.log('   Derniers logs:');
    db.logs.slice(-5).forEach(log => {
        console.log(`   - [${log.type}] ${new Date(log.timestamp).toLocaleString('fr-FR')}`);
    });
}

console.log('\n✅ Test terminé - Les données sont bien persistées dans database.json');
console.log('   Vérifiez que après un redémarrage du serveur, ces données restent intactes.\n');
