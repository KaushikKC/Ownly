# Ownly Backend API

A Node.js backend for the Ownly IP Asset Management Platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `env.example` to `.env` and configure:
```bash
cp env.example .env
```

Required environment variables:
```env
MONGODB_URI=mongodb://localhost:27017/ownly
JWT_SECRET=your-jwt-secret-here
PORT=5000
FRONTEND_URL=http://localhost:3001
```

### 3. Start Development Server
```bash
npm run dev
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register/Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users` - Search users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/stats` - Get user statistics

### IP Assets
- `GET /api/ip-assets` - Get all IP assets (public)
- `GET /api/ip-assets/my-assets` - Get user's assets
- `POST /api/ip-assets` - Create new IP asset
- `GET /api/ip-assets/:id` - Get specific asset
- `PUT /api/ip-assets/:id` - Update asset
- `POST /api/ip-assets/check-url` - Check if URL is registered

### Collaborators
- `GET /api/collaborators/:assetId` - Get asset collaborators
- `POST /api/collaborators/:assetId` - Add collaborator
- `PUT /api/collaborators/:assetId/:collaboratorId` - Update collaborator
- `DELETE /api/collaborators/:assetId/:collaboratorId` - Remove collaborator

## 🗄️ Database Models

### User
- Google OAuth integration
- Wallet address
- Social media handles
- User preferences

### IPAsset
- Content metadata
- Source URL and platform
- Content fingerprinting (hash, audio, visual)
- Ownership and collaboration
- Licensing terms
- Blockchain integration (NFT, Story Protocol)

### Collaborator
- User reference
- Wallet address
- Ownership percentage
- Approval status
- Role (creator, collaborator, licensor)

## 🔧 Features

- ✅ User authentication with JWT
- ✅ IP asset management
- ✅ Multi-user collaboration
- ✅ Content fingerprinting storage
- ✅ License management
- ✅ URL duplicate checking
- ✅ Pagination and search
- ✅ CORS enabled for frontend

## 🛠️ Development

### Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name ownly-mongo mongo:latest

# Or install MongoDB locally
```

### Run in Development
```bash
npm run dev
```

### Production Build
```bash
npm start
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ownly` |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3001` |

## 🔒 Security

- JWT-based authentication
- CORS protection
- Input validation
- Error handling
- User authorization checks

## 📊 API Response Format

All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Optional message",
  "data": {}, // Response data
  "error": "Error message if failed"
}
```
