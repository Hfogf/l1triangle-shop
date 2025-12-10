#!/usr/bin/env node
/**
 * ANALYSEUR SYSTÈME - L1 TRIANGLE SHOP
 * Vérifie que tous les systèmes fonctionnent correctement
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║     📊 ANALYSE SYSTÈME - L1 TRIANGLE SHOP          ║');
console.log('╚════════════════════════════════════════════════════╝\n');

// ==================== VÉRIFICATIONS ====================

let results = {
    passed: 0,
    failed: 0,
    warnings: 0
};

function check(name, condition, details = '') {
    if (condition) {
        console.log(`✅ ${name}`);
        results.passed++;
    } else {
        console.log(`❌ ${name}`);
        if (details) console.log(`   └─ ${details}`);
        results.failed++;
    }
}

function warn(name, details = '') {
    console.log(`⚠️  ${name}`);
    if (details) console.log(`   └─ ${details}`);
    results.warnings++;
}

console.log('🔍 1. VÉRIFICATION DES FICHIERS\n');

// Fichiers essentiels
const essentialFiles = [
    'api-server.js',
    'render-server.js',
    'start.js',
    'panier-api-v2.js',
    'index.html',
    'admin-login-v2.html',
    'database.json',
    'package.json',
    'render.yaml',
    'style.css'
];

essentialFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    check(`Fichier ${file}`, exists);
});

console.log('\n🔍 2. VÉRIFICATION DE LA BASE DE DONNÉES\n');

try {
    const dbPath = path.join(__dirname, 'database.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    check('database.json lisible', true);
    check('Propriété products existe', Array.isArray(db.products), `${db.products?.length || 0} produits`);
    check('Propriété orders existe', Array.isArray(db.orders), `${db.orders?.length || 0} commandes`);
    check('Propriété logs existe', Array.isArray(db.logs), `${db.logs?.length || 0} logs`);
    
    if (db.products?.length > 0) {
        const hasAdmin = db.products.some(p => p.addedByAdmin === true);
        const noAdmin = db.products.filter(p => p.addedByAdmin !== true).length;
        check(`Produits admin présents`, hasAdmin, `${db.products.length} produits (${db.products.filter(p => p.addedByAdmin).length} admin)`);
        
        if (noAdmin > 0) {
            warn(`Produits sans flag admin`, `${noAdmin} produits n'ont pas le flag addedByAdmin`);
        }
    } else {
        warn('Base de données vide', 'Aucun produit ne sera affiché');
    }
    
} catch (error) {
    check('database.json valide', false, error.message);
}

console.log('\n🔍 3. VÉRIFICATION DES CONFIGURATIONS\n');

// Vérifier render.yaml
try {
    const renderYaml = fs.readFileSync(path.join(__dirname, 'render.yaml'), 'utf8');
    check('render.yaml existe', true);
    check('render.yaml contient startCommand', renderYaml.includes('startCommand'));
} catch (error) {
    check('render.yaml valide', false, error.message);
}

// Vérifier package.json
try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    check('package.json existe', true);
    check('Dependencies express', pkg.dependencies?.express ? true : false);
    check('Dependencies cors', pkg.dependencies?.cors ? true : false);
    check('Dependencies body-parser', pkg.dependencies?.['body-parser'] ? true : false);
    check('Script start défini', pkg.scripts?.start ? true : false);
} catch (error) {
    check('package.json valide', false, error.message);
}

console.log('\n🔍 4. VÉRIFICATION DU CODE CRITIQUE\n');

// Vérifier render-server.js
try {
    const content = fs.readFileSync(path.join(__dirname, 'render-server.js'), 'utf8');
    check('render-server.js existe', true);
    check('express.static pour fichiers statiques', content.includes('express.static'));
    check('Route GET /api', content.includes('app.get(\'/api\''));
    check('Route GET /api/products', content.includes('app.get(\'/api/products\''));
    check('Route POST /api/products', content.includes('app.post(\'/api/products\''));
    check('readDatabase()  function', content.includes('function readDatabase'));
    check('writeDatabase() function', content.includes('function writeDatabase'));
} catch (error) {
    check('render-server.js valide', false, error.message);
}

// Vérifier panier-api-v2.js
try {
    const content = fs.readFileSync(path.join(__dirname, 'panier-api-v2.js'), 'utf8');
    check('panier-api-v2.js existe', true);
    check('DEFAULT_PRODUCTS défini', content.includes('const DEFAULT_PRODUCTS'));
    check('renderProducts() function', content.includes('function renderProducts'));
    check('loadProducts() async', content.includes('async function loadProducts'));
} catch (error) {
    check('panier-api-v2.js valide', false, error.message);
}

// Vérifier api-server.js
try {
    const content = fs.readFileSync(path.join(__dirname, 'api-server.js'), 'utf8');
    check('api-server.js existe', true);
    const cleanFuncMatch = content.match(/function cleanNonAdminProducts\(data\)[^}]+\}/s);
    if (cleanFuncMatch) {
        const cleanFunc = cleanFuncMatch[0];
        const shouldNotFilter = !cleanFunc.includes('.filter(p => p.addedByAdmin');
        check('cleanNonAdminProducts() désactivé (ne supprime pas)', shouldNotFilter);
    }
} catch (error) {
    check('api-server.js valide', false, error.message);
}

console.log('\n🔍 5. VÉRIFICATION DES PAGES HTML\n');

// Vérifier index.html
try {
    const content = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    check('index.html existe', true);
    check('Inclut panier-api-v2.js', content.includes('panier-api-v2.js'));
    check('Contient product-grid', content.includes('product-grid'));
} catch (error) {
    check('index.html valide', false, error.message);
}

// Vérifier admin-login-v2.html
try {
    const content = fs.readFileSync(path.join(__dirname, 'admin-login-v2.html'), 'utf8');
    check('admin-login-v2.html existe', true);
} catch (error) {
    check('admin-login-v2.html valide', false, error.message);
}

console.log('\n🔍 6. VÉRIFICATION DE LA PERSISTANCE\n');

try {
    const dbPath = path.join(__dirname, 'database.json');
    const stats = fs.statSync(dbPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    check('database.json accessible', true, `${sizeKB} KB`);
    
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const totalItems = (db.products?.length || 0) + (db.orders?.length || 0) + (db.logs?.length || 0);
    check('Données persistantes', totalItems > 0, `${totalItems} éléments au total`);
} catch (error) {
    check('Persistance de données', false, error.message);
}

console.log('\n🔍 7. VÉRIFICATION RENDER\n');

try {
    const content = fs.readFileSync(path.join(__dirname, 'render.yaml'), 'utf8');
    check('render.yaml contient l\'URL', content.includes('l1triangle-shop'));
    check('render.yaml free plan', content.includes('plan: free'));
    check('render.yaml Node.js', content.includes('env: node'));
} catch (error) {
    check('Configuration Render', false, error.message);
}

// ==================== RÉSUMÉ ====================

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║                    📈 RÉSUMÉ                       ║');
console.log('╚════════════════════════════════════════════════════╝\n');

console.log(`✅ Vérifications réussies: ${results.passed}`);
console.log(`❌ Erreurs: ${results.failed}`);
console.log(`⚠️  Avertissements: ${results.warnings}`);

const total = results.passed + results.failed;
const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

console.log(`\n📊 Taux de réussite: ${percentage}%\n`);

// ==================== DIAGNOSTIQUE ====================

if (results.failed === 0 && results.warnings <= 2) {
    console.log('🎉 SYSTÈME OPÉRATIONNEL!');
    console.log('   • Tous les fichiers essentiels sont présents');
    console.log('   • La base de données fonctionne');
    console.log('   • Les routes API sont configurées');
    console.log('   • La persistance des données est activée\n');
} else if (results.failed <= 3) {
    console.log('⚠️  SYSTÈME PRESQUE OPÉRATIONNEL');
    console.log('   • Quelques fichiers peuvent manquer');
    console.log('   • Vérifiez les erreurs ci-dessus');
    console.log('   • La plupart des fonctionnalités devraient marcher\n');
} else {
    console.log('❌ SYSTÈME EN DIFFICULTÉ');
    console.log('   • Plusieurs problèmes détectés');
    console.log('   • Consultez les erreurs ci-dessus');
    console.log('   • Le déploiement peut échouer\n');
}

// ==================== RECOMMANDATIONS ====================

console.log('🚀 PROCHAINES ÉTAPES:\n');

if (results.failed > 0) {
    console.log('1. ❌ Résoudre les erreurs listées ci-dessus');
}

console.log('2. 📤 Redéployer sur Render:');
console.log('   git add .');
console.log('   git commit -m "Fix: Optimized Render server"');
console.log('   git push\n');

console.log('3. 🌐 Tester le site:');
console.log('   https://l1triangle-shop.onrender.com/index.html\n');

console.log('4. 🔐 Tester l\'admin:');
console.log('   https://l1triangle-shop.onrender.com/admin-login-v2.html\n');

console.log('5. ✅ Vérifier la persistance:');
console.log('   • Ajouter un produit via l\'admin');
console.log('   • Redémarrer le site');
console.log('   • Le produit doit toujours être là\n');

console.log('═══════════════════════════════════════════════════\n');
