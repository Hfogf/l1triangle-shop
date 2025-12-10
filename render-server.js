#!/usr/bin/env node
/**
 * SERVEUR RENDER ULTRA-RAPIDE
 * Lance un serveur Express qui sert les fichiers statiques + API
 * Démarrage optimisé pour Render.com
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ==================== MIDDLEWARE ====================
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ==================== SERVIR LES FICHIERS STATIQUES ====================
app.use(express.static(path.join(__dirname)));

// ==================== ROUTES API ====================

// Fichier de base de données
const DB_FILE = path.join(__dirname, 'database.json');

// Lire la DB
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

// Écrire la DB
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('❌ DB Write Error:', error.message);
        return false;
    }
}

// ==================== ROUTES ====================

// Health check
app.get('/api', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'L1 Triangle API',
        timestamp: new Date().toISOString()
    });
});

// Produits
app.get('/api/products', (req, res) => {
    const db = readDatabase();
    res.json(db.products || []);
});

app.post('/api/products', (req, res) => {
    const db = readDatabase();
    const newProduct = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
        addedByAdmin: true
    };
    db.products.push(newProduct);
    writeDatabase(db);
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const db = readDatabase();
    const idx = db.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db.products[idx] = { ...db.products[idx], ...req.body };
    writeDatabase(db);
    res.json(db.products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
    const db = readDatabase();
    const idx = db.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const deleted = db.products.splice(idx, 1)[0];
    writeDatabase(db);
    res.json({ deleted });
});

// Commandes
app.get('/api/orders', (req, res) => {
    const db = readDatabase();
    res.json(db.orders || []);
});

app.post('/api/orders', (req, res) => {
    const db = readDatabase();
    const newOrder = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    writeDatabase(db);
    res.status(201).json(newOrder);
});

app.delete('/api/orders/:id', (req, res) => {
    const db = readDatabase();
    const idx = db.orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const deleted = db.orders.splice(idx, 1)[0];
    writeDatabase(db);
    res.json({ deleted });
});

// Logs
app.get('/api/logs', (req, res) => {
    const db = readDatabase();
    res.json(db.logs || []);
});

app.post('/api/logs', (req, res) => {
    const db = readDatabase();
    const newLog = {
        id: Date.now().toString(),
        ...req.body,
        timestamp: new Date().toISOString()
    };
    db.logs.push(newLog);
    writeDatabase(db);
    res.status(201).json(newLog);
});

app.delete('/api/logs', (req, res) => {
    const db = readDatabase();
    db.logs = [];
    writeDatabase(db);
    res.json({ message: 'Logs cleared' });
});

// Logs connection
app.post('/api/logs/connection', (req, res) => {
    const db = readDatabase();
    const newLog = {
        id: Date.now().toString(),
        type: 'connection',
        ...req.body,
        timestamp: new Date().toISOString()
    };
    db.logs.push(newLog);
    writeDatabase(db);
    res.status(201).json(newLog);
});

// ==================== DÉMARRAGE ====================

const server = app.listen(PORT, () => {
    console.log('\n✅ L1TRIANGLE SERVER STARTED');
    console.log(`🌐 Port: ${PORT}`);
    console.log(`📍 URL: https://l1triangle-shop.onrender.com`);
    console.log(`🏪 Shop: https://l1triangle-shop.onrender.com/index.html`);
    console.log(`🔐 Admin: https://l1triangle-shop.onrender.com/admin-login-v2.html`);
    console.log('✅ Server ready\n');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use`);
        process.exit(1);
    }
    throw err;
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
