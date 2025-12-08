#!/usr/bin/env node
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
    credentials: false
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));

// ==================== DATABASE ====================

const DB_FILE = path.join(__dirname, 'database.json');

function readDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('❌ DB Read Error:', error.message);
    }
    return { products: [], orders: [], logs: [] };
}

function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        console.log('💾 Database saved');
        return true;
    } catch (error) {
        console.error('❌ DB Write Error:', error.message);
        return false;
    }
}

// ==================== SESSIONS ====================

const ADMIN_CODE = 'L1_TRIANGLE';
const activeSessions = new Map();

function verifyAuth(req, res, next) {
    const sessionId = req.headers['x-session-id'] || req.body?.sessionId;
    if (!sessionId || !activeSessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    req.sessionId = sessionId;
    next();
}

// ==================== ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Authentification
app.post('/api/admin/login', (req, res) => {
    const { code } = req.body;
    if (code !== ADMIN_CODE) {
        return res.status(401).json({ error: 'Invalid code' });
    }
    const sessionId = uuidv4();
    activeSessions.set(sessionId, {
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    res.json({ success: true, sessionId });
});

app.post('/api/admin/logout', verifyAuth, (req, res) => {
    activeSessions.delete(req.sessionId);
    res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId || !activeSessions.has(sessionId)) {
        return res.json({ authenticated: false });
    }
    const session = activeSessions.get(sessionId);
    if (new Date() > session.expiresAt) {
        activeSessions.delete(sessionId);
        return res.json({ authenticated: false });
    }
    res.json({ authenticated: true });
});

// Produits
app.get('/api/products', (req, res) => {
    try {
        const db = readDatabase();
        const products = Array.isArray(db.products) ? db.products : [];
        console.log(`📦 GET /api/products: ${products.length} items`);
        res.json(products);
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/products', verifyAuth, (req, res) => {
    try {
        const db = readDatabase();
        const newProduct = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        db.products.push(newProduct);
        if (!writeDatabase(db)) throw new Error('Save failed');
        console.log(`✅ Product added: ${newProduct.name}`);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/products/:id', verifyAuth, (req, res) => {
    try {
        const db = readDatabase();
        const index = db.products.findIndex(p => p.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Not found' });
        db.products[index] = { ...db.products[index], ...req.body };
        if (!writeDatabase(db)) throw new Error('Save failed');
        res.json(db.products[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:id', verifyAuth, (req, res) => {
    try {
        const db = readDatabase();
        const product = db.products.find(p => p.id === req.params.id);
        if (!product) return res.status(404).json({ error: 'Not found' });
        db.products = db.products.filter(p => p.id !== req.params.id);
        if (!writeDatabase(db)) throw new Error('Save failed');
        res.json({ deleted: product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Commandes
app.get('/api/orders', (req, res) => {
    try {
        const db = readDatabase();
        res.json(db.orders || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', (req, res) => {
    try {
        const db = readDatabase();
        const newOrder = {
            id: uuidv4(),
            ...req.body,
            date: new Date().toISOString()
        };
        db.orders.push(newOrder);
        if (!writeDatabase(db)) throw new Error('Save failed');
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logs
app.get('/api/logs', (req, res) => {
    try {
        const db = readDatabase();
        res.json(db.logs || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Log une connexion utilisateur
app.post('/api/logs/connection', (req, res) => {
    try {
        const db = readDatabase();
        if (!db.logs) db.logs = [];
        const logEntry = {
            id: uuidv4(),
            type: 'connection',
            timestamp: new Date().toISOString(),
            userAgent: req.body.userAgent || req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress,
            ...req.body
        };
        db.logs.push(logEntry);
        if (!writeDatabase(db)) throw new Error('Save failed');
        console.log('📋 Connexion enregistrée:', logEntry.timestamp);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
});

// ==================== START ====================

console.log('\n🔄 Initializing...');
console.log(`📱 Starting on port ${PORT}...\n`);

const server = app.listen(PORT, '0.0.0.0', () => {
    const localIP = Object.values(os.networkInterfaces())
        .flat()
        .filter(iface => iface.family === 'IPv4' && !iface.internal)[0]?.address || 'localhost';
    
    console.log(`
╔════════════════════════════════════════╗
║   🚀 L1TRIANGLE API EN LIGNE          ║
║                                        ║
║   Port: ${PORT}                           ║
║   http://localhost:${PORT}               ║
║   http://${localIP}:${PORT}            ║
║                                        ║
║   Admin: http://${localIP}:${PORT}/admin-login-v2.html ║
║   Shop: http://${localIP}:${PORT}/index.html    ║
║                                        ║
╚════════════════════════════════════════╝
    `);
    console.log('✅ Server ready\n');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use`);
        process.exit(1);
    }
    throw err;
});
