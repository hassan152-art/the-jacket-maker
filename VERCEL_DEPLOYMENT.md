# 🚀 Vercel Deployment Guide — The Jacket Maker

Is guide mein step-by-step bataya gaya hai ke is project ko Vercel par kaise deploy karna hai.

---

## ⚡ Option 1: Full-Stack Deployment (Frontend + Backend on Vercel)

Aapka poora MERN stack (React frontend aur Express API) Vercel par chal sakta hai kyunki humne:
1. `vercel.json` (Root level config)
2. `api/index.js` (Serverless API handler)
ready kar diya hai!

### Steps:
1. **GitHub par code push karein**:
   ```bash
   git add .
   git commit -m "Organized into client/server with smooth scroll and luxury cards"
   git push origin main
   ```

2. **Vercel par project create karein**:
   - [vercel.com](https://vercel.com) par login karein.
   - **Add New...** > **Project** par click karein.
   - Apni GitHub repository select karke **Import** karein.

3. **Project Settings**:
   - **Root Directory**: `.` (Default empty / root).
   - **Framework Preset**: Vite (ya Other).
   - `vercel.json` file khud-ba-khud build command (`npm --prefix client run build`) aur output directory (`client/dist`) set kar degi.

4. **Environment Variables**:
   Vercel ke *Environment Variables* section mein yeh keys add karein:
   - `JWT_SECRET`: `jacket_atelier_super_secret_key_2026`
   - `MONGODB_URI`: (Aapka MongoDB Atlas URI connection string, e.g. `mongodb+srv://...`)
     *(Note: Agar MONGODB_URI nahi denge to built-in fallback JSON storage kaam karega).*

5. **Deploy**:
   - **Deploy** button click karein.
   - 1-2 minutes mein aapki site live ho jayegi!

---

## 🌐 Option 2: Sirf Client (Frontend) Vercel Par Deploy Karna

Agar aap backend server ko kisi alag hosting (jaise Render, Railway, DigitalOcean, VPS) par chalana chahein:

1. Vercel par repository import karte waqt **Root Directory** ko `client` select karein.
2. Vercel mein Environment Variable add karein:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-api-domain.com/api`
3. Click **Deploy**.
   `client/vercel.json` ensure karega ke page refresh karne par koi 404 error na aaye aur React Router ke tamam routes (`/shop`, `/product/:slug`, `/custom-studio`, waghera) seamlessly load hon.
