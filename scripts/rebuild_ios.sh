#!/bin/bash
# V-READ iOS Rebuild Script
# Usage: ./scripts/rebuild_ios.sh

set -e  # Exit on any error

echo "🚀 V-READ iOS Build Pipeline Starting..."

# Check prerequisites
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Install Node.js first."
    exit 1
fi

if ! command -v xcodebuild &> /dev/null; then
    echo "❌ xcodebuild not found. Install Xcode first."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf ios/App/App/public
rm -f capacitor.config.json  # Remove duplicate config if exists

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build web app for iOS (native mode)
echo "🏗️ Building web app for iOS..."
VREAD_NATIVE=1 npm run build --mode=capacitor

# Copy web assets to iOS
echo "📱 Copying assets to iOS..."
npx cap copy ios

# Sync Capacitor configuration
echo "🔧 Syncing Capacitor configuration..."
npx cap sync ios

# Verify build
echo "✅ Verifying build..."
if [ ! -d "ios/App/App/public" ]; then
    echo "❌ Build failed: public directory not created"
    exit 1
fi

if [ ! -f "ios/App/App/public/index.html" ]; then
    echo "❌ Build failed: index.html not found"
    exit 1
fi

echo "✅ Build successful!"

# Open Xcode (optional)
read -p "🎯 Open Xcode workspace? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open ios/App/App.xcworkspace
fi

echo "🎉 V-READ iOS build completed successfully!"
echo "📝 Next steps:"
echo "   1. In Xcode: Product → Archive"
echo "   2. Select 'Distribute App' → App Store Connect"  
echo "   3. Upload to TestFlight"
