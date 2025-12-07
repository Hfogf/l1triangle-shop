// Admin Dashboard v4 - SÉCURISÉ AVEC SESSION

console.log('✅ admin-dashboard-v2.js chargé');

// Configuration API
const API_URLs = [
    'http://localhost:3000/api',
    'http://172.29.192.1:3000/api'
];

// ==================== API CLIENT AVEC SESSION ====================

async function apiCall(endpoint, method = 'GET', body = null) {
    const sessionId = sessionStorage.getItem('admin_sessionId');

    if (!sessionId) {
        console.error('❌ Pas de session ID trouvée');
        window.location.href = '/admin-login-v2.html';
        throw new Error('Non authentifié - redirection vers login');
    }

    console.log('🔗 Tentative API:', endpoint, 'avec sessionId');

    for (let url of API_URLs) {
        try {
            const fullUrl = `${url}${endpoint}`;
            console.log('📡 Essai:', fullUrl);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(fullUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId  // ← Passer la session au serveur
                },
                body: body ? JSON.stringify(body) : null,
                mode: 'cors',
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (response.status === 401) {
                console.error('❌ Session expirée');
                sessionStorage.removeItem('admin_sessionId');
                window.location.href = '/admin-login-v2.html';
                throw new Error('Session expirée');
            }

            if (response.ok) {
                console.log('✅ Réponse OK de:', fullUrl);
                return await response.json();
            }

            console.log('⚠️ Statut non-OK:', response.status);
        } catch (e) {
            console.error(`❌ Erreur avec ${url}:`, e.message);
        }
    }

    throw new Error(`API échouée pour ${endpoint}`);
}

// ==================== AUTHENTIFICATION ====================

function logout() {
    try {
        sessionStorage.removeItem('admin_sessionId');
        window.location.href = '/admin-login-v2.html';
    } catch (e) {
        console.error('Erreur logout:', e);
        location.reload();
    }
}

function checkAuthentication() {
    const sessionId = sessionStorage.getItem('admin_sessionId');
    if (!sessionId) {
        console.log('🔒 Pas authentifié');
        window.location.href = '/admin-login-v2.html';
        return false;
    }
    return true;
}

function logout() {
    try {
        sessionStorage.removeItem('admin_sessionId');
        window.location.href = '/admin-login-v2.html';
    } catch (e) {
        console.error('Erreur logout:', e);
        location.reload();
    }
}

// ==================== DASHBOARD DISPLAY ====================

