#!/bin/bash
set -e

echo "🧹 Nettoyage complet du projet iOS..."

# Nettoyer les builds web
rm -rf dist ios/App/App/public

# Nettoyer le cache Xcode
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "🔨 Reconstruction du projet..."

# Rebuild web avec mode natif
VREAD_NATIVE=1 npm run build --mode=capacitor

# Sync Capacitor
npx cap sync ios

echo "✅ Projet nettoyé et reconstruit"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Ouvrez Xcode: npx cap open ios"
echo "2. Vérifiez AppIcon dans Assets.xcassets"
echo "3. Product → Clean Build Folder (Shift+Cmd+K)"
echo "4. Product → Archive"
echo "5. Dans l'Organizer, vérifiez que l'icône apparaît"
echo "6. Distribute App → App Store Connect"
