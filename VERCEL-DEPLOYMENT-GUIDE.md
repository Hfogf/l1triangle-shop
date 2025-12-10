# Guide de Déploiement Vercel - Correction du 500 Error

## 🚨 PROBLÈME IDENTIFIÉ
**Erreur**: `500: INTERNAL_SERVER_ERROR - FUNCTION_INVOCATION_FAILED`
**Cause**: Le serveur Express (api-server.js) n'est pas compatible avec Vercel

## ✅ SOLUTION IMPLÉMENTÉE

### 1. Architecture Serverless
- ✅ Créé `vercel.json` - Configuration Vercel
- ✅ Créé `api/products.js` - Route pour produits
- ✅ Créé `api/orders.js` - Route pour commandes
- ✅ Créé `api/index.js` - Route principale (health check)
- ✅ Modifié `admin-dashboard.js` - Détection auto local/production

### 2. Routes Disponibles
```
GET  /api              → Health check
GET  /api/products     → Liste des produits
POST /api/products     → Créer un produit
GET  /api/orders       → Liste des commandes
POST /api/orders       → Créer une commande
```

## 📝 ÉTAPES DE DÉPLOIEMENT

### Option A: Via l'interface Vercel (RECOMMANDÉ)
1. Aller sur https://vercel.com/dashboard
2. Cliquer "Add New..." → "Project"
3. Importer votre repo GitHub ou uploader le dossier
4. Vercel détectera automatiquement la config
5. Cliquer "Deploy"

### Option B: Via CLI Vercel
```powershell
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

## ⚠️ LIMITATION ACTUELLE - IMPORTANT!

### Problème de Persistance
Les fonctions serverless actuelles utilisent **la mémoire RAM** pour stocker les données:
```javascript
const products = []; // ❌ Perdu après chaque "cold start"
```

**Impact**: 
- Les produits ajoutés disparaissent après quelques minutes d'inactivité
- Chaque fonction a sa propre copie des données
- Pas de synchronisation entre les requêtes

### Solutions de Persistance (à implémenter)

#### 🟢 Option 1: Vercel KV (Redis) - RECOMMANDÉ
```bash
# Installation
npm install @vercel/kv

# Dans Vercel Dashboard
# Settings → Storage → Create KV Database
```

**Avantages**: 
- ✅ Très rapide (< 10ms)
- ✅ Gratuit jusqu'à 256 MB
- ✅ Facile à configurer
- ✅ Parfait pour notre cas d'usage

**Code à modifier** (api/products.js):
```javascript
import { kv } from '@vercel/kv';

// Au lieu de const products = []
const products = await kv.get('products') || [];
await kv.set('products', products); // Après chaque modification
```

#### 🟡 Option 2: Vercel Postgres
```bash
npm install @vercel/postgres
```

**Avantages**:
- Base de données SQL complète
- Gratuit jusqu'à 60 heures/mois
- Idéal pour relations complexes

#### 🟡 Option 3: MongoDB Atlas
```bash
npm install mongodb
```

**Avantages**:
- Gratuit 512 MB
- NoSQL flexible
- Fonctionne partout

## 🧪 TESTER LE DÉPLOIEMENT

### 1. Vérifier le Health Check
```powershell
curl https://votre-app.vercel.app/api
```
**Attendu**: `{"status":"ok"}`

### 2. Tester l'API Produits
```powershell
curl https://votre-app.vercel.app/api/products
```
**Attendu**: `[]` (vide au début, normal)

### 3. Créer un Produit
```powershell
curl -X POST https://votre-app.vercel.app/api/products `
  -H "Content-Type: application/json" `
  -d '{"name":"Test","price":100,"description":"Test product"}'
```

### 4. Vérifier le Dashboard Admin
1. Ouvrir `https://votre-app.vercel.app/admin-dashboard.html`
2. Vérifier que les produits s'affichent
3. Essayer d'ajouter/modifier/supprimer un produit

## 🐛 DÉPANNAGE

### Erreur 500 persiste
```powershell
# Vérifier les logs Vercel
vercel logs https://votre-app.vercel.app --follow
```

### API ne répond pas
1. Vérifier que `/api` fonctionne
2. Vérifier les CORS dans la console navigateur
3. Vérifier que `admin-dashboard.js` utilise les bons chemins

### Données disparaissent
**Normal** - Implémenter une solution de persistance (voir ci-dessus)

## 📊 ÉTAT ACTUEL DES DONNÉES

Votre `database.json` local contient:
- ✅ 8 produits (tous `addedByAdmin: true`)
- ✅ 0 commandes
- ✅ 1 log

**Note**: Ces données NE SONT PAS automatiquement transférées sur Vercel.

### Pour Migrer les Données Existantes

#### Avec Vercel KV:
```javascript
// Script de migration (à exécuter une fois)
import { kv } from '@vercel/kv';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
await kv.set('products', data.products);
await kv.set('orders', data.orders);
await kv.set('logs', data.logs);
console.log('✅ Données migrées!');
```

## 🎯 PROCHAINES ÉTAPES RECOMMANDÉES

1. **Immédiat**: Déployer sur Vercel pour tester
2. **Court terme** (1-2 heures): Implémenter Vercel KV
3. **Moyen terme**: Ajouter authentification API (tokens)
4. **Long terme**: Ajouter monitoring et analytics

## 📞 BESOIN D'AIDE?

### Commandes de Debug
```powershell
# Voir les logs en temps réel
vercel logs --follow

# Lister les déploiements
vercel ls

# Variables d'environnement
vercel env ls
```

### Fichiers Importants
- `vercel.json` - Configuration Vercel
- `api/*.js` - Fonctions serverless
- `admin-dashboard.js` - Frontend (détection auto local/prod)
- `database.json` - Données locales (NON utilisées sur Vercel)

## ✅ CHECKLIST DE DÉPLOIEMENT

- [x] Créé architecture serverless (api/*.js)
- [x] Configuré vercel.json
- [x] Mis à jour admin-dashboard.js
- [ ] Déployé sur Vercel
- [ ] Testé /api health check
- [ ] Testé /api/products
- [ ] Testé admin dashboard
- [ ] Implémenté persistance (KV/Postgres/MongoDB)
- [ ] Migré données existantes

---

**Version**: 1.0.0  
**Date**: 2025-01-10  
**Auteur**: Configuration automatique pour résoudre FUNCTION_INVOCATION_FAILED
