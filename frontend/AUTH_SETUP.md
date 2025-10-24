# Authentication Setup for Ownly

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Database (if using Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/ownly"
```

## Setup Steps

### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env.local`

### 2. WalletConnect Setup
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID to your `.env.local`
4. **Important**: The projectId is required for WalletConnect v2 - without it, wallet connections will fail

### 3. NextAuth Secret
Generate a random secret for NextAuth:
```bash
openssl rand -base64 32
```

## Features Implemented

- ✅ Google OAuth authentication
- ✅ Wallet connection with RainbowKit
- ✅ Story Testnet (Aeneid) support
- ✅ User context management
- ✅ Protected routes
- ✅ Session management
- ✅ Responsive UI with connection status

## Supported Networks

- **Story Testnet (Aeneid)** - Primary network for Story Protocol
- Ethereum Mainnet
- Polygon
- Arbitrum
- Base
- Sepolia Testnet

## Next Steps

1. Set up the environment variables
2. Configure Google OAuth credentials
3. Set up WalletConnect project
4. Test the authentication flow
5. Add Instagram OAuth (future enhancement)
