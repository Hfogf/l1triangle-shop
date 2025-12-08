#!/usr/bin/env node
/**
 * TEST: Ajouter des produits admin et non-admin
 * Puis redémarrer le serveur pour vérifier le nettoyage
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Lire la DB actuelle
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('\n📝 AJOUT DE PRODUITS DE TEST...\n');

// Produits ADMIN (doivent persister)
const adminProducts = [
    {
        id: 'admin-1',
        name: '🟢 PRODUIT ADMIN 1',
        category: 'admin-test',
        price: 100,
        stock: 10,
        description: 'Ajouté par ADMIN - DOIT PERSISTER',
        image: 'https://via.placeholder.com/300x200?text=Admin+1',
        createdAt: new Date().toISOString(),
        addedByAdmin: true  // ✅ ADMIN
    },
    {
        id: 'admin-2',
        name: '🟢 PRODUIT ADMIN 2',
        category: 'admin-test',
        price: 200,
        stock: 20,
        description: 'Ajouté par ADMIN - DOIT PERSISTER',
        image: 'https://via.placeholder.com/300x200?text=Admin+2',
        createdAt: new Date().toISOString(),
        addedByAdmin: true  // ✅ ADMIN
    }
];

// Produits NON-ADMIN (doivent être supprimés au redémarrage)
const nonAdminProducts = [
    {
        id: 'non-admin-1',
        name: '🔴 PRODUIT NON-ADMIN 1',
        category: 'test',
        price: 50,
        stock: 5,
        description: 'NON ADMIN - SERA SUPPRIMÉ AU REDÉMARRAGE',
        image: 'https://via.placeholder.com/300x200?text=NonAdmin+1',
        createdAt: new Date().toISOString()
        // ❌ addedByAdmin NOT SET (undefined)
    },
    {
        id: 'non-admin-2',
        name: '🔴 PRODUIT NON-ADMIN 2',
        category: 'test',
        price: 75,
        stock: 8,
        description: 'NON ADMIN - SERA SUPPRIMÉ AU REDÉMARRAGE',
        image: 'https://via.placeholder.com/300x200?text=NonAdmin+2',
        createdAt: new Date().toISOString()
        // ❌ addedByAdmin NOT SET (undefined)
    }
];

// Ajouter tous les produits
db.products = [
    ...adminProducts,
    ...nonAdminProducts
];

// Sauvegarder
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

console.log('✅ 2 produits ADMIN ajoutés (addedByAdmin: true)');
console.log('   - PRODUIT ADMIN 1');
console.log('   - PRODUIT ADMIN 2\n');

console.log('❌ 2 produits NON-ADMIN ajoutés (addedByAdmin: undefined)');
console.log('   - PRODUIT NON-ADMIN 1');
console.log('   - PRODUIT NON-ADMIN 2\n');

console.log('📊 Total: 4 produits dans database.json\n');

console.log('🔄 PROCHAINES ÉTAPES:');
console.log('   1. Démarrer le serveur: node api-server.js');
console.log('   2. Vérifier les logs de nettoyage');
console.log('   3. Arrêter le serveur (Ctrl+C)');
console.log('   4. Vérifier la DB: node test-persistence.js\n');

console.log('📋 RÉSULTAT ATTENDU:');
console.log('   ✅ 2 produits ADMIN restent');
console.log('   ❌ 2 produits NON-ADMIN sont supprimés\n');
