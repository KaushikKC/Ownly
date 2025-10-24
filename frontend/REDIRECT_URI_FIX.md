# Fix redirect_uri_mismatch Error

## 🚨 The Problem
You're getting "Error 400: redirect_uri_mismatch" which means the redirect URI in Google Cloud Console doesn't match what NextAuth is sending.

## 🔧 IMMEDIATE FIX

### Step 1: Check Your Current Redirect URI
NextAuth is sending this exact URI:
```
http://localhost:3000/api/auth/callback/google
```

### Step 2: Update Google Cloud Console

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Navigate to**: APIs & Services → Credentials
3. **Click on your OAuth 2.0 Client ID**
4. **In "Authorized redirect URIs" section, add EXACTLY:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. **Click "Save"**

### Step 3: Common Mistakes to Avoid

❌ **WRONG** (these will cause the error):
- `http://localhost:3000/api/auth/callback/google/` (trailing slash)
- `https://localhost:3000/api/auth/callback/google` (https instead of http)
- `http://localhost:3000/auth/callback/google` (missing /api)
- `http://127.0.0.1:3000/api/auth/callback/google` (127.0.0.1 instead of localhost)

✅ **CORRECT**:
- `http://localhost:3000/api/auth/callback/google` (exact match)

### Step 4: Test the Fix

1. **Save the changes in Google Cloud Console**
2. **Wait 1-2 minutes** for changes to propagate
3. **Restart your development server**:
   ```bash
   npm run dev
   ```
4. **Try Google login again**

## 🔍 Debug Steps

If it still doesn't work:

1. **Check the exact URL** in your browser's address bar when the error occurs
2. **Look for the `redirect_uri` parameter** in the URL
3. **Compare it with what you have in Google Cloud Console**

## 🆘 Alternative: Add Multiple URIs

If you're still having issues, add ALL of these to your Google Cloud Console:

```
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
https://localhost:3000/api/auth/callback/google
```

## 📝 Quick Checklist

- [ ] Google Cloud Console → APIs & Services → Credentials
- [ ] Click on your OAuth 2.0 Client ID
- [ ] Add redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] No trailing slash
- [ ] Use http (not https) for localhost
- [ ] Save changes
- [ ] Wait 1-2 minutes
- [ ] Restart dev server
- [ ] Try login again

This should fix the redirect_uri_mismatch error immediately!
