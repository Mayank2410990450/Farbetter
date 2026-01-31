# 🚀 DEPLOYMENT ENVIRONMENT VARIABLES CHECKLIST

**For Visitor Analytics System**

---

## ✅ NO NEW VARIABLES REQUIRED!

Good news! The visitor analytics system uses **existing environment variables** only. No new variables need to be added.

---

## 📋 REQUIRED VARIABLES (Already Set)

### Backend (Server) - Update on Render/Heroku/Railway

These should already be configured in your production environment:

```env
PORT=5000
MONGO_URI=mongodb://[your-mongodb-connection-string]
JWT_SECRET=[your-jwt-secret]

# Email (for notifications if needed)
RESEND_API_KEY=re_2xBuppDu_MmazH1Zqx6AKYAgpr1BucrPH
RESEND_FROM_EMAIL="Farbetter <support@farbetterstore.com>"
SUPPORT_EMAIL=Farbetterstore@gmail.com

# Cloudinary (for images)
CLOUDINARY_NAME=dgroppdsw
CLOUDINARY_API_KEY=356998893621559
CLOUDINARY_API_SECRET=G_lpMYaBdSZLPIbQls5HBr4AcU4

# Payment
RAZORPAY_KEY_ID=rzp_live_RoMtwr6rRiRw2K
RAZORPAY_KEY_SECRET=bbOG41SHi11zhalGtocHnDNNd

# Google OAuth
GOOGLE_CLIENT_ID=1047295571088-l3p5fvsjlr2es2gd8t9shngpd619pq74.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# URLs (IMPORTANT - Update these for production!)
SERVER_URL=https://your-backend-url.onrender.com
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend (Client) - Update on Vercel/Netlify

```env
# CRITICAL: Update this to your production backend URL
VITE_SERVER_URL=https://your-backend-url.onrender.com

# These should already be set
VITE_RAZORPAY_KEY_ID=rzp_live_RoMtwr6rRiRw2K
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASSWORD=SecureAdminPass123!
```

---

## ⚠️ IMPORTANT: UPDATE THESE FOR PRODUCTION

### 1. Backend Environment (Render/Railway/Heroku)

**You MUST update:**
- `SERVER_URL` → Your actual backend URL (e.g., `https://farbetter-api.onrender.com`)
- `FRONTEND_URL` → Your actual frontend URL (e.g., `https://farbetter.vercel.app`)

### 2. Frontend Environment (Vercel/Netlify)

**You MUST update:**
- `VITE_SERVER_URL` → Your actual backend URL (e.g., `https://farbetter-api.onrender.com`)

---

## 🔧 What The Analytics System Uses

| Feature | Environment Variable | Status |
|---------|---------------------|--------|
| **Socket.IO** | `VITE_SERVER_URL` | ✅ Already exists |
| **Database** | `MONGO_URI` | ✅ Already exists |
| **IP Tracking** | None (uses req.ip) | ✅ Built-in |
| **Geolocation** | None (uses geoip-lite) | ✅ Built-in |
| **Browser Detection** | None (uses ua-parser-js) | ✅ Built-in |
| **JWT Auth** | `JWT_SECRET` | ✅ Already exists |

---

## 🎯 DEPLOYMENT VERIFICATION STEPS

After deploying, verify these:

### 1. Check Backend
```bash
curl https://your-backend-url.onrender.com/api/products
# Should return 200 with products data
```

### 2. Test Analytics Endpoint
```bash
curl -X POST https://your-backend-url.onrender.com/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"visitorId":"test-123","page":"/","deviceType":"desktop"}'
# Should return 201 with {"success":true}
```

### 3. Check Socket.IO Connection
- Open browser console on your frontend
- Should see: `Connected to socket server`
- Visit a page as a guest
- Check admin dashboard → should see new visitor appear in real-time

### 4. Verify Location Detection
- Visit your site from a real public network (not localhost)
- Check admin dashboard → "Visitors" tab
- Location should show actual city/country (not "Unknown")

---

## 🔐 CORS CONFIGURATION

Make sure your backend allows Socket.IO connections from your frontend domain.

In `Server.js`, the CORS origins are already configured:
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: [
      'https://www.farbetterstore.com',
      'http://localhost:5173',
      'http://localhost:5000'
    ],
    methods: ["GET", "POST"]
  }
});
```

**⚠️ UPDATE THIS:** Add your actual production frontend URL to the origins array!

```javascript
origin: [
  'https://your-frontend-url.vercel.app', // Add this!
  'https://www.farbetterstore.com',
  'http://localhost:5173',
  'http://localhost:5000'
]
```

---

## 📊 EXPECTED PRODUCTION BEHAVIOR

Once deployed correctly:

### ✅ Working Features:
- Visitor tracking on every page load
- Real-time visitor notifications in admin dashboard
- Location shows actual **City, Country** (not "Unknown")
- IP addresses captured correctly
- Browser/OS detected accurately
- Visit counting per user/guest
- Socket.IO live updates

### ❌ Common Issues:

**Problem:** Location shows "Unknown"
**Cause:** Using localhost or VPN
**Solution:** Expected on localhost, will work in production

**Problem:** Socket.IO not connecting
**Cause:** CORS not configured or wrong URL
**Solution:** Update `VITE_SERVER_URL` and CORS origins

**Problem:** Visitors not appearing in dashboard
**Cause:** Database connection issue
**Solution:** Check `MONGO_URI` is correct

---

## 🚀 QUICK DEPLOYMENT GUIDE

### If using **Render** (Backend):
1. Go to Dashboard → Environment
2. Verify all variables are set
3. **Update:**
   - `SERVER_URL` = https://your-app.onrender.com
   - `FRONTEND_URL` = https://your-frontend.vercel.app
4. Click "Manual Deploy" → Deploy latest commit

### If using **Vercel** (Frontend):
1. Go to Project → Settings → Environment Variables
2. **Update:**
   - `VITE_SERVER_URL` = https://your-backend.onrender.com
3. Redeploy from dashboard

### After Deployment:
1. Visit your site
2. Open admin dashboard
3. Go to "Visitors" tab
4. Refresh the homepage
5. You should see yourself appear in the visitor list **instantly**!

---

## ✅ FINAL CHECKLIST

- [ ] All environment variables set correctly
- [ ] Production URLs updated (not localhost)
- [ ] CORS configured with production domain
- [ ] Backend redeployed with latest code
- [ ] Frontend redeployed with latest code
- [ ] Socket.IO connection tested
- [ ] Visitor tracking verified
- [ ] Location detection working (shows real city/country)
- [ ] Admin dashboard showing live updates

---

**Status:** ✅ **NO NEW VARIABLES NEEDED - Just update existing URLs!**

Your analytics system will work with the current environment variables once you update the production URLs.
