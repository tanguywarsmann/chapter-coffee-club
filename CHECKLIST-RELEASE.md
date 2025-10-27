# ✅ V-READ iOS Release Checklist

## 🛠️ Pre-Build (Clean Environment)

- [ ] **Clean Xcode**: Product → Clean Build Folder  
- [ ] **Clean Node**: `rm -rf node_modules dist && npm install`
- [ ] **Clean Capacitor**: `rm -rf ios/App/App/public`
- [ ] **Verify Team**: Xcode → Project → Signing & Capabilities → Team = "TANGUY WARSMANN"

## 🏗️ Build Process  

- [ ] **Environment**: `VREAD_NATIVE=1` set for iOS build
- [ ] **Web Build**: `VREAD_NATIVE=1 npm run build` ✅ 
- [ ] **Capacitor Copy**: `npx cap copy ios` ✅
- [ ] **Capacitor Sync**: `npx cap sync ios` ✅
- [ ] **Verify Assets**: Check `ios/App/App/public/index.html` exists

## 📱 Xcode Configuration

- [ ] **Code Signing**: Automatic ✅ (already set)
- [ ] **Bundle ID**: `com.vread.app` ✅ (already set)
- [ ] **Version**: Marketing Version = "1.0" → increment as needed
- [ ] **Build Number**: Increment `CURRENT_PROJECT_VERSION` 
- [ ] **Device Support**: iPhone/iPad deployment target ≥ 14.0 ✅

## 🔍 Pre-Archive Testing

- [ ] **Simulator Test**: Run on iOS Simulator, verify app starts
- [ ] **Device Test**: Run on physical device, verify no white screen
- [ ] **Console Check**: Safari → Develop → Device → Web Inspector, no red errors
- [ ] **Network Test**: Verify Supabase connection works
- [ ] **Navigation Test**: Test main app flows (login, book browsing)

## 📦 Archive & Distribution  

- [ ] **Archive**: Product → Archive (Xcode) 
- [ ] **Export**: Window → Organizer → Distribute App
- [ ] **Method**: App Store Connect
- [ ] **Signing**: Automatic (use Distribution certificate)
- [ ] **Upload**: Complete upload to App Store Connect
- [ ] **TestFlight**: Build appears in TestFlight within 10min

## ✅ Post-Upload Validation

- [ ] **TestFlight Install**: Install on test device from TestFlight
- [ ] **App Launch**: Verify app launches without white screen  
- [ ] **Core Features**: Login, browse books, basic functionality
- [ ] **Crash Logs**: Check Xcode Organizer for crashes within 24h
- [ ] **Performance**: App responsive, no significant lag

## 🧪 iOS-Specific Tests

- [ ] **No Service Worker**: Open Safari Web Inspector → Console, verify NO "service worker" messages
- [ ] **No Update Toasts**: Verify NO "Mise à jour VREAD disponible" toast appears in native app
- [ ] **Status Bar**: Verify iOS status bar does not overlap app header
- [ ] **Offline Mode**: Verify app works offline (native cache, not PWA)
- [ ] **Build Verification**: Check `dist/` folder has NO `sw.js` or `workbox-*.js` files after build
- [ ] **Local Notifications**: If enabled, test notification permissions and delivery

## 🚨 Rollback Plan

If issues detected:
- [ ] **Remove Build**: App Store Connect → TestFlight → Remove build
- [ ] **Notify Testers**: Internal TestFlight group  
- [ ] **Debug Logs**: Export device logs via Xcode
- [ ] **Fix & Rebuild**: Apply fixes and restart process