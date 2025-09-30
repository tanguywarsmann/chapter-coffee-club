# 📱 V-READ iOS Release Documentation

## Quick Start for iOS Release

```bash
# 1. Build for iOS
./scripts/rebuild_ios.sh

# 2. Archive in Xcode  
# Product → Archive → Distribute App → App Store Connect

# 3. Upload to TestFlight
# (automatic after successful distribution)
```

## 🔧 Build Configuration

### Environment Variables
- `VREAD_NATIVE=1` - **Required** for iOS/Android builds (disables PWA)
- `NODE_ENV=production` - Enables minification and optimizations

### Build Commands
```bash
# iOS Build (with native optimizations)
VREAD_NATIVE=1 npm run build --mode=capacitor
npx cap copy ios && npx cap sync ios

# Development Build (preserves debugging)  
npm run build:dev
npx cap copy ios && npx cap sync ios
```

## 📋 Release Checklist

See `CHECKLIST-RELEASE.md` for complete 15-item checklist.

**Critical Steps:**
1. ✅ Clean environment (`rm -rf dist node_modules && npm install`)
2. ✅ iOS build with `VREAD_NATIVE=1`  
3. ✅ Test on physical device (no white screen)
4. ✅ Archive with Distribution profile
5. ✅ Upload to App Store Connect

## 🩺 Troubleshooting  

### White Screen on Device
**Most common cause**: Service Worker or asset path issues

```bash
# Quick fix - force clean rebuild
rm -rf dist ios/App/App/public
VREAD_NATIVE=1 npm run build
npx cap sync ios
```

**Full diagnostic**: See `RUNBOOK-BLANK-SCREEN.md`

### Build Failures
```bash  
# Clean Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData

# Clean npm/Capacitor
rm -rf node_modules dist ios/App/App/public  
npm install
```

### Signing Issues
- Verify Team ID: `VL87WXVAAC` in Xcode project settings
- Use **Automatic** code signing (already configured)
- Bundle ID: `com.vread.app` (already set)

## 🏗️ Build Architecture

```
Web Build (Vite) → dist/
                 ↓ 
    Capacitor Copy → ios/App/App/public/
                   ↓
     Capacitor Sync → ios/App/App/ (config updates)
                    ↓  
       Xcode Archive → .xcarchive
                     ↓
        Distribution → App Store Connect
                     ↓
           TestFlight → Internal Testing
```

## 📊 Success Metrics

- **Build Time**: <5 minutes (clean) / <2 minutes (incremental)
- **App Launch**: <3 seconds on iPhone 12+  
- **Bundle Size**: <50MB (current: ~25MB)
- **TestFlight**: Available within 10 minutes of upload

## 🚨 Emergency Contacts

**Build Issues**: Check GitHub Issues or Lovable support
**App Store Issues**: Apple Developer Support  
**Critical Bugs**: Use `RUNBOOK-BLANK-SCREEN.md` protocol

---

**Last Updated**: January 2025  
**App Version**: 1.0  
**Capacitor**: 7.4.2  
**iOS Target**: 14.0+