# 🩸 Blood Donation Network - Complete Deployment Guide

## 📋 Overview

This guide covers deploying the Blood Donation Network to **Render** with a **custom domain** (`blood-donation-network.com`), setting up the database, and installing the mobile app on your Android device.

---

## ✅ What We've Already Done

| Task                                 | Status                                                              |
| ------------------------------------ | ------------------------------------------------------------------- |
| GitHub repository created            | ✅ Pushed to `https://github.com/arjun12346/blood-donation-network` |
| Render configuration (`render.yaml`) | ✅ Created                                                          |
| Environment files (`.env`)           | ✅ Updated with MongoDB Atlas URI                                   |
| CORS configuration                   | ✅ Updated for custom domain                                        |
| Code committed                       | ✅ All pushed to main branch                                        |

---

## 🚀 Phase 1: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub (`arjun12346`)
3. Authorize Render to access your repositories

### Step 2: Create New Web Service (Backend)

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repo: `arjun12346/blood-donation-network`
3. Configure:
   - **Name**: `blood-donation-api`
   - **Environment**: `Node`
   - **Region**: `Singapore` (closest to India)
   - **Branch**: `main`
   - **Build Command**: `cd blood-donation-network/backend && npm install`
   - **Start Command**: `cd blood-donation-network/backend && npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables

In Render Dashboard → Your Service → Environment:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://bloodDonation:arjun123@cluster0.xdmkld6.mongodb.net/blood-donation-prod?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
CLIENT_URL=https://blood-donation-network.com
APP_VERSION=2.0.0
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=30
```

> ⚠️ **IMPORTANT**: Change `JWT_SECRET` to a secure random string!

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for build to complete (2-3 minutes)
3. Your backend will be at: `https://blood-donation-api.onrender.com`

---

## 🌐 Phase 2: Deploy Frontend to Render

### Step 1: Create Static Site

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repo
3. Configure:
   - **Name**: `blood-donation-web`
   - **Environment**: `Static Site`
   - **Branch**: `main`
   - **Build Command**: `cd blood-donation-network/frontend && npm install && npm run build`
   - **Publish Directory**: `blood-donation-network/frontend/dist`
   - **Plan**: Free

### Step 2: Add Environment Variables

```
VITE_API_URL=https://blood-donation-api.onrender.com/api
```

### Step 3: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for build to complete
3. Your frontend will be at: `https://blood-donation-web.onrender.com`

---

## 🌍 Phase 3: Connect Custom Domain (blood-donation-network.com)

### Option A: Buy Domain from Namecheap (Recommended)

1. Go to [https://namecheap.com](https://namecheap.com)
2. Search for `blood-donation-network.com`
3. Add to cart and purchase (~$10-15/year)
4. Go to Domain List → Manage → Advanced DNS

### Option B: Use Render's Free Subdomain (Skip if you bought domain)

If you don't want to buy a domain, you can use:

- Frontend: `https://blood-donation-web.onrender.com`
- Backend: `https://blood-donation-api.onrender.com`

### Step 1: Configure DNS for Frontend

In your domain provider's DNS settings:

**Type**: CNAME Record
**Host**: `@` (or `www`)
**Value**: `blood-donation-web.onrender.com`
**TTL**: Automatic

### Step 2: Configure DNS for Backend (API)

**Type**: CNAME Record
**Host**: `api`
**Value**: `blood-donation-api.onrender.com`
**TTL**: Automatic

> This creates `api.blood-donation-network.com` for your backend

### Step 3: Add Custom Domain in Render

1. Go to Render Dashboard → Your Service → Settings → Custom Domain
2. Add your domain:
   - Frontend: `blood-donation-network.com`
   - Backend: `api.blood-donation-network.com`
3. Render will provide SSL certificates automatically

### Step 4: Update Environment Variables (After Domain Works)

Once your domain is active, update in Render Dashboard:

**Backend Environment Variables:**

```
CLIENT_URL=https://blood-donation-network.com
```

**Frontend Environment Variables:**

```
VITE_API_URL=https://api.blood-donation-network.com/api
```

**Redeploy both services** after updating.

---

## 📱 Phase 4: Build & Install Mobile APK

### Step 1: Build APK (Already Running BUILD_APK.bat)

The build is running. Wait for it to complete. The APK will be at:

```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

### Step 2: Transfer APK to Phone

**Method A: USB Cable**

1. Connect phone to PC with USB
2. Copy `app-release.apk` to phone's `Downloads` folder

**Method B: Bluetooth**

1. Pair phone with PC
2. Send APK via Bluetooth

**Method C: Email/Cloud**

1. Upload APK to Google Drive/Dropbox
2. Download on phone

### Step 3: Enable Unknown Sources

1. On your phone: **Settings** → **Security**
2. Enable **"Install from Unknown Sources"**
3. Or: **Settings** → **Apps** → **Special Access** → **Install Unknown Apps**

### Step 4: Install APK

1. Open File Manager → Downloads
2. Tap `app-release.apk`
3. Tap **Install**
4. Open **BloodNet** app

### Step 5: Update API URL in Mobile (for Production)

After deployment, update `mobile/.env`:

```
REACT_APP_API_URL=https://api.blood-donation-network.com/api
```

Rebuild APK if you want production API.

---

## 📊 Phase 5: Configure MongoDB Atlas

### Step 1: Whitelist Render IP

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Database → Network Access → Add IP Address
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add Render's outbound IPs

### Step 2: Verify Connection

Test in terminal:

```bash
curl https://blood-donation-api.onrender.com/api/health
```

Should return:

```json
{
  "status": "OK",
  "message": "🩸 Blood Donation Network API is running"
}
```

---

## 🔧 Troubleshooting

### "Build failed" on Render

- Check build logs in Render Dashboard
- Ensure `package.json` has correct `start` script
- Verify `NODE_ENV=production`

### "CORS error" in browser

- Check `CLIENT_URL` in backend env vars
- Ensure it matches your frontend URL exactly

### "Cannot connect to MongoDB"

- Verify MongoDB Atlas IP whitelist
- Check `MONGODB_URI` is correct
- Ensure password doesn't have special characters (URL encode if needed)

### "APK install blocked"

- Enable "Unknown Sources" in Settings
- Disable Play Protect temporarily

---

## 📋 Post-Deployment Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Custom domain DNS configured
- [ ] SSL certificates active
- [ ] MongoDB Atlas accessible
- [ ] API health check returns 200
- [ ] Frontend loads correctly
- [ ] Registration works
- [ ] Login works
- [ ] APK installed on phone
- [ ] Mobile app connects to API

---

## 🎯 Live URLs (After Deployment)

| Service      | URL                                                  |
| ------------ | ---------------------------------------------------- |
| Frontend     | https://blood-donation-network.com                   |
| Backend API  | https://api.blood-donation-network.com               |
| Health Check | https://api.blood-donation-network.com/api/health    |
| GitHub Repo  | https://github.com/arjun12346/blood-donation-network |

---

## 💡 Next Steps

1. **Test the live app**: Register, login, create blood requests
2. **Share with friends**: They can access via browser or APK
3. **Monitor**: Check Render logs for errors
4. **Scale**: Upgrade Render plan if traffic grows
5. **Custom features**: Add payment, real OTP, analytics

---

**Your Blood Donation Network is ready to save lives! 🩸**
