# 🚀 RENDER DEPLOYMENT - DIAGONALE

**Data**: 01/10/2025 16:57  
**Status**: ✅ READY FOR DEPLOYMENT  

---

## 📋 CONFIGURAZIONE RENDER

### Service Settings
- **Service Type**: Web Service
- **Repository**: https://github.com/derohot975/DIAGONALS
- **Branch**: main
- **Root Directory**: (leave empty)

### Build & Deploy Commands
```bash
# Build Command
npm run build

# Start Command  
npm run start
```

### Environment Variables
```bash
DATABASE_URL=postgresql://username:password@hostname:port/database
NODE_ENV=production
```

---

## 🏗️ ARCHITETTURA SERVER

### Express Server (`server/index.ts`)
- **Serve API**: Tutti gli endpoint `/api/*`
- **Serve Static Files**: App React da `dist/public/`
- **SPA Fallback**: Route non-API → `index.html`
- **Health Check**: `/api/health` per monitoring

### Build Process
1. **Client Build**: `vite build` → `dist/public/`
2. **Server Build**: `esbuild server/index.ts` → `dist/index.js`
3. **Production**: `node dist/index.js`

---

## 🩺 ENDPOINT HEALTH CHECK

### URL Produzione
```
https://diagonals.onrender.com/api/health
```

### Response Format
```json
{
  "status": "ok|degraded|down",
  "database": {
    "ok": boolean,
    "latency_ms": number|null
  },
  "timestamp_iso": "ISO string",
  "app": {
    "uptime_s": number
  },
  "version": "1.0.0"
}
```

### Features
- **Database warm-up**: Query minimali per prevenire standby
- **Rate limiting**: 100 req/15min per IP
- **Timeout**: 1s query, 3s endpoint totale
- **Logging sobrio**: Solo transizioni di stato

---

## 🔧 UPTIME ROBOT SETUP

### Monitor Configuration
```
Type: HTTP(S)
URL: https://diagonals.onrender.com/api/health
Method: GET
Interval: 15 minutes
Timeout: 30 seconds
Keyword: "status"
```

### Alert Conditions
- **DOWN**: Status ≠ 200 OR missing `"status"` keyword
- **Optional**: Alert on `"status": "degraded"`

---

## ✅ POST-DEPLOY VERIFICATION

### 1. Health Check
```bash
curl -i https://diagonals.onrender.com/api/health
# Expected: 200 OK with JSON response
```

### 2. React App
```bash
curl -s https://diagonals.onrender.com/ | grep -o "<title>.*</title>"
# Expected: <title>DIAGONALE - Wine Tasting App</title>
```

### 3. API Endpoints
```bash
curl -s https://diagonals.onrender.com/api/users | jq length
# Expected: Number of users
```

### 4. SPA Routing
```bash
curl -s https://diagonals.onrender.com/events | grep -o "<title>.*</title>"
# Expected: Same title (SPA fallback working)
```

---

## 🚨 TROUBLESHOOTING

### Common Issues

#### 1. Build Fails
**Symptoms**: Deploy fails during build
**Solutions**:
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check for TypeScript errors

#### 2. App Loads but API Fails
**Symptoms**: React app loads, API returns 500
**Solutions**:
- Check DATABASE_URL environment variable
- Verify database connectivity from Render
- Check server logs in Render dashboard

#### 3. Health Check Returns 500
**Symptoms**: `/api/health` returns server error
**Solutions**:
- Database connection issue (most common)
- Check DATABASE_URL format
- Verify database accepts connections from Render IPs

#### 4. Static Files Not Loading
**Symptoms**: App loads but assets missing
**Solutions**:
- Verify build output in `dist/public/`
- Check static file serving configuration
- Ensure correct MIME types

---

## 📊 MONITORING

### Key Metrics
- **Health Check**: Response time < 300ms
- **Database**: Latency < 200ms
- **App Load**: First paint < 2s
- **API Response**: Average < 500ms

### Logs to Monitor
- Health status transitions
- Database connection errors
- Rate limiting triggers
- Server startup/shutdown

---

## 🔄 DEPLOYMENT WORKFLOW

### Automatic Deploy
1. Push to `main` branch
2. Render detects changes
3. Runs `npm run build`
4. Starts with `npm run start`
5. Health check validates deployment

### Manual Deploy
1. Go to Render dashboard
2. Select DIAGONALE service
3. Click "Manual Deploy"
4. Select branch (main)
5. Monitor build logs

---

## 📝 NEXT STEPS

1. **Deploy to Render**: Configure service with above settings
2. **Test endpoints**: Verify all functionality works
3. **Setup Uptime Robot**: Configure monitoring with `/api/health`
4. **Monitor logs**: Watch for any issues in first 24h
5. **Performance tune**: Adjust timeouts if needed based on real metrics

**STATUS**: Ready for production deployment on Render.com
