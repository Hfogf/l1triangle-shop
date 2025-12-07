// Simplement ouvrir la page admin et vérifier quelle erreur on voit
const http = require('http');

setTimeout(() => {
    http.get('http://localhost:3000/api/products', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('✅ GET /api/products - Status:', res.statusCode);
            console.log(data.substring(0, 500));
        });
    }).on('error', err => {
        console.error('❌ Connection error:', err.message);
        process.exit(1);
    });
}, 1000);
