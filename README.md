# Ownly - IP Asset Management Platform

**Project name:** Ownly  
**One-liner:** Claim, co-own, license and monetize creative content (YouTube / Instagram reels) as verifiable on-chain IP using Story Protocol.

This README documents the full flow, architecture, tech stack, setup, and developer notes for the Ownly hackathon prototype. Replace placeholders (like demo URLs, API keys, addresses) with your real values before deploying.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [End-to-End Flow](#end-to-end-flow-detailed)
- [Architecture Diagram](#architecture-diagram-textual)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Getting Started](#getting-started--local-development)
- [Key Endpoints & Frontend Routes](#key-endpoints--frontend-routes)
- [Database Schema](#database-schema-core-tablescollections)
- [Story Protocol Integration](#story-protocol-integration-how-we-register-ip)
- [Collaborative IP & Licensing Flow](#collaborative-ip--licensing-flow-how-it-works)
- [Fingerprinting & Verification](#fingerprinting--verification)
- [Demo & Hosted Links](#demo--hosted-links-placeholders)
- [Developer Notes & TODOs](#developer-notes--todos)
- [License & Credits](#license--credits)

## Overview

Ownly is a prototype that lets creators claim and register the IP of video content (YouTube, Instagram Reels), invite collaborators, set ownership splits and license terms, mint license tokens, create derivative works (remixes), and receive royalties — all recorded on-chain via Story Protocol.

This README explains the project flows, what the frontend and backend do, integration points with the Story SDK, and how to run the project locally.

## Core Features

- **Sign in with YouTube/Instagram (OAuth)** and bind a wallet (RainbowKit/Wagmi)
- **Submit a video URL** (YouTube/Instagram) and fetch metadata
- **Detect collaborators** (tagged users or mentions) and propose collaborative claims
- **Approve/reject claims** (collaborator approvals)
- **Compute content fingerprints** and store fingerprints with IP metadata
- **Mint an NFT** and register it as an IP Asset on Story Protocol with collaborator splits and license terms
- **Create license tokens** (for sale), accept payments (royalties), and register derivatives (remixes)
- **Lookup / verify** an arbitrary URL to check whether it's already registered
- **Revenue tracking and sharing** with automated royalty distribution

## End-to-End Flow (Detailed)

### 1. Auth & Identity Binding
- Creator logs in via Google (YouTube) or Instagram OAuth and connects their wallet (RainbowKit)
- Backend stores mapping: `{ platform: 'youtube'|'instagram', platform_id, email, username, wallet_address }`

### 2. Submit URL / Inspect Media
- User pastes a YouTube or Instagram URL (or selects from connected account)
- Backend parses the URL and calls the appropriate platform API to fetch metadata (title, description, thumbnails, publish date, caption)
- Backend attempts to detect collaborators via @username mentions, caption tags, or platform-specific tag fields

### 3. Propose Collaborative Claim
- Initiator fills collaborator list and ownership shares
- Backend creates a pending_claim entry and notifies collaborators
- Collaborators approve via dashboard (optionally signing a SIWE attestation)

### 4. Fingerprinting & Metadata Preparation
- Backend produces a lightweight fingerprint (thumbnail pHash or small set of frame pHashes, optional audio hash)
- Metadata object includes sourceUrl, platform, fingerprints, thumbnails, detected_collaborators, and licenseTerms

### 5. Mint NFT & Register IP on Story
- Backend uploads the metadata JSON to IPFS (Pinata)
- Frontend mints an NFT using Story Protocol SDK with metadataUri
- Using `@story-protocol/core-sdk`, register the NFT as an IP Asset on Story with:
  - owner (primary owner or multisig address)
  - collaborators (addresses + share percentages)
  - metadataUri
  - licenseTerms (commercial / non-commercial / remix / revenueShare)
- Story returns storyIpId. Store it in DB

### 6. Licensing & Revenue
- Owner can create license tokens and set price
- Other users can purchase license tokens (pay royalty/fee), which invokes on-chain payments to the owner
- For derivatives: when a derivative is registered, it links to the parent IP and can define its own license and revenue split

### 7. Verification & Lookup
- Any user can paste a URL or upload a clip to verify ownership (exact sourceUrl match or fingerprint fuzzy match)
- Backend returns confidence score and owner/collaborators info

## Architecture Diagram (Textual)

```
[Frontend (Next.js)] <--> [Backend API (Node.js)] <--> [YouTube / Instagram APIs]
       |                          |
       |                          +--> [MongoDB Database]
       |                          |
       |                          +--> [IPFS (Pinata)]
       |                          |
       |                          +--> [Story Protocol SDK / Blockchain RPC]
       |
[Wallets: RainbowKit / WalletConnect (Wagmi)]
```

## Tech Stack

### Frontend
- **Next.js 16** (React 19) — UI, OAuth redirect handling, wallet connect
- **TypeScript** — Type safety and development experience
- **Tailwind CSS** — Styling and responsive design
- **Radix UI** — Accessible component primitives
- **Framer Motion** — Animations and transitions
- **NextAuth.js** — Authentication with Google and Instagram providers
- **RainbowKit + Wagmi** — Wallet connection and blockchain interactions
- **TanStack Query** — Server state management
- **Story Protocol SDK** — Blockchain IP asset management

### Backend
- **Node.js** (Express) — API server, media inspection, fingerprinting
- **MongoDB** with Mongoose — Database for users, IP assets, collaborators
- **JWT** — Authentication tokens
- **Google APIs** — YouTube data integration
- **Instagram Basic Display API** — Instagram content integration
- **Pinata** — IPFS storage for metadata
- **Ethers.js & Viem** — Blockchain interactions

### Blockchain & Storage
- **Story Protocol** — IP asset registration and licensing
- **Aeneid Testnet** — Story Protocol testnet
- **Pinata** — IPFS metadata storage
- **WIP Token** — Testnet currency for fees

## Repository Layout

```
/ownly
  /frontend          # Next.js app (pages, components, wagmi + rainbowkit)
    /app             # Next.js 13+ app router
    /components      # React components
    /lib             # Utilities, API client, Story Protocol integration
  /backend           # Node.js Express API (media, claims, story-integration)
    /models          # MongoDB schemas
    /routes          # API endpoints
    /services        # External service integrations
    /middleware       # Authentication middleware
  /README.md
```

## Getting Started — Local Development

### Prerequisites

- Node.js >= 18
- npm / yarn
- MongoDB (local or Atlas)
- Web3 wallet for testing (MetaMask)
- Pinata API key (for IPFS)
- Story Protocol developer account
- Google OAuth credentials
- Instagram Basic Display API credentials

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ownly

# JWT Secret
JWT_SECRET=your-jwt-secret-here

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3001

# External APIs
YOUTUBE_API_KEY=your-youtube-api-key
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
INSTAGRAM_REDIRECT_URI=http://localhost:3001/auth/instagram/callback

# Story Protocol SDK
WALLET_PRIVATE_KEY=your-wallet-private-key-without-0x-prefix
RPC_PROVIDER_URL=https://aeneid.storyrpc.io
PINATA_JWT=your-pinata-jwt-token
```

#### Frontend (.env.local)
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Story Protocol
NEXT_PUBLIC_STORY_PROTOCOL_RPC_URL=https://aeneid.storyrpc.io
NEXT_PUBLIC_PINATA_JWT=your-pinata-jwt-token
NEXT_PUBLIC_WALLET_PRIVATE_KEY=your-wallet-private-key-without-0x-prefix
```

### Install & Run

```bash
# Backend
cd backend
npm install
cp env.example .env
# Configure .env with your values
npm run dev

# Frontend
cd frontend
npm install
cp env.example .env.local
# Configure .env.local with your values
npm run dev
```

## Key Endpoints & Frontend Routes

### Backend API

#### Authentication
- `POST /api/auth/register` - Register/Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/youtube-channel` - Link YouTube channel

#### Users
- `GET /api/users` - Search users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/stats` - Get user statistics

#### IP Assets
- `GET /api/ip-assets` - Get all IP assets (public)
- `GET /api/ip-assets/my-assets` - Get user's assets
- `POST /api/ip-assets` - Create new IP asset
- `GET /api/ip-assets/:id` - Get specific asset
- `PUT /api/ip-assets/:id` - Update asset
- `POST /api/ip-assets/check-url` - Check if URL is registered
- `POST /api/ip-assets/mint-license-tokens` - Mint license tokens
- `POST /api/ip-assets/register-derivative` - Register derivative work
- `POST /api/ip-assets/pay-royalty` - Pay royalty to IP owner

#### Collaborators
- `GET /api/collaborators/:assetId` - Get asset collaborators
- `POST /api/collaborators/:assetId` - Add collaborator
- `PUT /api/collaborators/:assetId/:collaboratorId` - Update collaborator
- `DELETE /api/collaborators/:assetId/:collaboratorId` - Remove collaborator

#### YouTube Integration
- `GET /api/youtube/channel/:channelId` - Get YouTube channel info
- `GET /api/youtube/videos/:channelId` - Get channel videos
- `POST /api/youtube/register` - Register YouTube video as IP

#### Instagram Integration
- `GET /api/instagram/oauth-url` - Get Instagram OAuth URL
- `POST /api/instagram/token` - Exchange code for access token
- `POST /api/instagram/register` - Register Instagram media as IP
- `POST /api/instagram/bulk-register` - Bulk register user's media

### Frontend Routes

- `GET /` - Landing page
- `GET /dashboard` - My IPs dashboard
- `GET /add-ip` - Add new IP asset
- `GET /youtube-link` - Link YouTube channel
- `GET /youtube-import` - Import YouTube videos
- `GET /approvals` - Pending approvals
- `GET /verify-ip` - Verify IP ownership
- `GET /settings` - User settings
- `GET /license-video` - License management

## Database Schema (Core Collections)

### User
```javascript
{
  "_id": "...",
  "googleId": "...",
  "email": "...",
  "name": "...",
  "profilePicture": "...",
  "walletAddress": "0x...",
  "instagramHandle": "...",
  "youtubeChannelId": "...",
  "preferences": {
    "notifications": true,
    "privacy": "public"
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

### IPAsset
```javascript
{
  "_id": "...",
  "title": "...",
  "description": "...",
  "sourceUrl": "...",
  "platform": "youtube" | "instagram",
  "thumbnailUrl": "...",
  "contentHash": "...",
  "audioHash": "...",
  "visualHash": "...",
  "owner": "user_id",
  "collaborators": [
    {
      "user": "user_id",
      "walletAddress": "0x...",
      "share": 0.25,
      "role": "creator" | "collaborator" | "licensor"
    }
  ],
  "license": {
    "type": "CommercialRemix" | "NonCommercialRemix" | "CommercialUse",
    "revenueShare": 0.1,
    "terms": "..."
  },
  "storyProtocolAssetId": "...",
  "nftContract": "0x...",
  "tokenId": "...",
  "metadataUri": "ipfs://...",
  "licenseTokens": [
    {
      "licenseTermsId": "...",
      "tokenIds": ["..."],
      "transactionHash": "0x...",
      "mintedAt": "..."
    }
  ],
  "status": "draft" | "registered" | "verified",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Story Protocol Integration (How We Register IP)

### 1. Prepare Metadata (JSON)
```javascript
const metadata = {
  title: "Video Title",
  description: "Video description",
  sourceUrl: "https://youtube.com/watch?v=...",
  platform: "youtube",
  thumbnails: ["..."],
  fingerprints: {
    contentHash: "...",
    audioHash: "...",
    visualHash: "..."
  },
  detected_collaborators: [...],
  licenseTerms: {
    type: "CommercialRemix",
    revenueShare: 0.1
  },
  createdAt: "..."
};
```

### 2. Upload to IPFS
```javascript
import { PinataSDK } from "pinata-web3";
const pinata = new PinataSDK({ pinataJwt: process.env.PINATA_JWT });
const result = await pinata.upload.json(metadata);
const metadataUri = `ipfs://${result.IpfsHash}`;
```

### 3. Register with Story Protocol
```javascript
import { StorySDK } from "@story-protocol/core-sdk";

const sdk = new StorySDK({
  rpcUrl: process.env.STORY_RPC_URL,
  privateKey: process.env.WALLET_PRIVATE_KEY
});

const result = await sdk.registerIPAsset({
  nftContract: COLLECTION_ADDRESS,
  tokenId,
  owner: ownerAddress,
  metadataUri,
  collaborators: [
    { address: '0xAlice', share: 0.5 },
    { address: '0xBob', share: 0.25 }
  ],
  licenseTerms: {
    type: 'CommercialRemix',
    revenueShare: 0.1
  }
});

// Store returned storyIpId in database
```

## Collaborative IP & Licensing Flow (How It Works)

### 1. Propose Collaborative Claim
- Initiator creates IP asset with collaborators and share splits
- Backend creates pending_claim entry
- Collaborators receive notifications

### 2. Approve Claims
- Collaborators approve in-app with wallet signatures
- Backend checks approvals and triggers registration

### 3. License Token Creation
- Owner creates license tokens with specific terms
- Tokens are minted on-chain via Story Protocol
- License terms define usage rights and revenue sharing

### 4. Derivative Registration
- Users create derivative works based on original IP
- Derivatives link to parent IP with their own license terms
- Revenue flows can be defined for derivative creators

### 5. Revenue Distribution
- Automatic royalty payments based on ownership shares
- Cross-IP payments between related assets
- External tips and revenue claims

## Fingerprinting & Verification

### Content Fingerprinting
- **Visual Hash**: Thumbnail perceptual hash (pHash)
- **Audio Hash**: Audio fingerprint using Chromaprint
- **Content Hash**: Overall content hash for exact matching

### Verification Process
1. **Exact URL Match**: Check registered_ips for exact sourceUrl
2. **Fingerprint Match**: Compare perceptual hashes with hamming distance
3. **Confidence Score**: Return match confidence and owner information

### Implementation
```javascript
// Visual fingerprinting
const imageHash = require('image-hash');
imageHash('thumbnail.jpg', 16, true, (error, data) => {
  // data is perceptual hash string
});

// Audio fingerprinting (optional)
const fpcalc = require('fpcalc');
const audioHash = fpcalc('audio.mp3');
```

## Demo & Hosted Links (Placeholders)

- **Live Demo URL**: `https://www.youtube.com/watch?v=o3B0BqDeuI0`
- **Hosted Frontend**: `https://ownly-ip.vercel.app/`
- **Hosted Backend/API**: `https://ownly-dxax.vercel.app/`
- **Story Protocol Testnet**: `https://aeneid.storyrpc.io`

Replace the above with your deployed links before submission.

## Developer Notes & TODOs

### ✅ Completed Features
- User authentication with Google OAuth and Instagram
- Wallet connection with RainbowKit/Wagmi
- IP asset registration with Story Protocol
- License token minting and management
- Derivative work registration
- Revenue tracking and royalty payments
- YouTube and Instagram content integration
- Collaborative ownership management

### 🔄 In Progress
- Enhanced fingerprinting accuracy
- Real-time notifications for collaborators
- Advanced license terms customization
- Marketplace for license trading

### 📋 Future Enhancements
- **Hardening SIWE session management** (nonce tracking)
- **Rate-limit and caching** for platform API calls (YouTube / Instagram)
- **Improve fingerprinting** (frames + audio) for higher matching accuracy
- **Implement webhooks** to detect on-chain confirmations and update DB
- **Add notifications/emails** for collaborator invites
- **Implement optional on-chain CollaborativeIPManager.sol** for on-chain approvals
- **Add marketplace listing** & frontend to buy licenses
- **Integrate analytics page** (views, license sales, revenue dashboard)

## License & Credits

This repository is MIT-licensed.

Built as a hackathon prototype using Story Protocol SDK and open-source tools.

**Credits:**
- Story Protocol for IP asset management infrastructure
- Next.js and React for the frontend framework
- RainbowKit and Wagmi for wallet integration
- Pinata for IPFS storage
- MongoDB for data persistence
- Google and Instagram APIs for content integration
