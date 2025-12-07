// ==================== CONFIGURATION API ROBUSTE ====================

class APIClient {
    constructor() {
        // Toujours essayer localhost en premier
        this.baseUrls = [
            'http://localhost:3000/api',
            'http://172.29.192.1:3000/api',
            'http://10.115.107.126:3000/api'
        ];
        
        // Filtrer pour local dev seulement
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.log('🌐 Mode distant - essayer localhost en priorité');
        }
        
        this.timeout = 15000;
        this.retries = 5;
        this.currentIndex = 0;
    }

    async request(endpoint, options = {}) {
        const method = options.method || 'GET';
        const body = options.body ? JSON.stringify(options.body) : null;
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📡 [${method}] ${endpoint}`);
        console.log(`${'='.repeat(60)}`);

        let lastError = null;

        // Essayer chaque URL en rotation
        for (let urlAttempt = 0; urlAttempt < this.baseUrls.length; urlAttempt++) {
            const baseUrl = this.baseUrls[urlAttempt];

            // Essayer X fois pour chaque URL
            for (let attempt = 1; attempt <= this.retries; attempt++) {
                const fullUrl = `${baseUrl}${endpoint}`;
                
                try {
                    console.log(`\n⏳ Tentative ${attempt}/${this.retries} sur ${baseUrl}`);
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                    
                    const response = await fetch(fullUrl, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body,
                        mode: 'cors',
                        credentials: 'omit',
                        cache: 'no-store',
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    // Parser la réponse
                    let data = null;
                    const contentType = response.headers.get('content-type');
                    
                    if (contentType && contentType.includes('application/json')) {
                        data = await response.json();
                    } else {
                        data = await response.text();
                    }

                    console.log(`✅ SUCCÈS [${method}] ${endpoint}`);
                    console.log(`📦 Données reçues:`, data);
                    console.log(`${'='.repeat(60)}\n`);
                    
                    return data;

                } catch (error) {
                    lastError = error;
                    console.error(`❌ Tentative ${attempt} échouée: ${error.message}`);
                    
                    if (attempt < this.retries) {
                        const delay = 500 * attempt;
                        console.log(`⏰ Attente ${delay}ms avant nouvelle tentative...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
        }

        // Tous les essais ont échoué
        console.error(`${'='.repeat(60)}`);
        console.error(`🔴 ERREUR TOTALE: Impossible de se connecter après ${this.baseUrls.length * this.retries} tentatives`);
        console.error(`Dernière erreur: ${lastError?.message}`);
        console.error(`${'='.repeat(60)}\n`);
        
        throw new Error(`Connexion API échouée: ${lastError?.message}`);
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    }

    async put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Instance globale
window.apiClient = new APIClient();

// ==================== PRODUITS ====================

async function loadProducts() {
    try {
        console.log('🚀 Démarrage du chargement des produits');
        const products = await window.apiClient.get('/products');
        
        if (!Array.isArray(products)) {
            throw new Error('Format invalide: expected array');
        }

        console.log(`📊 ${products.length} produits reçus`);
        renderProducts(products);
        return products;

    } catch (error) {
        console.error('💥 ERREUR CRITIQUE:', error);
        showError(`Impossible de charger les produits: ${error.message}`);
        return [];
    }
}

function renderProducts(products) {
    if (!products || products.length === 0) {
        console.warn('⚠️ Aucun produit à afficher');
        return;
    }

    // Grouper par catégorie
    const grouped = {};
    products.forEach(p => {
        const cat = p.category || 'autres';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
    });

    console.log('📑 Catégories:', Object.keys(grouped));

    // Rendre chaque catégorie
    Object.entries(grouped).forEach(([category, items]) => {
        const section = document.getElementById(category);
        if (!section) return;

        const grid = section.querySelector('.product-grid');
        if (!grid) return;

        grid.innerHTML = items.map(p => `
            <article class="product-card"
                     data-id="${p.id}"
                     data-name="${encodeURIComponent(p.name)}"
                     data-price="${p.price}"
                     data-image="${encodeURIComponent(p.image || '')}">
                <img src="${p.image || 'https://via.placeholder.com/300x200?text=Produit'}" 
                     alt="${p.name}"
                     onerror="this.src='https://via.placeholder.com/300x200?text=Image'">
                <h3>${p.name}</h3>
                <p>${p.description || ''}</p>
                <div class="price">${parseFloat(p.price).toFixed(2)} $</div>
                <small style="opacity:.7;">Stock: ${p.stock || 'N/A'}</small>
                <button class="product-btn add-to-cart">Ajouter au panier</button>
            </article>
        `).join('');

        attachCartButtons();
    });

    console.log('✅ Interface produits mise à jour');
}

