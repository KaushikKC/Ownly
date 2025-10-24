#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
const envExample = `# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# WalletConnect (REQUIRED - Get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Database (if using Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/ownly"
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envExample);
  console.log("✅ Created .env.local file");
  console.log(
    "📝 Please update the environment variables with your actual values"
  );
  console.log(
    "🔗 Get WalletConnect Project ID from: https://cloud.walletconnect.com/"
  );
  console.log(
    "🔗 Get Google OAuth credentials from: https://console.cloud.google.com/"
  );
} else {
  console.log("⚠️  .env.local already exists");
}
