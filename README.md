# 🧥 The Jacket Maker — Luxury Bespoke Atelier (MERN Architecture)

Yeh project mukammal tor par **Client** (React 19 + Vite + Tailwind CSS + Motion + Lenis) aur **Server** (Node.js + Express API + MongoDB / Resilient JSON Store) ke do alag folders mein organize kar diya gaya hai, saath hi **Vercel deployment files**, **Smooth Scroll Animations**, aur **Redesigned Luxury Product Cards** shamil kar diye gaye hain.

---

## 📁 Clean 2-Folder Monorepo Structure

```text
├── client/                     # 🌐 React 19 Frontend (Vite + Tailwind CSS + Motion + Lenis)
│   ├── public/                 # Static images, favicon, assets
│   ├── src/                    # Source code
│   │   ├── assets/             # Branding assets & images
│   │   ├── components/         # Redesigned ProductCard, SmoothScroll, Navbar, CartDrawer, etc.
│   │   ├── context/            # AuthContext, CartContext, WishlistContext, CurrencyContext
│   │   ├── pages/              # HomePage, ShopPage, ProductDetailPage, CustomStudio, Admin, etc.
│   │   ├── services/           # api.ts (Axios with configurable VITE_API_URL / relative /api)
│   │   ├── App.tsx             # Root app with Lenis smooth scroll & routing
│   │   ├── index.css           # Luxury styling, custom scrollbar & Lenis CSS
│   │   └── main.tsx            # React root mount
│   ├── index.html              # HTML shell
│   ├── vite.config.ts          # Vite configuration with auto proxy to port 5000
│   ├── package.json            # Client dependencies
│   ├── vercel.json             # Vercel configuration for client-only deployment
│   └── .env.example
│
├── server/                     # ⚙️ Express Backend API
│   ├── controllers/            # Auth, Product, Order, Custom Studio, Review, Stats
│   ├── routes/                 # REST routes (/api/products, /api/auth, /api/orders, etc.)
│   ├── models/                 # Mongoose models (Product, User, Order, CustomInquiry, Review)
│   ├── middleware/             # JWT auth & admin middleware
│   ├── data/                   # Resilient High-Speed JSON store fallback & seed data
│   ├── uploads/                # File uploads storage
│   ├── app.js                  # Modular Express App export (Used by standalone server & Vercel)
│   ├── server.js               # Standalone Node.js listener (Port 5000)
│   ├── seed.js                 # Catalog & demo user seeder
│   ├── package.json            # Server dependencies
│   └── .env.example
│
├── api/
│   └── index.js                # ⚡ Vercel Serverless Function entry point (Runs Express on Vercel)
│
├── vercel.json                 # 🚀 Root Vercel config for seamless 1-Click Monorepo Deployment
├── dev.js                      # 🔄 Concurrent runner for local development
├── package.json                # 📦 Root package orchestrator
└── README.md
```

---

## ✨ Nayi Improvements (What Was Improved)

### 1. 🗂️ 2 Alag Folders (`client` & `server`)
- Saara frontend code `client/` folder ke andar shift kar diya gaya hai jismein apna alag `package.json`, `vite.config.ts`, aur build setup mojood hai.
- Backend code `server/` folder mein organize hai jismein apna standalone `package.json`, routes, controllers, aur database store hai.
- Root directory par ek convenient command di gayi hai jo dono ko ek saath chala sakti hai.

### 2. 🌊 Butter-Smooth Scroll & Scroll Animations
- **Lenis Inertial Scroll Engine** implement kiya gaya hai (`duration: 1.2`, custom exponential easing, smooth wheel, touch velocity multiplier).
- Standard Lenis CSS engine rules aur luxury slim scrollbar shamil hain.
- **Scroll Progress Bar**: Page ke top par brown & gold ambient progress indicator jo scroll ke mutabiq fill hota hai.
- **Floating "Back to Top" Button**: Smooth spring animation ke saath tabhi appear hota hai jab user scroll karta hai, aur ek click par buttery smooth wapas upar le jata hai.
- **Scroll-Triggered Reveals**: Framer Motion / Motion ke zariye heading, metric count-up, aur cards scroll hone par beautifully fade aur slide in hotay hain.

