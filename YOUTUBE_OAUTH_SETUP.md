# 🔧 YouTube OAuth Setup Guide

## ❌ **Current Error:**
```
Access blocked: Authorization Error
Missing required parameter: client_id
Error 400: invalid_request
```

## 🔧 **Fix: Set Environment Variables**

### **Step 1: Create `.env.local` file in frontend directory**

Create `/Users/kaushikk/Documents/hackathons/Encode Hack/Ownly/frontend/.env.local` with:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth (for NextAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google OAuth (for YouTube - client-side accessible)
GOOGLE_CLIENT_ID=your-google-client-id

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Story Protocol
NEXT_PUBLIC_STORY_PROTOCOL_RPC_URL=https://aeneid.storyrpc.io
```

### **Step 2: Get Your Google Client ID**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (or create one)
3. **Enable YouTube Data API v3**
4. **Go to Credentials** → Create OAuth 2.0 Client ID
5. **Set Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for NextAuth)
   - `http://localhost:3000/api/auth/youtube-callback` (for YouTube OAuth)
6. **Copy the Client ID** and **Client Secret**

### **Step 3: Update `.env.local`**

Replace `your-google-client-id` and `your-google-client-secret` with your actual values:

```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### **Step 4: Restart the Frontend**

```bash
cd frontend
npm run dev
```

## 🎯 **Alternative: Use Manual Channel ID**

If you don't want to set up OAuth right now, you can use the **Manual Channel ID** option:

1. **Click "Manual Channel ID"** button
2. **Enter your YouTube Channel ID** manually
3. **Click "Link Channel ID"**

## 🔍 **How to Find Your YouTube Channel ID:**

1. **Go to your YouTube channel**
2. **Look at the URL**: `https://www.youtube.com/channel/UCyour-channel-id-here`
3. **Copy the part after `/channel/`** (e.g., `UCyour-channel-id-here`)

## ✅ **Expected Result:**

After setting up the environment variables:
- ✅ **"Link YouTube Channel (Automatic)"** should work
- ✅ **Redirects to Google OAuth** with proper client_id
- ✅ **User authorizes YouTube access**
- ✅ **Automatic channel ID extraction**
- ✅ **Stores channel ID in database**

**The error occurs because `GOOGLE_CLIENT_ID` is not set in your environment variables!** 🔧
