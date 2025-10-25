# 🔑 YouTube API Setup Guide

## Step 1: Get YouTube API Key

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 2. Create/Select Project
- Click "Select a project" → "New Project"
- Name: "Ownly YouTube API" (or any name)
- Click "Create"

### 3. Enable YouTube Data API
- Go to **APIs & Services** → **Library**
- Search: "YouTube Data API v3"
- Click on it → **"Enable"**

### 4. Create API Key
- Go to **APIs & Services** → **Credentials**
- Click **"+ CREATE CREDENTIALS"** → **"API key"**
- Copy the generated key (looks like: `AIzaSyB...`)

### 5. (Optional) Restrict API Key
- Click on your API key
- Under "API restrictions" → "Restrict key"
- Select "YouTube Data API v3"
- Save

## Step 2: Update Backend Configuration

### 1. Edit Backend .env File
```bash
cd backend
nano .env
```

### 2. Replace the YouTube API Key
Find this line:
```
YOUTUBE_API_KEY=your-youtube-api-key
```

Replace with your real API key:
```
YOUTUBE_API_KEY=AIzaSyB_your_actual_api_key_here
```

### 3. Restart Backend
```bash
npm run dev
```

## Step 3: Test Real YouTube Data

### 1. Test with Real YouTube URL
- Go to frontend: http://localhost:3001
- Login with wallet + Google
- Click "Add New IP"
- Paste real YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

### 2. You Should See Real Data:
- ✅ **Real video title** (not "Amazing Music Video - Demo Track")
- ✅ **Real channel name** (not "Demo Channel")
- ✅ **Real publish date** (not current timestamp)
- ✅ **Real view count** (not 1.25M)
- ✅ **Real description** (not mock description)

## 🎯 Expected Results

With real API key, you'll get:
- **Title**: "Never Gonna Give You Up" (or actual video title)
- **Channel**: "Rick Astley" (or actual channel)
- **Views**: Real view count (e.g., 1.2B views)
- **Date**: Actual publish date
- **Description**: Real video description

## 🚨 Troubleshooting

### If API Key Doesn't Work:
1. **Check API is enabled**: Go to Google Cloud Console → APIs & Services → Library → Make sure "YouTube Data API v3" is enabled
2. **Check API key restrictions**: Make sure it's not restricted to specific IPs
3. **Check quota**: Free tier has 10,000 requests/day

### If Still Getting Mock Data:
1. Restart backend: `npm run dev`
2. Check console logs for "Using mock YouTube data" message
3. Verify API key in `.env` file

## 💡 Pro Tips

- **Free Tier**: 10,000 requests/day (plenty for development)
- **Rate Limits**: 100 requests/100 seconds per user
- **Best Practice**: Restrict API key to your domain in production

---

**Ready to get real YouTube data!** 🚀
