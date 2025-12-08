# 🔌 API ENDPOINTS COMPLÈTE

## 📍 BASE URL
```
http://localhost:3000/api
```

---

## 📦 PRODUITS

### Lister tous les produits
```
GET /api/products
```
**Réponse:**
```json
[
  {
    "id": "uuid",
    "name": "Manette",
    "price": 50,
    "category": "manettes",
    "stock": 10,
    "description": "...",
    "image": "url",
    "createdAt": "2025-12-08T12:00:00.000Z"
  }
]
```

---

### Ajouter un produit (Admin)
```
POST /api/products
Headers: X-Session-Id: <sessionId>
Body: {
  "name": "Produit",
  "price": 50,
  "category": "manettes",
  "stock": 10,
  "description": "Description",
  "image": "url ou base64"
}
```

---

### Modifier un produit (Admin)
```
PUT /api/products/:id
Headers: X-Session-Id: <sessionId>
Body: {
  "name": "Nouveau nom",
  "price": 60,
  ...
}
```

---

### Supprimer un produit (Admin)
```
DELETE /api/products/:id
Headers: X-Session-Id: <sessionId>
```

---

## 📮 COMMANDES

### Lister toutes les commandes
```
GET /api/orders
```
**Réponse:**
```json
[
  {
    "id": "1733424000000",
    "customerName": "Jean Dupont",
    "customerPhone": "509...",
    "customerEmail": "jean@example.com",
    "items": [
      {
        "id": "product-uuid",
        "name": "Manette",
        "price": 50,
        "quantity": 2,
        "image": "url"
      }
    ],
    "total": 100,
    "date": "2025-12-08T12:00:00.000Z",
    "method": "whatsapp"
  }
]
```

---

### Créer une commande (Public)
```
POST /api/orders
Body: {
  "customerName": "Jean Dupont",
  "customerPhone": "509...",
  "customerEmail": "jean@example.com",
  "items": [
    {
      "id": "product-uuid",
      "name": "Manette",
      "price": 50,
      "quantity": 2,
      "image": "url"
    }
  ],
  "total": 100,
  "method": "whatsapp",
  "userAgent": "Mozilla/5.0...",
  "date": "2025-12-08T12:00:00.000Z"
}
```

---

## 📊 LOGS

### Lister tous les logs
```
GET /api/logs
```
**Réponse:**
```json
[
  {
    "id": "uuid",
    "type": "connection",
    "timestamp": "2025-12-08T12:00:00.000Z",
    "userAgent": "Mozilla/5.0...",
    "ip": "127.0.0.1",
    "page": "http://localhost:3000"
  }
]
```

---

### Enregistrer une connexion (Public)
```
POST /api/logs/connection
Body: {
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-12-08T12:00:00.000Z",
  "page": "http://localhost:3000"
}
```

---

## 🔐 AUTHENTIFICATION ADMIN

### Login
```
POST /api/admin/login
Body: {
  "code": "L1_TRIANGLE"
}
```
**Réponse:**
```json
{
  "success": true,
  "sessionId": "uuid-session-id"
}
```

**Utilisation:** Ajouter le header `X-Session-Id: <sessionId>` à chaque requête admin

---

### Vérifier authentification
```
GET /api/admin/check
Headers: X-Session-Id: <sessionId>
```
**Réponse:**
```json
{
  "authenticated": true
}
```

---

### Logout
```
POST /api/admin/logout
Headers: X-Session-Id: <sessionId>
```

---

## ✅ CODES D'ERREUR

| Code | Signification |
|------|---------------|
| 200 | ✅ Succès |
| 201 | ✅ Créé avec succès |
| 400 | ❌ Requête invalide |
| 401 | ❌ Non authentifié |
| 404 | ❌ Non trouvé |
| 500 | ❌ Erreur serveur |

---

## 🧪 EXEMPLES cURL

### Créer un produit
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: <sessionId>" \
  -d '{
    "name": "Manette Sans Fil",
    "price": 50,
    "category": "manettes",
    "stock": 10,
    "description": "Manette ergonomique",
    "image": "https://..."
  }'
```

### Récupérer les produits
```bash
curl http://localhost:3000/api/products
```

### Créer une commande
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Jean Dupont",
    "customerPhone": "509...",
    "customerEmail": "jean@example.com",
    "items": [
      {
        "id": "uuid",
        "name": "Manette",
        "price": 50,
        "quantity": 2
      }
    ],
    "total": 100,
    "method": "whatsapp"
  }'
```

---

## 🔗 ROUTES WEB (Frontend)

| URL | Fonction |
|-----|----------|
| `/` | Shop principal |
| `/index.html` | Shop (même) |
| `/admin-login-v2.html` | Login Admin |
| `/admin-dashboard-v2.html` | Dashboard Admin |
| `/admin-orders.html` | **NOUVEAU** - Historique commandes |

---

## 💾 PERSISTANCE

Toutes les données sont automatiquement sauvegardées dans `database.json`:

```json
{
  "products": [...],
  "orders": [...],
  "logs": [...]
}
```

Backup recommandé avant maintenance:
```bash
copy database.json database.json.backup
```

---

**Dernière mise à jour: 8 Décembre 2025**
