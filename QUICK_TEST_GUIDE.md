# 🚀 Quick Testing Guide - Ownly Platform

## ✅ Current Status
- ✅ Backend running on port 5000
- ✅ MongoDB Atlas connected
- ✅ YouTube API working (with mock data)
- ✅ Frontend-backend integration complete
- ✅ User authentication working
- ✅ Logout functionality fixed

## 🧪 How to Test

### 1. Start the Services
```bash
# Backend (already running)
cd backend && npm run dev

# Frontend (if not running)
cd frontend && npm run dev
```

### 2. Test the Complete Flow

1. **Login**: 
   - Connect wallet (MetaMask)
   - Sign in with Google
   - Should see dashboard

2. **Add IP with YouTube URL**:
   - Click "Add New IP" 
   - Paste any YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
   - Should auto-fetch video details (title, thumbnail, description, etc.)
   - Complete the 4-step registration process

3. **Test Logout**:
   - Click "Logout" button
   - Should disconnect both wallet and Google
   - Should return to login page

### 3. What's Working Now

✅ **Authentication**: Google OAuth + Wallet connection  
✅ **User Registration**: Auto-syncs with backend  
✅ **YouTube Integration**: Fetches video metadata (mock data)  
✅ **IP Asset Creation**: Complete registration flow  
✅ **Logout**: Properly disconnects everything  

### 4. Mock Data Features

The YouTube integration now uses mock data that includes:
- Video title, description, thumbnail
- View count, like count, comment count  
- Duration, publish date, channel info
- Tags and metadata

### 5. Next Steps for Production

To use real YouTube data:
1. Get YouTube Data API key from Google Cloud Console
2. Update `YOUTUBE_API_KEY` in backend `.env`
3. Remove mock data fallback in `youtubeService.js`

## 🎯 Perfect for Hackathon Demo!

The platform now has a complete working flow:
- User authentication ✅
- YouTube video import ✅  
- IP asset registration ✅
- Clean logout ✅

Ready for demo! 🚀
