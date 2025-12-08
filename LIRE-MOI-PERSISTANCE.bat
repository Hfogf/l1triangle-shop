@echo off
REM Guide de démarrage complet pour L1 TRIANGLE Store

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          🚀 GUIDE DÉMARRAGE L1 TRIANGLE STORE                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo.
echo 📋 ÉTAPES DE DÉMARRAGE:
echo.
echo 1️⃣  Serveur API (Port 3000)
echo     ➜ Commande: node api-server.js
echo     ➜ Cela démarre aussi le shop
echo.
echo 2️⃣  Accès au Shop
echo     ➜ http://localhost:3000/
echo     ➜ Ajouter produits au panier
echo     ➜ Passer commandes (WhatsApp/Email)
echo.
echo 3️⃣  Accès Admin
echo     ➜ http://localhost:3000/admin-login-v2.html
echo     ➜ Code: L1_TRIANGLE
echo     ➜ Ajouter/Modifier/Supprimer produits
echo.
echo 4️⃣  Voir les Commandes
echo     ➜ http://localhost:3000/admin-orders.html
echo     ➜ Historique complet des commandes
echo     ➜ Logs de connexion
echo     ➜ Statistiques de vente
echo     ➜ Export CSV
echo.
echo.
echo ✨ NOUVELLES FONCTIONNALITÉS:
echo.
echo ✅ Persistance complète (database.json)
echo ✅ Commandes sauvegardées avec date/heure
echo ✅ Logs de connexion des clients
echo ✅ Dashboard admin complet
echo ✅ Export CSV des commandes
echo ✅ Collecte téléphone/email clients
echo.
echo.
echo 🧪 TEST DE PERSISTANCE:
echo.
echo    1. Ajouter un produit en admin
echo    2. Arrêter serveur (Ctrl+C)
echo    3. Redémarrer: node api-server.js
echo    4. ✅ Le produit est toujours là!
echo.
echo    OU lancer: node test-persistence.js
echo.
echo.
echo 📖 DOCUMENTATION COMPLÈTE:
echo.
echo    ➜ PERSISTENCE-GUIDE.md      (Guide détaillé)
echo    ➜ MODIFICATIONS-RESUME.md   (Ce qui a changé)
echo    ➜ api-server.js             (Code serveur)
echo    ➜ panier-api-v2.js         (Logique panier)
echo.
echo.
echo 🆘 EN CAS DE PROBLÈME:
echo.
echo    • Port 3000 occupé?
echo      → Tuer le processus: taskkill /F /IM node.exe
echo      → Ou changer PORT dans api-server.js
echo.
echo    • Données ne persistent pas?
echo      → Vérifier que api-server.js est lancé
echo      → Vérifier que database.json existe
echo      → Vérifier les permissions du dossier
echo.
echo    • Admin ne peut pas modifier?
echo      → Code: L1_TRIANGLE
echo      → Vérifier sessionId dans le navigateur
echo.
echo.
echo 💾 SAUVEGARDE:
echo.
echo    Sauvegarder la base avant maintenance:
echo    copy database.json database.json.backup
echo.
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    PRÊT À DÉMARRER ! 🚀                        ║
echo ║                                                                ║
echo ║              node api-server.js                               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
pause
