# HavenWelfare - Railway.app Deployment Guide

## 📋 Prerequisites
- GitHub account (to push your code)
- Railway.app account (free $5 credit to start)

---

## 🚀 STEP 1: Setup Railway Account

1. Go to [https://railway.app](https://railway.app)
2. Click **"Login"** → Sign in with GitHub
3. You get **$5 free credit** (no credit card needed to start)

---

## 📤 STEP 2: Push Code to GitHub

### Option A: Use Emergent's "Save to GitHub" Button
1. In Emergent chat, click **"Save to GitHub"** button
2. Follow the prompts to create/select repository

### Option B: Manual Push
```bash
cd havenwelfare
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/havenwelfare.git
git push -u origin main
```

---

## 🗄️ STEP 3: Create Railway Project with MongoDB

### 3.1 Create New Project
1. Go to [https://railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your `havenwelfare` repository
4. Railway will detect it - click **"Add service"** (don't deploy yet!)

### 3.2 Add MongoDB Database
1. In your project, click **"+ New"** (top right)
2. Select **"Database"** → **"MongoDB"**
3. Railway will provision MongoDB automatically
4. Click on the MongoDB service → **"Variables"** tab
5. Copy the `MONGO_URL` value (you'll need this)

---

## 🔧 STEP 4: Deploy Backend

### 4.1 Add Backend Service
1. Click **"+ New"** → **"GitHub Repo"**
2. Select your `havenwelfare` repository again
3. Click on the new service to configure it

### 4.2 Configure Backend Settings
1. Go to **"Settings"** tab
2. Set **Root Directory**: `backend`
3. Set **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 4.3 Add Environment Variables
Go to **"Variables"** tab and add:

```
MONGO_URL=${{MongoDB.MONGO_URL}}
DB_NAME=havenwelfare
JWT_SECRET=your-super-secret-key-change-this-to-something-random
FRONTEND_URL=https://your-frontend-url.up.railway.app
```

> **Note:** Use `${{MongoDB.MONGO_URL}}` to automatically reference the MongoDB connection string!

### 4.4 Deploy
1. Click **"Deploy"** or it will auto-deploy
2. Wait 2-3 minutes for build
3. Go to **"Settings"** → **"Networking"** → Click **"Generate Domain"**
4. Note your backend URL: `https://xxx-backend.up.railway.app`

---

## 🎨 STEP 5: Deploy Frontend

### 5.1 Add Frontend Service
1. Click **"+ New"** → **"GitHub Repo"**
2. Select your `havenwelfare` repository again
3. Click on the new service to configure it

### 5.2 Configure Frontend Settings
1. Go to **"Settings"** tab
2. Set **Root Directory**: `frontend`
3. Set **Build Command**: `yarn install && yarn build`
4. Set **Start Command**: `npx serve -s build -l $PORT`

### 5.3 Add Environment Variables
Go to **"Variables"** tab and add:

```
REACT_APP_BACKEND_URL=https://your-backend-url.up.railway.app
```

> Replace with your actual backend URL from Step 4.4

### 5.4 Generate Domain
1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Your frontend URL: `https://xxx-frontend.up.railway.app`

---

## 🔄 STEP 6: Update Backend FRONTEND_URL

1. Go to your **Backend service** → **"Variables"** tab
2. Update `FRONTEND_URL` with your actual frontend URL:
   ```
   FRONTEND_URL=https://xxx-frontend.up.railway.app
   ```
3. Railway will auto-redeploy

---

## ✅ STEP 7: Verify Deployment

### 7.1 Test Backend Health
Visit: `https://your-backend.up.railway.app/api/health`

Should return:
```json
{"status": "healthy", "database": "connected"}
```

### 7.2 Test Frontend
Visit: `https://your-frontend.up.railway.app`

You should see the HavenWelfare landing page!

### 7.3 Test Login
Use admin credentials:
- **Email:** `brijesh.kr.dube@gmail.com`
- **Password:** `Haven@9874`

---

## 🌐 STEP 8: Custom Domain (Optional)

### Add Custom Domain
1. Go to your service → **"Settings"** → **"Networking"**
2. Click **"+ Custom Domain"**
3. Enter your domain: `app.yourdomain.com`
4. Railway will show you DNS records to add

### Update DNS at Your Registrar
Add a CNAME record:
- **Type:** CNAME
- **Name:** `app` (or `www`)
- **Value:** `xxx.up.railway.app`

### Update Environment Variables
After adding custom domain, update:
- Backend `FRONTEND_URL` → `https://app.yourdomain.com`
- Frontend `REACT_APP_BACKEND_URL` → `https://api.yourdomain.com`

---

## 💰 Railway Pricing

| Plan | Cost | Features |
|------|------|----------|
| **Trial** | $5 free | Good for testing |
| **Hobby** | $5/month | 500 hours execution |
| **Pro** | $20/month | Unlimited, team features |

**Estimated cost for HavenWelfare:** ~$5-10/month (Hobby plan)

---

## 🔧 Troubleshooting

### Build Failed?
1. Check **"Deployments"** tab for error logs
2. Common issues:
   - Missing dependencies in requirements.txt
   - Wrong root directory

### Frontend Shows Blank Page?
1. Check browser console (F12) for errors
2. Verify `REACT_APP_BACKEND_URL` is correct
3. Check if backend is running

### Database Connection Failed?
1. Verify `MONGO_URL` variable is set correctly
2. Use Railway's variable reference: `${{MongoDB.MONGO_URL}}`
3. Check MongoDB service is running (green dot)

### CORS Errors?
1. Verify `FRONTEND_URL` in backend matches your frontend URL
2. Include the full URL with `https://`

---

## 📊 Your Railway Project Structure

```
Railway Project: havenwelfare
├── 🗄️ MongoDB (Database)
├── 🔧 Backend (Web Service)
│   ├── Root: /backend
│   ├── Port: $PORT (auto)
│   └── URL: xxx-backend.up.railway.app
└── 🎨 Frontend (Static Site)
    ├── Root: /frontend
    ├── Build: yarn build
    └── URL: xxx-frontend.up.railway.app
```

---

## ⚡ Quick Reference - Environment Variables

### Backend Service
| Variable | Value |
|----------|-------|
| `MONGO_URL` | `${{MongoDB.MONGO_URL}}` |
| `DB_NAME` | `havenwelfare` |
| `JWT_SECRET` | `your-random-secret-key-here` |
| `FRONTEND_URL` | `https://xxx-frontend.up.railway.app` |

### Frontend Service
| Variable | Value |
|----------|-------|
| `REACT_APP_BACKEND_URL` | `https://xxx-backend.up.railway.app` |

---

## 🎉 Done!

Your HavenWelfare app should now be live on Railway!

**Admin Login:**
- Email: `brijesh.kr.dube@gmail.com`
- Password: `Haven@9874`

Good luck! 🚀
