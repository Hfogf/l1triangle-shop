# 🎯 GUIDE COMPLET - PERSISTANCE DES DONNÉES

## ✅ PROBLÈME RÉSOLU

**Avant:** Les produits et commandes disparaissaient au redémarrage du serveur (stockés uniquement en mémoire).

**Après:** Tous les changements sont sauvegardés automatiquement dans `database.json` et persistent à travers les redémarrages.

---

## 📋 CE QUI EST MAINTENANT PERSISTÉ

### 1. **Produits** 📦
- ✅ Tous les produits ajoutés/modifiés par l'admin
- ✅ Résistent aux redémarrages du serveur
- ✅ Visibles immédiatement par tous les utilisateurs

### 2. **Commandes** 🛒
- ✅ Toutes les commandes sont enregistrées
- ✅ Sauvegardées avec date et heure exacte
- ✅ Incluent nom du client, téléphone, email
- ✅ Contiennent les détails complets (articles, quantités, prix total)

### 3. **Logs de connexion** 📊
- ✅ Chaque visite est enregistrée
- ✅ Date/heure de connexion sauvegardée
- ✅ Informations du navigateur/appareil du client
- ✅ Aide à suivre le trafic du site

---

## 🚀 DÉMARRAGE

### Sur Windows (PowerShell)

```powershell
# 1️⃣ Lancer le serveur API (port 3000)
node api-server.js

# 2️⃣ Dans une nouvelle fenêtre PowerShell, lancer le serveur frontend
node server.js

# 3️⃣ Accéder au site
# Shop: http://localhost:3000
# Admin: http://localhost:3000/admin-login-v2.html
```

### Ou avec le script fourni
```powershell
.\DEMARRER.ps1
```

---

## 🧪 TEST DE PERSISTANCE

### 1. Tester la sauvegarde des produits
```bash
# 1. Aller à l'admin: http://localhost:3000/admin-login-v2.html
# 2. Code: L1_TRIANGLE
# 3. Ajouter un nouveau produit
# 4. Arrêter le serveur (Ctrl+C)
# 5. Redémarrer: node api-server.js
# ✅ Le produit doit toujours être là!
```

### 2. Tester la sauvegarde des commandes
```bash
# 1. Accéder au shop: http://localhost:3000
# 2. Ajouter des produits au panier
# 3. Valider une commande (téléphone, email, etc.)
# 4. Arrêter et redémarrer le serveur
# 5. Vérifier dans l'admin que la commande existe toujours
```

### 3. Vérifier via le script
```bash
node test-persistence.js
```
Affiche l'état complet de la base de données (produits, commandes, logs).

---

## 📁 STRUCTURE DES DONNÉES

### `database.json`

```json
{
  "products": [
    {
      "id": "uuid...",
      "name": "Produit Test",
      "category": "manettes",
      "price": 50,
      "stock": 10,
      "description": "Description",
      "image": "url ou base64",
      "createdAt": "2025-12-08T12:00:00.000Z"
    }
  ],
  "orders": [
    {
      "id": "timestamp",
      "customerName": "Jean Dupont",
      "customerPhone": "509...",
      "customerEmail": "email@example.com",
      "items": [
        {
          "id": "product-uuid",
          "name": "Produit",
          "price": 50,
          "quantity": 2,
          "image": "url"
        }
      ],
      "total": 100,
      "date": "2025-12-08T12:00:00.000Z",
      "method": "whatsapp"
    }
  ],
  "logs": [
    {
      "id": "uuid",
      "type": "connection",
      "timestamp": "2025-12-08T12:00:00.000Z",
      "userAgent": "Mozilla/5.0...",
      "ip": "127.0.0.1",
      "page": "http://localhost:3000"
    }
  ]
}
```

---

## 🔧 API ENDPOINTS

### Produits
- `GET /api/products` - Lister tous les produits
- `POST /api/products` - Ajouter un produit (admin)
- `PUT /api/products/:id` - Modifier un produit (admin)
- `DELETE /api/products/:id` - Supprimer un produit (admin)

### Commandes
- `GET /api/orders` - Lister toutes les commandes
- `POST /api/orders` - Créer une nouvelle commande

### Logs
- `GET /api/logs` - Lister tous les logs
- `POST /api/logs/connection` - Enregistrer une connexion

---

## 🛡️ SÉCURITÉ

✅ **Droits d'accès:** Seul l'admin (code `L1_TRIANGLE`) peut modifier les produits  
✅ **Sessions:** Chaque admin a une session unique avec expiration 24h  
✅ **CORS:** Les requêtes cross-origin sont correctement gérées  
✅ **Validation:** Les données sont validées avant sauvegarde  

---

## 📞 COMMANDES AUTOMATIQUES

### WhatsApp
1. Client ajoute au panier
2. Clique "Envoyer par WhatsApp"
3. Message pré-rempli avec tous les détails
4. Commande sauvegardée en BDD
5. Horodatée et référencée

### Email
1. Client ajoute au panier
2. Clique "Envoyer par Email"
3. Email pré-rempli avec tous les détails
4. Commande sauvegardée en BDD
5. Horodatée et référencée

---

## 💾 SAUVEGARDE MANUELLE

Pour sauvegarder la base de données:
```bash
# Copier le fichier
Copy-Item database.json database.json.backup
```

---

## 🆘 DÉPANNAGE

### Les données ne persistent pas?
1. ✅ Vérifier que `api-server.js` est bien lancé
2. ✅ Vérifier que `database.json` existe et est accessible en écriture
3. ✅ Vérifier les permissions dossier: `chmod 755 .`
4. ✅ Consulter la console pour les erreurs "DB Write Error"

### Le serveur refuse les requêtes?
1. ✅ Vérifier le code d'admin: `L1_TRIANGLE`
2. ✅ Vérifier les headers: `X-Session-Id` pour les routes admin

---

## ✨ RÉSUMÉ

| Fonctionnalité | Avant | Après |
|---|---|---|
| Produits persistent | ❌ Non | ✅ Oui |
| Commandes sauvegardées | ❌ Non | ✅ Oui |
| Date/heure commandes | ❌ Non | ✅ Oui |
| Logs connexions | ❌ Non | ✅ Oui |
| Redémarrage serveur | ❌ Perte tout | ✅ Conserve tout |
| Admin peut voir historique | ❌ Non | ✅ Oui |

---

**Mise à jour: 8 Décembre 2025**