// ==================== PANIER ====================

// Variables globales panier
let cartCountEl = document.getElementById('cart-count');
let cartOverlay = document.getElementById('cart-overlay');
let cartItemsEl = document.getElementById('cart-items');
let cartTotalEl = document.getElementById('cart-total');

function attachCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.onclick = null; // Nettoyer les anciens événements
        btn.addEventListener('click', addToCartFromButton);
    });
}

function addToCartFromButton(e) {
    const card = e.target.closest('.product-card');
    const id = card.dataset.id;
    const name = decodeURIComponent(card.dataset.name);
    const price = parseFloat(card.dataset.price);
    const image = decodeURIComponent(card.dataset.image) || card.querySelector('img')?.src;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }

    // Sauvegarder dans localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCart();
    cartOverlay.classList.remove('hidden');
    console.log(`✅ Produit ajouté: ${name} (total: ${cart.length})`);
}

// Supprimer renderCart - remplacée par updateCart qui est définie plus bas

function attachCartControls() {
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
        btn.onclick = null;
        btn.addEventListener('click', () => {
            const item = cart.find(i => i.id === btn.dataset.id);
            if (item) item.quantity++;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        });
    });

    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
        btn.onclick = null;
        btn.addEventListener('click', () => {
            const item = cart.find(i => i.id === btn.dataset.id);
            if (item) {
                item.quantity--;
                if (item.quantity <= 0) {
                    cart.splice(cart.indexOf(item), 1);
                }
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.onclick = null;
        btn.addEventListener('click', () => {
            const idx = cart.findIndex(i => i.id === btn.dataset.id);
            if (idx !== -1) cart.splice(idx, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        });
    });
}

// ==================== COMMANDES ====================

async function submitOrder(method) {
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }

    const name = prompt('Votre nom:');
    if (!name) return;

    const order = {
        id: Date.now().toString(),
        customerName: name,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
        date: new Date().toISOString(),
        method: method
    };

    console.log('📝 Nouvelle commande:', order);

    try {
        await window.apiClient.post('/orders', order);
        console.log('✅ Commande sauvegardée');
        alert(`✅ Commande enregistrée!\nTotal: $ ${order.total.toFixed(2)}`);
        cart.length = 0;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    } catch (error) {
        console.error('⚠️ Commande non sauvegardée (hors ligne):', error);
        alert(`⚠️ Commande créée mais non sauvegardée\nTotal: $ ${order.total.toFixed(2)}`);
    }
}

// ==================== UI ====================

function showError(message) {
    const errorDiv = document.querySelector('.error-message') || (() => {
        const div = document.createElement('div');
        div.className = 'error-message';
        div.style.cssText = `
            background: #fee;
            border: 2px solid #f00;
            color: #f00;
            padding: 15px;
            margin: 10px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
        `;
        document.body.insertBefore(div, document.body.firstChild);
        return div;
    })();
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// ==================== INIT ====================

// Configuration contact
const CONTACT_CONFIG = {
    whatsapp: '50939945994', // Numéro WhatsApp (format international sans +)
    email: 'l1triangle@store.com', // Email de la boutique
    shopName: 'L1 TRIANGLE Store'
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Page chargée, initialisation');
    loadProducts();
    
    // Gérer l'ouverture/fermeture du panier
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            if (cartOverlay) {
                cartOverlay.classList.remove('hidden');
                updateCart(); // Mettre à jour le panier à l'ouverture
                console.log('🛒 Panier ouvert');
            }
        });
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartOverlay) {
                cartOverlay.classList.add('hidden');
                console.log('✕ Panier fermé');
            }
        });
    }
    
    // Fermer le panier en cliquant sur l'overlay
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                cartOverlay.classList.add('hidden');
                console.log('✕ Panier fermé (click overlay)');
            }
        });
    }
    
    // Gérer les boutons WhatsApp et Email
    setupCartActions();
});