### 3. 💎 Ultra-Luxury Redesigned Cards
- **Product Card (`ProductCard.jsx`)**:
  - **Luxury Framing**: Rounded 24px borders, soft warm studio backdrop (`#F7F6F3`), ambient hover glow.
  - **Dynamic Image Zoom & Alternate View**: Mouse hover karne par secondary high-res image aur satin sheen light sweep trigger hoti hai.
  - **Desktop Quick-Action Drawer**: Glassmorphism hover drawer jismein available sizes (`S`, `M`, `L`, `XL`, `Custom`) foran "Add to Bag" ki celebration animation ke saath miltay hain.
  - **Mobile Quick-Bag Button**: Mobile screen par floating quick-action button diya gaya hai taake mobile users bhi baghair page load kiye size choose kar sakein.
  - **Color Variant Dots**: Interactive color swatches jo click par active ring indicator aur color change show karte hain.
  - **Badges**: "Save X%", "Best Seller", "New In", aur "Free Custom Sizing" ke elegant pills.
  - **Bottom Bronze-Gold Accent Line**: Hover karne par luxury bronze metallic line draw hoti hai.
- **Category Cards**: Editorial fashion magazine style cards with frosted badges, glowing hover states, and smooth rotation.
- **Review Cards**: Verified Order green badge, gold star glow, and premium leather avatar styling.

### 4. 🚀 Vercel Deployment Configuration
- **Root `vercel.json`**: Poora monorepo Vercel par directly deploy hota hai. Frontend `client/dist` se serve hota hai aur backend API (`/api/*`) Vercel Serverless Function `api/index.js` ke zariye chalte hain.
- **Client `client/vercel.json`**: Agar aap sirf client folder Vercel par deploy karna chahein to yeh bhi ready hai.

---

## 🛠️ Local Environment Mein Chalana (How to Run Locally)

### Option 1: Dono (Client + Server) Ek Saath Chalana (Recommended)
Root folder mein terminal open karein:
```bash
npm run dev
```
Yeh command backend (`http://localhost:5000`) aur frontend (`http://localhost:5173`) dono ko ek saath start kar degi!

---

### Option 2: Alag Alag Terminal Mein Chalana

#### 1. Backend Server Chalana:
```bash
cd server
npm install
npm run dev
```
*(Server chalega: `http://localhost:5000`)*

#### 2. Frontend Client Chalana:
Naye terminal mein:
```bash
cd client
npm install
npm run dev
```
*(Client chalega: `http://localhost:5173` - Vite automatic proxy ke zariye `/api` requests port 5000 par bhejega)*

---

## 🌐 Vercel Par Deploy Karne Ka Tareeqa (Vercel Deployment Guide)

### Tareeqa A: 1-Click Monorepo Deployment (Full-Stack on Vercel)
Is project mein root level par `vercel.json` aur `api/index.js` mojood hain.

1. Apna project **GitHub** par push karein.
2. [Vercel Dashboard](https://vercel.com/new) par jayein aur repository import karein.
3. **Framework Preset**: Vite select karein (ya Vercel khud detect kar lega).
4. **Root Directory**: `.` (Root) hi rehne dein.
5. **Build & Output Settings**:
   - Build Command: `npm --prefix client run build` (automatic `vercel.json` se pick ho jayega)
   - Output Directory: `client/dist` (automatic `vercel.json` se pick ho jayega)
6. **Environment Variables (Optional)**:
   - `MONGODB_URI`: (Agar aap apna MongoDB Atlas connection use karna chahte hain. Agar nahi denge toh built-in resilient JSON store kaam karega!)
   - `JWT_SECRET`: Apni custom secret key (e.g. `jacket_maker_jwt_secret_2026`)
7. **Deploy** button dabayein!
   - Vercel client ko build karega aur API endpoints `/api/*` ko serverless functions ke tor par deploy kar dega!

---

### Tareeqa B: Sirf Frontend (Client) Vercel Par Deploy Karna
Agar aap backend ko alag jagah (maslan Render / Railway / VPS) par host kar rahe hain:
1. Vercel par project import karte waqt **Root Directory** ko `client` select karein.
2. `client/vercel.json` already configured hai jo SPA routes handle karta hai.
3. Vercel dashboard mein **Environment Variable** add karein:
   - `VITE_API_URL` = `https://your-backend-api-url.com/api`
4. Deploy kar dein!

---

## 🔑 Demo Credentials
- **Admin Portal**: `admin@thejacketmaker.pk` / `admin123`
- **Customer Account**: `umar@thejacketmaker.pk` / `customer123`
