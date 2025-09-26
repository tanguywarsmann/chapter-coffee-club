# 🩺 V-READ iOS Blank Screen Diagnostic Runbook

## 🎯 Quick Diagnostic Tree

**App shows white/blank screen on iOS device?**

### Branch 1: Asset Loading Issues
```bash
# Enable Safari Web Inspector
# iOS Device: Settings → Safari → Advanced → Web Inspector ON
# Mac Safari: Develop → [Your Device] → [VREAD]
```

**Expected Errors:**
- `Failed to load resource: capacitor://localhost/assets/...` 
- `Not found: /assets/index-xxx.js`

**Root Cause**: Incorrect base path for Capacitor
**Fix**: Verify `base: './'` in vite.config.ts for native builds

### Branch 2: Service Worker Conflicts
```bash
# Check Console for:
# "Failed to register service worker"  
# "WorkBox: precaching failed"
```

**Root Cause**: PWA Service Worker active in WebView
**Fix**: Ensure `isNative` condition disables PWA plugin

### Branch 3: JavaScript Runtime Errors
```bash
# Check Console for:
# "Uncaught ReferenceError"
# "Module not found" 
# "Cannot read property of undefined"
```

**Root Cause**: JS bundle corruption or module issues
**Fix**: Clean rebuild with `rm -rf dist node_modules`

## 🔧 Step-by-Step Debug Protocol

### Step 1: Enable Debug Console (2 min)
1. iOS Device: **Settings → Safari → Advanced → Web Inspector** = ON
2. Connect device to Mac via cable  
3. Open Safari on Mac: **Develop → [Device Name] → [VREAD]**
4. Launch V-READ app on device
5. **Copy first 3 red error messages** from Safari console

### Step 2: Network Tab Analysis (1 min)  
1. Safari Inspector → **Network Tab**
2. Reload app (pull-to-refresh or relaunch)
3. Look for **failed requests** (red status)
4. Note: `capacitor://localhost/` URLs failing = asset path issue

### Step 3: Application Tab Check (1 min)
1. Safari Inspector → **Application Tab** (or Storage)  
2. Check **Service Workers** section
3. If any active → **Unregister** them
4. Check **Cache Storage** → Clear all caches  
5. Reload app

### Step 4: Build Verification (3 min)
```bash
# Verify build artifacts
ls -la ios/App/App/public/
# Should show: index.html, assets/ folder

# Check index.html content
head -20 ios/App/App/public/index.html
# Should NOT contain localhost URLs

# Verify Capacitor config  
cat capacitor.config.ts | grep -A5 -B5 "webDir"
```

## 🚨 Emergency Quick Fixes

### Fix A: Force Clean Rebuild
```bash
rm -rf dist ios/App/App/public node_modules
npm install
VREAD_NATIVE=1 npm run build  
npx cap sync ios
```

### Fix B: Disable Service Worker Entirely  
```javascript
// Add to index.html <head>
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(regs => regs.forEach(reg => reg.unregister()));
}
</script>
```

### Fix C: Minimal Index Test
```html
<!-- Replace ios/App/App/public/index.html temporarily -->
<!DOCTYPE html>
<html><body>
<h1>V-READ Debug Test</h1>  
<script>console.log('Basic HTML loads OK');</script>
</body></html>
```

## 📊 Success Criteria

✅ **App Starts**: No white screen, V-READ interface visible  
✅ **Console Clean**: No red errors in Safari Inspector  
✅ **Assets Load**: All CSS/JS/images load successfully  
✅ **Navigation Works**: Can tap buttons and navigate between screens  
✅ **Supabase Connects**: Can login or see data from backend  

## 🆘 Escalation Path

If 30min of debugging doesn't resolve:

1. **Export device logs**: Xcode → Window → Devices → Select Device → View Device Logs
2. **Capture full console**: Safari Inspector → Console → Export/Screenshot all errors  
3. **Document build environment**: 
   ```bash
   node --version && npm --version
   npx cap --version  
   xcodebuild -version
   ```
4. **Contact**: Include all above artifacts in support request