// ==================== GESTION PANIER ====================

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCart() {
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartCountEl = document.getElementById('cart-count');
    
    if (!cartItemsEl) return;
    
    // Compter le total des articles
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl) cartCountEl.textContent = totalItems;
    
    // Si le panier est vide
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Votre panier est vide</p>';
        if (cartTotalEl) cartTotalEl.textContent = '0.00';
        if (cartCountEl) cartCountEl.textContent = '0';
        return;
    }
    
    // Calculer le total et le nombre d'articles
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);
    if (cartCountEl) cartCountEl.textContent = count;
    
    // Afficher les produits avec contrôles
    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image || 'https://via.placeholder.com/60'}" class="cart-item-img" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>$ ${item.price.toFixed(2)}</span>
            </div>
            <div class="qty-controls">
                <button class="qty-btn minus" data-id="${item.id}">-</button>
                <span class="qty">${item.quantity}</span>
                <button class="qty-btn plus" data-id="${item.id}">+</button>
            </div>
            <button class="remove-item" data-id="${item.id}">✕</button>
        </div>
    `).join('');
    
    // Réattacher les événements
    attachCartControls();
}

function addToCart(productId) {
    // Cette fonction sera implémentée pour ajouter au panier
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// ==================== WHATSAPP & EMAIL ====================

function setupCartActions() {
    const whatsappBtn = document.getElementById('cart-whatsapp');
    const emailBtn = document.getElementById('cart-email');
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', sendToWhatsApp);
    }
    
    if (emailBtn) {
        emailBtn.addEventListener('click', sendToEmail);
    }
}

function sendToWhatsApp() {
    if (cart.length === 0) {
        alert('⚠️ Votre panier est vide!');
        return;
    }
    
    // Créer le message
    let message = `🛍️ *Nouvelle commande ${CONTACT_CONFIG.shopName}*%0A%0A`;
    
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*%0A`;
        message += `   Quantité: ${item.quantity}%0A`;
        message += `   Prix unitaire: ${item.price}$%0A`;
        message += `   Sous-total: ${(item.price * item.quantity).toFixed(2)}$%0A%0A`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `💰 *TOTAL: ${total.toFixed(2)}$*%0A%0A`;
    message += `📱 Merci de votre commande!`;
    
    // Ouvrir WhatsApp
    const whatsappUrl = `https://wa.me/${CONTACT_CONFIG.whatsapp}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    console.log('📱 Commande envoyée sur WhatsApp');
}

function sendToEmail() {
    if (cart.length === 0) {
        alert('⚠️ Votre panier est vide!');
        return;
    }
    
    // Créer le sujet et le corps du message
    const subject = `Nouvelle commande - ${CONTACT_CONFIG.shopName}`;
    
    let body = `Bonjour,%0A%0AJe souhaite commander les articles suivants:%0A%0A`;
    
    cart.forEach((item, index) => {
        body += `${index + 1}. ${item.name}%0A`;
        body += `   Quantité: ${item.quantity}%0A`;
        body += `   Prix: ${item.price}$ x ${item.quantity} = ${(item.price * item.quantity).toFixed(2)}$%0A%0A`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    body += `TOTAL: ${total.toFixed(2)}$%0A%0A`;
    body += `Merci!`;
    
    // Ouvrir le client email
    const mailtoUrl = `mailto:${CONTACT_CONFIG.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    
    console.log('📧 Commande envoyée par email');
}
