const http = require('http');

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
    tests.push({ name, fn });
}

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, body: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('\n🧪 TESTS COMPLETS API L1TRIANGLE\n');
    console.log('='.repeat(60));

    test('✅ API Health Check', async () => {
        const res = await makeRequest('/api/health');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!res.body.status) throw new Error('No status field');
        console.log('  ✓ Serveur prêt');
    });

    test('✅ GET /api/products - Retourne un array', async () => {
        const res = await makeRequest('/api/products');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!Array.isArray(res.body)) throw new Error(`Expected array, got ${typeof res.body}`);
        console.log(`  ✓ ${res.body.length} produits trouvés`);
    });

    test('✅ POST /api/admin/login - Authentification', async () => {
        const res = await makeRequest('/api/admin/login', 'POST', { code: 'L1_TRIANGLE' });
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!res.body.sessionId) throw new Error('No sessionId in response');
        console.log(`  ✓ SessionId généré: ${res.body.sessionId.substring(0, 8)}...`);
        return { sessionId: res.body.sessionId };
    });

    // Stocker la session pour les tests suivants
    let sessionId = null;

    for (const t of tests) {
        try {
            const result = await t.fn();
            if (result && result.sessionId) sessionId = result.sessionId;
            console.log(`\n${t.name}`);
            passed++;
        } catch (error) {
            console.log(`\n${t.name}`);
            console.error(`  ✗ ${error.message}`);
            failed++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 RÉSULTATS: ${passed} ✅ ${failed} ❌\n`);

    if (failed === 0) {
        console.log('🎉 TOUS LES TESTS RÉUSSIS!\n');
    }
}

runTests().catch(console.error);
