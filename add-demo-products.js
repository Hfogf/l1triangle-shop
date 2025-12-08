// Script pour ajouter des produits de démonstration
// Exécuter avec: node add-demo-products.js

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = path.join(__dirname, 'database.json');

const demoProducts = [
    {
        name: "Manette Sans Fil Pro",
        category: "manettes",
        price: 5000.00,
        stock: 15,
        description: "Manette ergonomique sans fil avec batterie longue durée. Compatible PC, PS4, PS5.",
        image: "WhatsApp Image 2025-11-21 at 08.23.36_385ddb4c.jpg"
    },
    {
        name: "Moniteur Gaming 180Hz",
        category: "moniteurs",
        price: 33250.00,
        stock: 8,
        description: "Écran 24 pouces, 180Hz, 1ms, design borderless. Parfait pour le gaming compétitif.",
        image: "WhatsApp Image 2025-11-21 at 08.23.57_d33eb1a7.jpg"
    },
    {
        name: "Casque Gaming RGB",
        category: "accessoires",
        price: 1000.00,
        stock: 20,
        description: "Casque avec son surround 7.1, micro antibruit et éclairage RGB personnalisable.",
        image: "https://via.placeholder.com/300x200?text=Casque+RGB"
    },
    {
        name: "AirPods Pro 3",
        category: "airpods",
        price: 10500.00,
        stock: 12,
        description: "Les AirPods Pro 3 offrent une qualité audio améliorée avec réduction active du bruit, mode transparence, suivi de fréquence cardiaque, certification IP57, et une autonomie portée jusqu’à 10 heures Frandroid +2.",
        image: "WhatsApp Image 2025-11-21 at 08.26.41_2fa4b617.jpg"
    },
    {
        name: "Câble USB-C Rapide",
        category: "cables",
        price: 750.00,
        stock: 50,
        description: "Câble de charge rapide 3A, résistant, longueur 2m. Compatible tous appareils USB-C.",
        image: "https://via.placeholder.com/300x200?text=Cable+USB-C"
    },
    {
        name: "AIVONO Magic peach ice ",
        category: "vape",
        price: 2500.00,
        stock: 25,
        description: " 🔋 Rechargeable Type-c , 🧪 26ml likid , LED intelligent🔞 18+ sèlman.",
        image: "WhatsApp Image 2025-12-08 at 17.24.41_2f6acae2.jpg"
    }
];

async function addDemoProducts() {
    try {
        // Lire la base de données actuelle
        const data = await fs.readFile(DB_FILE, 'utf8');
        const db = JSON.parse(data);

        // Ajouter les produits de démo
        demoProducts.forEach(product => {
            db.products.push({
                id: uuidv4(),
                ...product,
                createdAt: new Date().toISOString(),
                addedByAdmin: true  // 🔑 Marquer comme produit admin pour persistance
            });
        });

        // Ajouter un log
        db.logs.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            action: 'INITIALISATION',
            details: `${demoProducts.length} produits de démonstration ajoutés`,
            admin: 'Système'
        });

        // Sauvegarder
        await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));

        console.log('✅ Produits de démonstration ajoutés avec succès!');
        console.log(`📦 ${demoProducts.length} produits ajoutés`);
        demoProducts.forEach(p => {
            console.log(`   - ${p.name} (${p.category}) - ${p.price} HTG`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

addDemoProducts();
