# ✅ CHECKLIST PRE-DEPLOIEMENT

**Persistance des Données - 8 Décembre 2025**

---

## 🔧 CONFIGURATION DU SERVEUR

- [ ] Node.js installé (`node --version`)
- [ ] npm installé (`npm --version`)
- [ ] Dépendances installées (`npm install`)
- [ ] Port 3000 disponible
- [ ] Permissions d'écriture sur le dossier (pour database.json)

---

## 📦 FICHIERS ESSENTIELS

- [ ] `api-server.js` - Serveur backend
- [ ] `panier-api-v2.js` - Logique panier frontend
- [ ] `database.json` - Base de données
- [ ] `index.html` - Shop client
- [ ] `admin-login-v2.html` - Login admin
- [ ] `admin-dashboard-v2.html` - Dashboard admin
- [ ] `admin-orders.html` - **NOUVEAU** Historique commandes

---

## 🚀 TEST DE DÉMARRAGE

### Démarrer le serveur
```bash
node api-server.js
```

- [ ] Serveur démarre sans erreur
- [ ] Message "✅ Server ready"
- [ ] Port 3000 visible

### Accès au shop
```bash
http://localhost:3000/
```

- [ ] Page se charge correctement
- [ ] Produits affichés
- [ ] Images chargent
- [ ] Panier fonctionne

### Admin login
```bash
http://localhost:3000/admin-login-v2.html
Code: L1_TRIANGLE
```

- [ ] Login réussit
- [ ] Dashboard admin accessible
- [ ] Peut ajouter un produit
- [ ] Peut modifier un produit
- [ ] Peut supprimer un produit

---

## 💾 TEST DE PERSISTANCE

### Test 1: Produits
```bash
1. Ajouter un produit en admin
2. Arrêter le serveur (Ctrl+C)
3. Redémarrer: node api-server.js
4. Vérifier que le produit existe toujours
```

- [ ] Produit persiste après redémarrage
- [ ] Données dans database.json

### Test 2: Commandes
```bash
1. Passer une commande en client
2. Arrêter le serveur
3. Redémarrer
4. Vérifier la commande en admin
```

- [ ] Commande sauvegardée
- [ ] Date/heure correct
- [ ] Total correct
- [ ] Visible dans admin-orders.html

### Test 3: Logs
```bash
1. Visiter le shop (crée un log)
2. Arrêter le serveur
3. Redémarrer
4. Vérifier le log persiste
```

- [ ] Log enregistré avec timestamp
- [ ] Visible dans admin-orders.html (onglet Logs)

---

## 🧪 TESTS FONCTIONNELS

### Panier
- [ ] Ajouter produit au panier
- [ ] Quantité augmente
- [ ] Prix total correct (HTG)
- [ ] Bouton - fonctionne
- [ ] Bouton + fonctionne
- [ ] Bouton Supprimer fonctionne
- [ ] Panier se vide correctement

### WhatsApp
- [ ] Clic sur bouton WhatsApp
- [ ] Message pré-rempli
- [ ] Tous les produits dans le message
- [ ] Total en HTG correct
- [ ] Lien wa.me fonctionnel
- [ ] Commande sauvegardée après

### Email
- [ ] Clic sur bouton Email
- [ ] Fenêtre email s'ouvre
- [ ] Tous les produits dans le message
- [ ] Total en HTG correct
- [ ] Commande sauvegardée après

### Admin Dashboard
- [ ] Onglet "Commandes" affiche l'historique
- [ ] Onglet "Logs" affiche les connexions
- [ ] Onglet "Stats" affiche les statistiques
- [ ] Bouton "Exporter CSV" télécharge le fichier
- [ ] Données auto-refresh toutes les 30 sec

---

## 📊 VALIDATION DES DONNÉES

### database.json
```bash
node test-persistence.js
```

- [ ] X produits enregistrés
- [ ] X commandes enregistrées
- [ ] X logs enregistrés
- [ ] Structure JSON valide
- [ ] Fichier lisible et modifiable

### Contenu produit
```json
{
  "id": "uuid valide",
  "name": "non vide",
  "price": "nombre > 0",
  "category": "valide",
  "stock": "nombre >= 0",
  "image": "url ou base64",
  "createdAt": "ISO timestamp"
}
```

- [ ] Tous les champs présents
- [ ] Types corrects
- [ ] Pas de valeurs NULL/undefined

### Contenu commande
```json
{
  "id": "non vide",
  "customerName": "non vide",
  "customerPhone": "non vide",
  "customerEmail": "non vide",
  "items": "array non vide",
  "total": "nombre > 0",
  "date": "ISO timestamp",
  "method": "whatsapp ou email"
}
```

- [ ] Tous les champs présents
- [ ] Customer info remplie
- [ ] Items array valide
- [ ] Total exact

---

## 🔐 SÉCURITÉ

- [ ] Admin code changé (`L1_TRIANGLE` → votre code)
- [ ] Sessions expiration configurée (24h)
- [ ] CORS correctement configuré
- [ ] Pas de données sensibles en JS client
- [ ] Fichier database.json pas accessible publiquement

---

## 📱 RESPONSIVE

- [ ] Shop affichage desktop ✅
- [ ] Shop affichage mobile ✅
- [ ] Admin affichage desktop ✅
- [ ] Admin affichage mobile ✅
- [ ] Panier responsive ✅
- [ ] Boutons accessibles au toucher ✅

---

## 🌐 RÉSEAU

- [ ] Fonctionne sur localhost
- [ ] Fonctionne sur IP locale (172.29...)
- [ ] Fonctionne sur d'autres appareils du réseau
- [ ] WhatsApp ouvre sur mobile
- [ ] Email ouvre sur les clients

---

## 📈 PERFORMANCE

- [ ] Panier se met à jour rapidement
- [ ] Admin dashboard charge en < 2s
- [ ] Pas de lag lors du scroll
- [ ] Images chargent rapidement
- [ ] Commandes sauvegardent rapidement

---

## 📚 DOCUMENTATION

- [ ] PERSISTENCE-GUIDE.md - Complète et claire
- [ ] MODIFICATIONS-RESUME.md - Explique les changements
- [ ] API-ENDPOINTS.md - Tous les endpoints documentés
- [ ] Ce fichier (checklist) - Rempli

---

## 🚨 PROBLÈMES CONNUS

| Problème | Solution |
|----------|----------|
| database.json pas trouve | Crée le fichier: `{}` |
| Port 3000 occupé | Tue node: `taskkill /F /IM node.exe` |
| Permissions refusées | Dossier: `chmod 755` |
| Admin code invalide | Code: `L1_TRIANGLE` |
| Panier ne persiste pas | localStorage activé dans navigateur |

---

## ✨ PRÊT POUR PRODUCTION?

**OUI si:**
- [ ] Tous les tests passent ✅
- [ ] Aucun message d'erreur en console
- [ ] database.json contient les bonnes données
- [ ] Admin peut gérer les produits
- [ ] Clients peuvent passer commandes
- [ ] Commandes persistant après redémarrage

---

## 📝 SIGNATURE

**Vérification effectuée par:** _______________  
**Date:** _______________  
**Serveur stable:** ☐ OUI ☐ NON  

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Version 1.0 - 8 Décembre 2025**
