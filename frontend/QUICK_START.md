# Ownly - Quick Start Guide

## 🚀 Getting Started

### 1. Environment Setup

Run the setup script to create your environment file:

```bash
npm run setup
```

This creates a `.env.local` file with all required environment variables.

### 2. Required Environment Variables

**CRITICAL**: You must set up these environment variables for the app to work:

#### WalletConnect Project ID (REQUIRED)
- Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Create a new project
- Copy the Project ID to `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

#### Google OAuth (REQUIRED)
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create OAuth 2.0 credentials
- Add redirect URI: `http://localhost:3000/api/auth/callback/google`
- Copy Client ID and Secret to your `.env.local`

#### NextAuth Secret
Generate a random secret:
```bash
openssl rand -base64 32
```

### 3. Start Development Server

```bash
npm run dev
```

## 🔧 Troubleshooting

### "No projectId found" Error
This means you haven't set up WalletConnect. Follow these steps:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID
4. Add it to your `.env.local` file:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here
   ```

### Wallet Connection Issues
- Make sure you have a wallet extension installed (MetaMask, etc.)
- Ensure you're on the correct network (Story Testnet is supported)
- Check that your WalletConnect Project ID is correct

## 🌐 Supported Networks

- **Story Testnet (Aeneid)** - Primary network for Story Protocol
- Ethereum Mainnet
- Polygon
- Arbitrum
- Base
- Sepolia Testnet

## 📱 Features

- ✅ Google OAuth authentication
- ✅ Wallet connection with RainbowKit
- ✅ Story Testnet (Aeneid) support
- ✅ Protected routes
- ✅ User session management
- ✅ Responsive UI

## 🎯 Next Steps

1. Set up environment variables
2. Test authentication flow
3. Connect wallet to Story Testnet
4. Start building IP registration features