function showDashboard() {
    try {
        console.log('📊 Affichage du dashboard...');
        
        document.body.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #ff6b3d; color: white; padding: 10px 15px; border-radius: 6px; font-size: 12px; z-index: 1000;">
                ✅ Dashboard sécurisé
            </div>
            
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto; background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%); color: #e8e8e8; display: flex; flex-direction: column; min-height: 100vh; }
                
                .admin-container { 
                    display: flex; 
                    width: 100%; 
                    flex: 1;
                    position: relative;
                }
                
                /* SIDEBAR - DESKTOP ONLY */
                .sidebar { 
                    width: 160px;
                    min-width: 160px;
                    background: linear-gradient(180deg, rgba(20, 25, 40, 0.98) 0%, rgba(15, 20, 35, 0.98) 100%); 
                    border-right: 1px solid rgba(255, 107, 61, 0.15); 
                    padding: 15px 10px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 12px;
                    overflow-y: auto;
                    order: 1;
                }
                
                .sidebar h2 { font-size: 14px; color: #ff6b3d; margin-bottom: 2px; }
                .sidebar p { font-size: 9px; opacity: 0.8; }
                .sidebar-menu { display: flex; flex-direction: column; gap: 5px; flex: 1; }
                .menu-item { 
                    padding: 8px 8px; 
                    background: rgba(255, 107, 61, 0.08); 
                    border: 1.5px solid rgba(255, 107, 61, 0.15); 
                    color: rgba(255, 177, 151, 0.85); 
                    border-radius: 5px; 
                    cursor: pointer; 
                    font-size: 10px; 
                    font-weight: 500; 
                    transition: all 0.25s; 
                    text-align: center;
                }
                .menu-item:hover { background: rgba(255, 107, 61, 0.12); border-color: #ff6b3d; }
                .menu-item.active { background: rgba(255, 107, 61, 0.25); border-color: #ff6b3d; color: #ff9966; }
                .logout-btn { 
                    padding: 8px; 
                    background: rgba(255, 107, 61, 0.1); 
                    border: 1.5px solid rgba(255, 107, 61, 0.3); 
                    color: #ff9966; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    font-weight: 600; 
                    font-size: 10px; 
                    transition: all 0.3s;
                }
                .logout-btn:hover { background: #ff6b3d; color: #fff; }
                
                /* CONTENU PRINCIPAL */
                .main-content { 
                    flex: 1; 
                    overflow-y: auto; 
                    padding: 25px; 
                    background: linear-gradient(135deg, rgba(5, 6, 8, 0.5) 0%, rgba(15, 25, 40, 0.5) 100%); 
                    order: 2;
                }
                
                .content-header h1 { font-size: 24px; color: #ff6b3d; margin-bottom: 8px; font-weight: 600; }
                .content-header p { color: rgba(255, 177, 151, 0.65); font-size: 12px; }
                .section { display: none; animation: fadeIn 0.3s ease-out; }
                .section.active { display: block; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .section-card { background: linear-gradient(135deg, rgba(30, 40, 60, 0.6), rgba(20, 30, 50, 0.4)); border: 1px solid rgba(255, 107, 61, 0.12); border-radius: 10px; padding: 20px; margin-bottom: 20px; }
                h2 { font-size: 16px; color: #ff9966; margin-bottom: 15px; font-weight: 600; }
                h3 { font-size: 14px; color: #ffb197; margin: 15px 0 12px 0; }
                h4 { color: #ff9966; margin-bottom: 6px; font-size: 13px; }
                .form-group { margin-bottom: 14px; }
                label { display: block; margin-bottom: 5px; font-weight: 600; color: #ffb197; font-size: 11px; text-transform: uppercase; }
                input, textarea, select { width: 100%; padding: 10px 12px; border: 1px solid rgba(255, 107, 61, 0.2); background: rgba(255, 255, 255, 0.04); color: #e8e8e8; border-radius: 6px; font-size: 13px; font-family: inherit; }
                input:focus, textarea:focus, select:focus { outline: none; border-color: #ff6b3d; background: rgba(255, 107, 61, 0.08); }
                textarea { resize: vertical; min-height: 80px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                button { padding: 10px 18px; background: linear-gradient(135deg, #ff6b3d, rgba(255, 107, 61, 0.8)); border: none; color: #fff; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.3s; }
                button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255,107,61,0.4); }
                table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
                table th { background: rgba(255, 107, 61, 0.1); padding: 10px; color: #ff9966; font-weight: 600; }
                table td { padding: 10px; border-bottom: 1px solid rgba(255, 107, 61, 0.08); }
                .loading { color: #ff6b3d; font-weight: 600; }
                
                /* ============ MOBILE - NAV EN BAS ============ */
                @media(max-width: 768px) {
                    .admin-container {
                        flex-direction: column;
                        padding-bottom: 70px;
                    }
                    
                    .sidebar {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        height: 65px;
                        padding: 0;
                        border-right: none;
                        border-top: 1px solid rgba(255, 107, 61, 0.15);
                        flex-direction: row;
                        gap: 0;
                        z-index: 1000;
                        order: -1;
                    }
                    
                    .sidebar h2 {
                        display: none;
                    }
                    
                    .sidebar p {
                        display: none;
                    }
                    
                    .sidebar-menu {
                        flex-direction: row;
                        flex: 1;
                        gap: 0;
                        align-items: center;
                        justify-content: space-around;
                        padding: 0 5px;
                    }
                    
                    .menu-item {
                        flex: 1;
                        padding: 8px 5px;
                        margin: 0;
                        border: none;
                        background: transparent;
                        font-size: 11px;
                        border-radius: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 65px;
                        border-top: 3px solid transparent;
                        transition: all 0.2s;
                    }
                    
                    .menu-item:hover {
                        background: rgba(255, 107, 61, 0.1);
                        border-top-color: rgba(255, 107, 61, 0.3);
                    }
                    
                    .menu-item.active {
                        background: rgba(255, 107, 61, 0.15);
                        border-top-color: #ff6b3d;
                        color: #ff6b3d;
                    }
                    
                    .logout-btn {
                        display: none;
                    }
                    
                    .main-content {
                        padding: 15px;
                        order: 1;
                    }
                    
                    .content-header h1 { 
                        font-size: 18px; 
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .section-card {
                        padding: 12px;
                        margin-bottom: 12px;
                    }
                    
                    input, textarea, select {
                        font-size: 16px;
                        padding: 11px;
                    }
                    
                    button {
                        width: 100%;
                        padding: 12px;
                        font-size: 13px;
                        margin-top: 5px;
                    }
                    
                    label {
                        font-size: 11px;
                    }
                    
                    h2 {
                        font-size: 15px;
                    }
                    
                    table {
                        font-size: 10px;
                        overflow-x: auto;
                    }
                    
                    table th, table td {
                        padding: 6px;
                        font-size: 9px;
                    }
                }
                
                /* TABLETS */
                @media(min-width: 769px) and (max-width: 1024px) {
                    .sidebar {
                        width: 130px;
                    }
                    
                    .main-content {
                        padding: 18px;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                
                /* DESKTOP */
                @media(min-width: 1025px) {
                    .sidebar {
                        width: 160px;
                    }
                    
                    .main-content {
                        padding: 25px 35px;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            </style>
                .content-header h1 { font-size: 24px; color: #ff6b3d; margin-bottom: 8px; font-weight: 600; }
                .content-header p { color: rgba(255, 177, 151, 0.65); font-size: 12px; }
                .section { display: none; animation: fadeIn 0.3s ease-out; }
                .section.active { display: block; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .section-card { background: linear-gradient(135deg, rgba(30, 40, 60, 0.6), rgba(20, 30, 50, 0.4)); border: 1px solid rgba(255, 107, 61, 0.12); border-radius: 10px; padding: 20px; margin-bottom: 20px; }
                h2 { font-size: 16px; color: #ff9966; margin-bottom: 15px; font-weight: 600; border-bottom: 1px solid rgba(255, 107, 61, 0.1); padding-bottom: 10px; }
                h3 { font-size: 14px; color: #ffb197; margin: 15px 0 12px 0; font-weight: 600; }
                h4 { color: #ff9966; margin-bottom: 6px; font-size: 13px; font-weight: 600; }
                .form-group { margin-bottom: 14px; }
                label { display: block; margin-bottom: 5px; font-weight: 600; color: #ffb197; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; }
                input, textarea, select { width: 100%; padding: 10px 12px; border: 1px solid rgba(255, 107, 61, 0.2); background: rgba(255, 255, 255, 0.04); color: #e8e8e8; border-radius: 6px; font-size: 13px; font-family: inherit; }
                input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(255, 107, 61, 0.6); background: rgba(255, 107, 61, 0.08); }
                textarea { resize: vertical; min-height: 80px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                button { padding: 10px 18px; background: linear-gradient(135deg, #ff6b3d, rgba(255, 107, 61, 0.8)); border: none; color: #fff; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s; font-size: 12px; }
                button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255,107,61,0.4); }
                .btn-danger { background: linear-gradient(135deg, rgba(255, 50, 50, 0.7), rgba(255, 100, 100, 0.5)); }
                table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
                table th { background: rgba(255, 107, 61, 0.1); padding: 10px 12px; color: #ff9966; font-weight: 600; border-bottom: 1.5px solid rgba(255, 107, 61, 0.15); font-size: 11px; }
                table td { padding: 10px 12px; border-bottom: 1px solid rgba(255, 107, 61, 0.08); color: rgba(232, 232, 232, 0.9); font-size: 12px; }
                table tr:hover { background: rgba(255, 107, 61, 0.06); }
                .product-item { background: linear-gradient(135deg, rgba(255, 107, 61, 0.1), rgba(255, 107, 61, 0.05)); padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid #ff6b3d; border: 1px solid rgba(255, 107, 61, 0.15); }
                .loading { color: #ff6b3d; font-weight: 600; font-size: 12px; }

            </style>
            
            <div class="admin-container">
                <aside class="sidebar" id="sidebar">
                    <div>
                        <h2>▲ L1</h2>
                        <p>Admin</p>
                    </div>
                    
                    <nav class="sidebar-menu">
                        <button class="menu-item active" data-tab="products" onclick="switchTab('products')">🛍️ PRODUITS</button>
                        <button class="menu-item" data-tab="orders" onclick="switchTab('orders')">📦 COMMANDES</button>
                        <button class="menu-item" data-tab="logs" onclick="switchTab('logs')">📋 LOGS</button>
                    </nav>
                    
                    <button class="logout-btn" onclick="logout()">🚪 DÉCONNEXION</button>
                </aside>
                
                <main class="main-content">
                    <div class="content-header" style="margin-bottom: 32px;">
                        <h1>📊 DASHBOARD ADMIN</h1>
                        <p>Bienvenue dans votre espace d'administration L1TRIANGLE</p>
                    </div>
                    
                    <div id="products" class="section active"></div>
                    <div id="orders" class="section"></div>
                    <div id="logs" class="section"></div>
                </main>
            </div>
        `;
        
        // Attache les événements
        document.querySelectorAll('.menu-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                switchTab(tab);
            });
        });
        
        console.log('✅ Interface rendue');
        loadProductsAdmin();
        loadOrdersAdmin();
        loadLogsAdmin();
        
    } catch (e) {
        console.error('❌ Erreur showDashboard:', e);
        document.body.innerHTML = `<div style="padding: 40px; color: red; font-family: monospace;">❌ ERREUR CRITIQUE: ${e.message}<pre>${e.stack}</pre></div>`;
    }
}

function switchTab(tab) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
}

// ==================== API CLIENT ====================

async function apiCall(endpoint, method = 'GET', body = null) {
    // Déterminer les URLs à essayer
    let urls = [];
    
    // Toujours essayer localhost en premier (local development)
    urls.push('http://localhost:3000/api');
    
    // Si on n'est pas en local, essayer aussi les IPs
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        urls.push('http://172.29.192.1:3000/api');
        urls.push('http://10.115.107.126:3000/api');
    }
    
    console.log('🔗 Tentative API pour:', endpoint, 'URLs:', urls);
    
    for (let url of urls) {
        try {
            const fullUrl = `${url}${endpoint}`;
            console.log('📡 Essai:', fullUrl);
            
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(fullUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : null,
                mode: 'cors',
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (response.ok) {
                console.log('✅ Réponse OK de:', fullUrl);
                return await response.json();
            }
            console.log('⚠️ Statut non-OK:', response.status);
        } catch (e) {
            console.error(`❌ Erreur avec ${url}:`, e.message);
        }
    }
    throw new Error(`API échouée pour ${endpoint} - Vérifiez que le serveur est lancé sur http://localhost:3000`);
}

// ==================== PRODUITS ====================

async function loadProductsAdmin() {
    const el = document.getElementById('products');
    el.innerHTML = '<div class="section-card"><p class="loading">⏳ Chargement...</p></div>';
    
    try {
        const products = await apiCall('/products');
        el.innerHTML = `
            <div class="section-card">
                <h2>🛍️ GESTION DES PRODUITS</h2>
                <h3>➕ AJOUTER</h3>
                <form onsubmit="handleAddProduct(event)">
                    <div class="form-row">
                        <div class="form-group"><label>Nom *</label><input type="text" name="name" required></div>
                        <div class="form-group"><label>Catégorie *</label><select name="category" required><option>manettes</option><option>accessoires</option><option>moniteurs</option></select></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Prix ($) *</label><input type="number" name="price" step="0.01" required></div>
                        <div class="form-group"><label>Stock *</label><input type="number" name="stock" required></div>
                    </div>
                    <div class="form-group"><label>Description</label><textarea name="description"></textarea></div>
                    <button type="submit" style="width: 100%;">AJOUTER</button>
                </form>
            </div>
            
            <div class="section-card">
                <h3>📋 PRODUITS (${products.length})</h3>
                ${(products || []).map(p => `
                    <div class="product-item">
                        <h4>${p.name}</h4>
                        <p style="margin: 5px 0; color: rgba(255, 177, 151, 0.8); font-size: 12px;">Cat: ${p.category} | Prix: $${p.price} | Stock: ${p.stock}</p>
                        <button class="btn-danger" onclick="handleDeleteProduct('${p.id}')" style="margin-top: 10px;">SUPPRIMER</button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        el.innerHTML = `<div class="section-card" style="color: red;">❌ ${error.message}</div>`;
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const product = {
        name: data.get('name'),
        category: data.get('category'),
        price: parseFloat(data.get('price')),
        stock: parseInt(data.get('stock')),
        description: data.get('description'),
        image: 'https://via.placeholder.com/300x200?text=Produit'
    };
    
    try {
        await apiCall('/products', 'POST', product);
        alert('✅ Produit ajouté!');
        loadProductsAdmin();
    } catch (error) {
        alert(`❌ ${error.message}`);
    }
}

async function handleDeleteProduct(id) {
    if (!confirm('Êtes-vous sûr?')) return;
    try {
        await apiCall(`/products/${id}`, 'DELETE');
        alert('✅ Supprimé!');
        loadProductsAdmin();
    } catch (error) {
        alert(`❌ ${error.message}`);
    }
}

// ==================== COMMANDES ====================

async function loadOrdersAdmin() {
    const el = document.getElementById('orders');
    el.innerHTML = '<div class="section-card"><p class="loading">⏳ Chargement...</p></div>';
    
    try {
        const orders = await apiCall('/orders');
        el.innerHTML = `
            <div class="section-card">
                <h2>📦 COMMANDES (${(orders || []).length})</h2>
                <table>
                    <thead><tr><th>ID</th><th>Client</th><th>Total</th><th>Date</th></tr></thead>
                    <tbody>
                        ${(orders || []).map(o => `<tr><td>${o.id}</td><td>${o.customerName || 'Anonyme'}</td><td style="color: #6bff6b;">$${o.total?.toFixed(2) || '0'}</td><td>${new Date(o.date).toLocaleDateString()}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        el.innerHTML = `<div class="section-card" style="color: red;">❌ ${error.message}</div>`;
    }
}

// ==================== LOGS ====================

async function loadLogsAdmin() {
    const el = document.getElementById('logs');
    el.innerHTML = '<div class="section-card"><p class="loading">⏳ Chargement...</p></div>';
    
    try {
        const logs = await apiCall('/logs');
        el.innerHTML = `
            <div class="section-card">
                <h2>📋 LOGS (${(logs || []).length})</h2>
                <table>
                    <thead><tr><th>Type</th><th>Message</th><th>Date</th></tr></thead>
                    <tbody>
                        ${(logs || []).map(l => `<tr><td style="color: ${l.type === 'ERROR' ? '#ff6b6b' : '#6bff6b'};">${l.type}</td><td>${l.message}</td><td style="font-size: 12px;">${new Date(l.date).toLocaleString()}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        el.innerHTML = `<div class="section-card" style="color: red;">❌ ${error.message}</div>`;
    }
}

// ==================== NAVIGATION ====================

function switchTab(tabName) {
    // Masquer tous les tabs
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Enlever active de tous les boutons
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afficher le tab sélectionné
    const tabEl = document.getElementById(tabName);
    if (tabEl) {
        tabEl.classList.add('active');
    }
    
    // Ajouter active au bouton cliqué
    event.target.classList.add('active');
    
    // Charger les données
    if (tabName === 'products') loadProductsAdmin();
    else if (tabName === 'orders') loadOrdersAdmin();
    else if (tabName === 'logs') loadLogsAdmin();
}

// ==================== SIDEBAR MOBILE ====================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function closeSidebar() {
    // Sur mobile, pas besoin car nav en bas
}

// ==================== INIT ====================

console.log('✅ Script chargé, vérification auth...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - vérification');

    if (checkAuthentication()) {
        console.log('✅ Utilisateur authentifié');
        showDashboard();
    }
});