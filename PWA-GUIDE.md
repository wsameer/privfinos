# PWA Installation Guide

## Overview

PrivFinOS is built as a Progressive Web App (PWA) that can be installed on iOS and Android devices for a native app-like experience.

## Architecture

Your production setup is streamlined - **no reverse proxy needed**:

```
iPhone/Android Browser
    ↓
http://your-server:3001
    ↓
Hono.js API (Single Container)
    ├─→ /              (React PWA - static files)
    ├─→ /api/*         (API endpoints)
    └─→ /api/health    (Health check)
```

**Why this works:**
- Single origin = no CORS issues
- API serves static files in production (see `apps/api/src/index.ts:38-52`)
- Built-in service worker for offline support
- PWA manifest for installation

## iOS Installation (iPhone/iPad)

### Requirements
- iOS 16.4+ (for best PWA support)
- Safari browser (required for installation)

### Steps

1. **Deploy production build**:
```bash
# On your server
docker compose up -d
docker exec -it privfinos-app sh
pnpm db:push && pnpm db:seed
exit
```

2. **Access from iPhone**:
   - Open Safari
   - Navigate to: `http://your-server-ip:3001`
   - Make sure the site loads correctly

3. **Install PWA**:
   - Tap the **Share** button (square with arrow)
   - Scroll down and tap **"Add to Home Screen"**
   - Edit the name if desired
   - Tap **"Add"**

4. **Launch the app**:
   - Find the PrivFinOS icon on your home screen
   - Tap to launch in standalone mode
   - Works like a native app!

### iOS PWA Features

✅ **Works:**
- Runs in standalone mode (no Safari UI)
- Offline support (via service worker)
- Home screen icon
- Splash screen
- Push notifications (with additional setup)
- Local storage and IndexedDB

⚠️ **Limitations:**
- No background sync (iOS restriction)
- Limited storage quota compared to native apps
- Must use Safari for installation (not Chrome/Firefox)

## Android Installation

### Requirements
- Android 5.0+ (Lollipop)
- Chrome, Edge, or Samsung Internet browser

### Steps

1. **Access from Android**:
   - Open Chrome (or supported browser)
   - Navigate to: `http://your-server-ip:3001`

2. **Install PWA**:
   - You should see an **"Install"** banner automatically
   - Or tap the **menu (⋮)** → **"Install app"** or **"Add to Home screen"**
   - Tap **"Install"**

3. **Launch the app**:
   - Find PrivFinOS in your app drawer
   - Works like a native app with full screen

### Android PWA Features

✅ **Works:**
- Full PWA support (better than iOS)
- Background sync
- Better offline capabilities
- More storage quota
- Install from multiple browsers

## Testing Locally (Before Deployment)

### Option 1: Local Network Testing

1. **Start production build**:
```bash
pnpm docker:up
```

2. **Find your local IP**:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

3. **Access from phone** (same WiFi network):
   - iPhone Safari: `http://192.168.x.x:3001`
   - Install as PWA

### Option 2: Development Build

For quicker testing with hot reload:

```bash
# On your dev machine
pnpm dev

# Access from phone (same network)
http://192.168.x.x:5173
```

**Note**: Dev build won't have full PWA features (no service worker in dev mode).

## PWA Configuration

The PWA is configured in `apps/web/vite.config.ts`:

```typescript
VitePWA({
  registerType: 'prompt',  // Ask user before updating
  manifest: {
    name: 'PrivFinOS',
    short_name: 'PrivFinOS',
    description: 'Private Financial Operating System',
    theme_color: '#ffffff',
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
  },
})
```

### Customizing PWA

Edit `apps/web/vite.config.ts` to customize:

- **App name and description**
- **Theme colors**
- **Icons** (add icons to `apps/web/public/`)
- **Offline caching strategy**
- **Update behavior**

Generate PWA assets:
```bash
cd apps/web
pnpm pwa-assets-generator
```

## Production Deployment for Internet Access

### Option 1: Tailscale (Recommended for Personal Use)

Use Tailscale to access your home server from anywhere:

1. Install Tailscale on your server and iPhone
2. Access via Tailscale IP: `http://100.x.x.x:3001`
3. Works anywhere with your personal VPN

### Option 2: Public Domain with Reverse Proxy

For public access, add a reverse proxy with HTTPS:

**Using Caddy** (simplest):

1. Install Caddy on your server
2. Create `Caddyfile`:
```
privfinos.yourdomain.com {
    reverse_proxy localhost:3001
}
```
3. Run: `caddy run`
4. Access: `https://privfinos.yourdomain.com`

**Using nginx**:
```nginx
server {
    listen 80;
    server_name privfinos.yourdomain.com;
    location / {
        proxy_pass http://localhost:3001;
    }
}
```

**Why HTTPS matters for PWA:**
- Required for service workers (except localhost)
- Required for some PWA features
- Better security

### Option 3: Cloudflare Tunnel (Free HTTPS)

No ports to open:

1. Install Cloudflared on your server
2. Run: `cloudflared tunnel --url http://localhost:3001`
3. Get free HTTPS domain
4. Install PWA from HTTPS URL

## Troubleshooting

### "Add to Home Screen" not showing (iOS)

**Solutions:**
1. Make sure you're using **Safari** (not Chrome)
2. Access via HTTPS or localhost (not HTTP on public domain)
3. Check PWA manifest is loading: View Page Source → look for `<link rel="manifest">`
4. Clear Safari cache and try again

### PWA not working offline

**Check:**
1. Service worker registered: Chrome DevTools → Application → Service Workers
2. Check cache storage: Application → Cache Storage
3. Network requests in offline mode

### Icons not showing

**Solutions:**
1. Generate PWA assets: `pnpm pwa-assets-generator`
2. Check `apps/web/public/` has icon files
3. Update manifest in `vite.config.ts`
4. Clear cache and reinstall

### App not updating

**PWA uses caching:**
1. The app prompts before updating (set in config)
2. User must accept update
3. Or manually: Close all tabs → Reopen

## Monitoring PWA

### Check PWA Score

Use Lighthouse in Chrome DevTools:
1. Open `http://localhost:3001` in Chrome
2. F12 → Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"

**Aim for 100/100 PWA score**

### Check Installation

```javascript
// In browser console
navigator.standalone  // true if installed (iOS)
window.matchMedia('(display-mode: standalone)').matches  // true if installed
```

## Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [iOS PWA Support](https://firt.dev/notes/pwa-ios/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)

## Summary

**For iOS testing:**
1. Deploy with `docker compose up -d`
2. Access from iPhone Safari at `http://your-ip:3001`
3. Tap Share → Add to Home Screen
4. Launch from home screen

**No Caddy/nginx needed** - your current setup already works! The API serves everything from a single origin. 🎉
