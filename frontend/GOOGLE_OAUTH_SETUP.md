# Google OAuth Setup Guide

## 🔧 Troubleshooting Google Login Issues

### 1. Environment Variables Check

Make sure your `.env.local` has the correct Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create or select a project**
3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
5. **Add Authorized Redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   For production:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

### 3. Common Issues & Solutions

#### Issue: "Invalid client" error
- **Solution**: Check that your Client ID and Secret are correct
- **Solution**: Ensure the redirect URI matches exactly

#### Issue: "Redirect URI mismatch" error
- **Solution**: Add the exact callback URL to Google Console
- **Solution**: Make sure there are no trailing slashes

#### Issue: Google login button not working
- **Solution**: Check browser console for errors
- **Solution**: Verify environment variables are loaded
- **Solution**: Ensure NextAuth is properly configured

#### Issue: Session not persisting
- **Solution**: Check NEXTAUTH_SECRET is set
- **Solution**: Verify NEXTAUTH_URL matches your domain

### 4. Debug Information

The app includes a debug panel (bottom-right corner) that shows:
- Session status
- User information
- Wallet connection status
- Environment variable status

### 5. Testing Steps

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser console** to see any errors

3. **Check the debug panel** for authentication status

4. **Try connecting Google:**
   - Click "Connect Google" button
   - Should redirect to Google OAuth
   - After authorization, should return to app

5. **Verify session persistence:**
   - Refresh the page
   - User should remain logged in

### 6. Production Deployment

For production, make sure to:
- Update redirect URIs in Google Console
- Set correct NEXTAUTH_URL
- Use HTTPS for all URLs
- Set secure NEXTAUTH_SECRET

### 7. Alternative OAuth Providers

If Google OAuth continues to have issues, you can add other providers:

```typescript
// In lib/auth.ts
import GitHubProvider from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  // ... rest of config
});
```

## 🚀 Quick Fix Checklist

- [ ] Google OAuth credentials are set in `.env.local`
- [ ] Redirect URI is added to Google Console
- [ ] Google+ API is enabled
- [ ] NEXTAUTH_SECRET is set
- [ ] NEXTAUTH_URL matches your domain
- [ ] No console errors in browser
- [ ] Debug panel shows correct status
