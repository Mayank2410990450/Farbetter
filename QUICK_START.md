# Quick Start Guide - Farbetter E-Commerce

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Setup Environment
Create `.env` in root directory:
```env
MONGO_URI=mongodb://localhost:27017/farbetter
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@farbetter.com
ADMIN_PASSWORD=AdminPassword123!
```

### Step 3: Seed Database with Test Products
```bash
cd server
npm run seed
```

You should see:
```
✅ Connected to MongoDB
✅ Inserted/verified 4 categories
✅ Inserted/verified 6 products
📦 Products in Database:
   - BBQ Protein Puffs (₹299)
   - Salted Caramel Protein Bar (₹199)
   - Cheese & Onion Protein Chips (₹249)
   - Double Chocolate Protein Cookie (₹179)
   - Masala Munch Puffs (₹289)
   - Almond Protein Bar (₹219)
```

### Step 4: Start Development Server
```bash
npm run dev
```

Open your browser:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 🧪 Testing the Fixes

### Test 1: View Products
1. Go to http://localhost:5173/shop
2. Click on any product
3. Should load product details (no 404 errors)

### Test 2: Invalid Product (404 Handling)
1. Go to http://localhost:5173/product/invalid-id-12345
2. See user-friendly error page with:
   - Error icon and message
   - "Browse All Products" button
   - "Go Back" button

### Test 3: SEO Meta Tags
1. Open any page
2. Right-click → View Page Source
3. Look in `<head>` section for:
   ```html
   <title>Farbetter - Premium Protein Snacks...</title>
   <meta name="description" content="...">
   <meta property="og:title" content="...">
   <meta property="og:image" content="...">
   ```

### Test 4: Structured Data
1. Go to https://search.google.com/test/rich-results
2. Enter: http://localhost:5173/product/[any-product-id]
3. Should show "Product" schema detected

### Test 5: Robots & Sitemap
Open in browser:
- http://localhost:5173/robots.txt
- http://localhost:5173/sitemap.xml

## 📁 Important Files Modified

### Frontend
- `client/src/pages/ProductDetails.jsx` - Error handling
- `client/src/pages/Home.jsx` - SEO setup
- `client/src/pages/Shop.jsx` - SEO setup
- `client/src/components/SEOHelmet.jsx` - NEW: SEO component
- `client/public/robots.txt` - NEW
- `client/public/sitemap.xml` - NEW

### Backend
- `server/seed.js` - NEW: Database seeding

## 🎯 Common Tasks

### Add a New Product Manually
```bash
# Use the admin dashboard
# Go to: http://localhost:5173/admin (login first)
# Or use API:
curl -X POST http://localhost:5000/api/products/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Product",
    "price": 299,
    "category": "category-id",
    "stock": 100
  }'
```

### Reset Database
```bash
# Delete all data and reseed
cd server
npm run seed
```

### Check Logs
```bash
# Server logs show in terminal where you ran: npm run dev
# Check browser console for frontend errors
```

### Update Product Categories
Edit `server/seed.js` and modify `sampleCategories` array, then run:
```bash
cd server && npm run seed
```

## 🔍 Debugging

### Product shows 404?
```bash
# 1. Check database has products
cd server && npm run seed

# 2. Check product ID is valid
# Go to /shop and click a product to get valid ID
```

### SEO tags not showing?
1. View page source (Ctrl+U or Cmd+U)
2. Search for `<meta name="description"`
3. Should be in `<head>` section

### CORS errors?
Check `server/Server.js` has:
```javascript
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
```

## 📚 Documentation

For more details:
- **Setup & Features**: See `README.md`
- **SEO Details**: See `SEO_OPTIMIZATION.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## 🆘 Need Help?

1. **Check if MongoDB is running**
   ```bash
   # On Windows with MongoDB installed:
   mongod
   ```

2. **Check if ports are free**
   - Port 5000 (backend)
   - Port 5173 (frontend)
   - Port 27017 (MongoDB)

3. **Clear node_modules and reinstall**
   ```bash
   npm run install:all
   ```

4. **Check .env variables**
   - All required variables are set
   - No typos in variable names

## ✅ Success Checklist

- [ ] Dependencies installed (`npm run install:all`)
- [ ] `.env` file created with all variables
- [ ] Database seeded (`npm run seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] Frontend loads at http://localhost:5173
- [ ] Products visible in /shop
- [ ] Can click product and see details
- [ ] Invalid product shows nice error page
- [ ] Meta tags visible in page source

---

**🎉 You're all set! Happy coding!**
