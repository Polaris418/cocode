# CoCode Deployment Guide

This guide covers deploying CoCode to production environments.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Railway/Heroku)](#backend-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment Testing](#post-deployment-testing)

---

## Prerequisites

- Git repository with your CoCode project
- Accounts on deployment platforms:
  - [Vercel](https://vercel.com) for frontend
  - [Railway](https://railway.app) or [Heroku](https://heroku.com) for backend
- Domain name (optional but recommended)

---

## Frontend Deployment (Vercel)

Vercel is the recommended platform for deploying the React frontend.

### Step 1: Prepare Frontend for Deployment

1. **Update WebSocket URL configuration**

Create `cocode-frontend/.env.production`:
```env
VITE_WS_URL=wss://your-backend-domain.com
```

2. **Test production build locally**
```bash
cd cocode-frontend
npm run build
npm run preview
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd cocode-frontend
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `cocode-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   - `VITE_WS_URL` = `wss://your-backend-url.com`
5. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard → Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

---

## Backend Deployment

### Option 1: Railway (Recommended)

Railway offers excellent WebSocket support and simple deployment.

#### Step 1: Prepare Backend

1. **Add health check endpoint** (optional)

Update `cocode-backend/src/server.js`:
```javascript
// Add HTTP server for health checks
import http from 'http';

const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  }
});

httpServer.listen(process.env.PORT || 8080);
```

2. **Update package.json**

Ensure start script is correct:
```json
{
  "scripts": {
    "start": "node src/server.js"
  }
}
```

#### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Select `cocode-backend` directory
4. Configure:
   - **Start Command**: `npm start`
   - **Port**: Will auto-detect from `process.env.PORT`
5. Deploy

#### Step 3: Get WebSocket URL

1. Railway will provide a URL like: `your-app.railway.app`
2. WebSocket URL will be: `wss://your-app.railway.app`
3. Update frontend `VITE_WS_URL` environment variable

### Option 2: Heroku

#### Prerequisites
```bash
# Install Heroku CLI
npm install -g heroku
heroku login
```

#### Deployment Steps

1. **Create Heroku app**
```bash
cd cocode-backend
heroku create cocode-backend
```

2. **Configure buildpack**
```bash
heroku buildpacks:set heroku/nodejs
```

3. **Deploy**
```bash
git subtree push --prefix cocode-backend heroku main
```

4. **Scale dyno**
```bash
heroku ps:scale web=1
```

5. **Get URL**
```bash
heroku info
# Use the web URL with wss:// protocol
```

### Option 3: DigitalOcean/AWS/Azure

For more control, deploy on a VPS:

1. **SSH into server**
```bash
ssh user@your-server.com
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Clone and setup**
```bash
git clone your-repo.git
cd cocode/cocode-backend
npm install
```

4. **Use PM2 for process management**
```bash
sudo npm install -g pm2
pm2 start src/server.js --name cocode-backend
pm2 startup
pm2 save
```

5. **Configure Nginx for WebSocket**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:1234;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

6. **Setup SSL with Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Configuration

### Production Environment Variables

**Frontend (Vercel)**
```env
VITE_WS_URL=wss://your-backend.railway.app
```

**Backend (Railway/Heroku)**
```env
PORT=1234                    # Auto-set by platform
NODE_ENV=production
```

### Environment-Specific Configuration

Update `cocode-frontend/src/components/Editor.tsx`:

```typescript
// Use environment variable for WebSocket URL
const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:1234';
const provider = new WebsocketProvider(wsUrl, roomId, doc);
```

---

## Post-Deployment Testing

### Functional Tests

1. **Open frontend URL**
   - Verify app loads without errors
   - Check console for WebSocket connection

2. **Test collaboration**
   - Open two browser tabs with same room URL
   - Type in one tab, verify sync in other
   - Check connection status indicator

3. **Test code execution**
   - Write simple code
   - Click Run button
   - Verify output appears in console

4. **Test across devices**
   - Open on mobile browser
   - Test on different networks
   - Verify WebSocket over WSS works

### Performance Monitoring

**Check WebSocket connection:**
```javascript
// Browser console
const ws = new WebSocket('wss://your-backend.railway.app/?room=test');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('Error:', e);
```

**Monitor server logs:**
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# PM2
pm2 logs cocode-backend
```

---

## Troubleshooting

### Issue: WebSocket connection fails

**Solution:**
1. Verify backend is running: `curl https://your-backend.com/health`
2. Check CORS configuration if using different domains
3. Ensure WSS (not WS) for HTTPS frontend
4. Check browser console for specific errors

### Issue: Slow synchronization

**Solution:**
1. Check network latency
2. Verify WebSocket isn't being proxied incorrectly
3. Consider CDN for frontend assets
4. Monitor backend server resources

### Issue: Code execution timeout

**Solution:**
1. Piston API has rate limits - implement retry logic
2. Add execution timeout handling
3. Consider self-hosting Piston for production

---

## Production Optimizations

### Frontend

1. **Enable compression**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});
```

2. **Add analytics** (optional)
```bash
npm install @vercel/analytics
```

### Backend

1. **Add rate limiting**
```javascript
// Prevent abuse
const connectionCounts = new Map();
const MAX_CONNECTIONS_PER_IP = 10;
```

2. **Implement room cleanup**
```javascript
// Auto-delete empty rooms after 24 hours
setInterval(() => {
  const now = Date.now();
  docs.forEach((doc, roomName) => {
    if (doc.lastAccessed && now - doc.lastAccessed > 86400000) {
      docs.delete(roomName);
    }
  });
}, 3600000); // Check every hour
```

3. **Add logging**
```bash
npm install winston
```

---

## Scaling Considerations

### Horizontal Scaling

For high traffic, you'll need:

1. **Redis for shared state**
```bash
npm install redis
```

2. **Sticky sessions** for WebSocket
   - Use Nginx with `ip_hash`
   - Or use Redis pub/sub for cross-server sync

3. **Load balancer configuration**
   - Ensure WebSocket support
   - Configure session affinity

---

## Cost Estimation

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Vercel (Frontend) | 100GB bandwidth | $20/month |
| Railway (Backend) | $5 credit/month | $0.000231/GB-hour |
| Heroku (Backend) | 550 hours/month | $7/dyno/month |

**Expected costs for moderate traffic:**
- Frontend: Free (Vercel)
- Backend: $5-10/month (Railway)
- **Total: ~$10/month**

---

## Support

For deployment issues:
- Check [Vercel docs](https://vercel.com/docs)
- Check [Railway docs](https://docs.railway.app)
- Open issue on GitHub
- Contact: your-email@example.com

---

**🎉 Congratulations! Your CoCode instance is now live!**

Share the URL and start collaborating! 🚀
