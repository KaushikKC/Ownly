#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");
const envExamplePath = path.join(__dirname, "env.example");

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("✅ Created .env file from env.example");
  } else {
    const envContent = `# Database
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
INSTAGRAM_API_KEY=your-instagram-api-key
`;
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Created .env file");
  }

  console.log("📝 Please update the environment variables in .env");
  console.log("🔑 Generate JWT secret: openssl rand -base64 32");
  console.log("🗄️  Make sure MongoDB is running on localhost:27017");
} else {
  console.log("⚠️  .env file already exists");
}

console.log("\n🚀 To start the backend:");
console.log("   npm run dev");
console.log("\n📚 API Documentation: README.md");
