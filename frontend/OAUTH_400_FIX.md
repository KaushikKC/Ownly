# Fix Google OAuth 400 Error

## 🚨 The Problem
You're getting a "400. That's an error" from Google OAuth, which means the request is malformed.

## 🔧 Step-by-Step Fix

### 1. Check Your Environment Variables

Make sure your `.env.local` file has the correct format:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (REQUIRED)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### 2. Google Cloud Console Setup

**CRITICAL**: Follow these exact steps:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a new project** (or select existing)

3. **Enable APIs:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" → Enable it
   - Search for "Google OAuth2 API" → Enable it

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - **Name**: "Ownly Development"

5. **Configure OAuth Consent Screen:**
   - Go to "OAuth consent screen"
   - Choose "External" (unless you have Google Workspace)
   - Fill in required fields:
     - App name: "Ownly"
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

6. **Add Authorized Redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   **IMPORTANT**: No trailing slash, exact match required

### 3. Test Your Configuration

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Check the debug panel** (bottom-right corner):
   - Google Client ID should show "Set"
   - Session Status should show "unauthenticated"

3. **Try Google login:**
   - Click "Connect Google"
   - Should redirect to Google OAuth
   - After authorization, should return to app

### 4. Common Issues & Solutions

#### Issue: "Invalid client" error
- **Solution**: Double-check Client ID and Secret
- **Solution**: Ensure OAuth consent screen is configured

#### Issue: "Redirect URI mismatch"
- **Solution**: Add exact URI: `http://localhost:3000/api/auth/callback/google`
- **Solution**: No trailing slash, no extra characters

#### Issue: "Access blocked" error
- **Solution**: Configure OAuth consent screen
- **Solution**: Add your email to test users

#### Issue: Still getting 400 error
- **Solution**: Check browser console for detailed error
- **Solution**: Verify all environment variables are loaded
- **Solution**: Restart the development server

### 5. Debug Steps

1. **Check environment variables are loaded:**
   ```bash
   # In your terminal
   echo $GOOGLE_CLIENT_ID
   ```

2. **Verify the OAuth URL:**
   - Should be: `https://accounts.google.com/oauth/authorize?...`
   - Check for any malformed parameters

3. **Check browser network tab:**
   - Look for failed requests
   - Check the exact error response

### 6. Alternative: Use GitHub OAuth

If Google continues to have issues, you can temporarily use GitHub:

1. **Go to [GitHub Developer Settings](https://github.com/settings/developers)**
2. **Create OAuth App:**
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. **Add to your `.env.local`:**
   ```env
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```
4. **Update `lib/auth.ts` to include GitHub provider**

## 🎯 Quick Checklist

- [ ] Google Cloud Console project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URI added: `http://localhost:3000/api/auth/callback/google`
- [ ] Environment variables set in `.env.local`
- [ ] Development server restarted
- [ ] Debug panel shows "Set" for Google Client ID

## 🆘 Still Having Issues?

1. **Check the browser console** for detailed error messages
2. **Verify the OAuth URL** in the network tab
3. **Try incognito mode** to rule out browser issues
4. **Check if your Google account** has any restrictions
5. **Try a different Google account** for testing

The 400 error is almost always a configuration issue in Google Cloud Console. Double-check every step!
