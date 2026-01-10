# HavenWelfare - Render.com Deployment Guide

## 📋 Prerequisites
- GitHub account (to push your code)
- Render.com account (free tier available)
- MongoDB Atlas account (free tier - 512MB)

---

## 🗄️ STEP 1: Setup MongoDB Atlas (Free Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click **"Try Free"** and sign up
3. Choose **FREE** tier (M0 Sandbox - 512MB)

### 1.2 Create a Cluster
1. Click **"Build a Database"**
2. Select **FREE - Shared** option
3. Choose a cloud provider (AWS recommended) and region closest to you
4. Click **"Create Cluster"** (takes 1-3 minutes)

### 1.3 Setup Database Access
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Create a user:
   - Username: `havenwelfare_admin`
   - Password: Generate a secure password (SAVE THIS!)
   - Role: **Atlas Admin**
4. Click **"Add User"**

### 1.4 Setup Network Access
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Render.com)
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Database"** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string, it looks like:
   ```
   mongodb+srv://havenwelfare_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name before `?`:
   ```
   mongodb+srv://havenwelfare_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/havenwelfare?retryWrites=true&w=majority
   ```

---

## 📤 STEP 2: Push Code to GitHub

### 2.1 Create GitHub Repository
1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `havenwelfare`
3. Make it **Private** (recommended)
4. Click **"Create repository"**

### 2.2 Download Code from Emergent
On Emergent platform:
1. Click the **"Save to GitHub"** button in the chat interface
2. Or download the code as ZIP and push manually

### 2.3 Manual Push (if needed)
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

## 🚀 STEP 3: Deploy Backend on Render

### 3.1 Create Backend Service
1. Go to [https://render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your `havenwelfare` repository

### 3.2 Configure Backend Service
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `havenwelfare-backend` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` (or paid for better performance) |

### 3.3 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `MONGO_URL` | `mongodb+srv://havenwelfare_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/havenwelfare?retryWrites=true&w=majority` |
| `DB_NAME` | `havenwelfare` |
| `JWT_SECRET` | `your-super-secret-key-change-this-in-production` |
| `FRONTEND_URL` | `https://havenwelfare-frontend.onrender.com` (update after frontend deploy) |

### 3.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes first time)
3. Note your backend URL: `https://havenwelfare-backend.onrender.com`

---

## 🎨 STEP 4: Deploy Frontend on Render

### 4.1 Create Frontend Service
1. Click **"New +"** → **"Static Site"**
2. Select the same `havenwelfare` repository

### 4.2 Configure Frontend Service

| Setting | Value |
|---------|-------|
| **Name** | `havenwelfare-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `yarn install && yarn build` |
| **Publish Directory** | `build` |

### 4.3 Add Environment Variable
Click **"Advanced"** → **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `REACT_APP_BACKEND_URL` | `https://havenwelfare-backend.onrender.com` |

### 4.4 Deploy
1. Click **"Create Static Site"**
2. Wait for deployment (3-5 minutes)
3. Your frontend URL: `https://havenwelfare-frontend.onrender.com`

---

## 🔄 STEP 5: Update Backend FRONTEND_URL

1. Go to Render Dashboard → `havenwelfare-backend` service
2. Go to **"Environment"** tab
3. Update `FRONTEND_URL` to your actual frontend URL:
   ```
   https://havenwelfare-frontend.onrender.com
   ```
4. Click **"Save Changes"** (this will redeploy)

---

## ✅ STEP 6: Verify Deployment

### 6.1 Test Backend
Visit: `https://havenwelfare-backend.onrender.com/api/health`
Should return: `{"status": "healthy"}`

### 6.2 Test Frontend
Visit: `https://havenwelfare-frontend.onrender.com`
You should see the HavenWelfare landing page!

### 6.3 Test Login
Use admin credentials:
- Email: `brijesh.kr.dube@gmail.com`
- Password: `Haven@9874`

---

## 🌐 STEP 7: Custom Domain (Optional)

### For Frontend:
1. Go to your frontend service on Render
2. Click **"Settings"** → **"Custom Domains"**
3. Add your domain: `www.yourdomain.com`
4. Update DNS at your domain registrar:
   - Type: `CNAME`
   - Name: `www`
   - Value: `havenwelfare-frontend.onrender.com`

### For Backend API:
1. Go to your backend service on Render
2. Add custom domain: `api.yourdomain.com`
3. Update DNS:
   - Type: `CNAME`
   - Name: `api`
   - Value: `havenwelfare-backend.onrender.com`

4. **Update Frontend Environment Variable:**
   - Change `REACT_APP_BACKEND_URL` to `https://api.yourdomain.com`

---

## 🔧 Troubleshooting

### Backend won't start?
- Check Render logs for errors
- Verify MONGO_URL is correct
- Ensure MongoDB Atlas allows access from anywhere

### Frontend shows blank page?
- Check browser console for errors
- Verify REACT_APP_BACKEND_URL is correct
- Ensure backend is running

### Can't login?
- Backend needs to seed admin user on first run
- Check backend logs for "Admin user seeded" message

### CORS errors?
- Verify FRONTEND_URL in backend matches your actual frontend URL
- Redeploy backend after changing environment variables

---

## 💡 Tips

1. **Free Tier Limitations:**
   - Services sleep after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds (cold start)
   - Upgrade to paid ($7/month) for always-on service

2. **Keep Services Active:**
   - Use a free service like UptimeRobot to ping your backend every 14 minutes

3. **Database Backup:**
   - MongoDB Atlas has automatic backups on paid tiers
   - For free tier, manually export data periodically

---

## 📞 Support

If you face any issues:
1. Check Render service logs
2. Check MongoDB Atlas connection
3. Verify all environment variables are set correctly

Good luck with your deployment! 🚀
