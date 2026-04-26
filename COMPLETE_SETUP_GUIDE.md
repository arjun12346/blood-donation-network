# Blood Donation Network - Complete Setup & Installation Guide

## 📋 Project Overview

BloodNet is a comprehensive AI-powered emergency blood donation network with:

- 🌐 Web application (React + Vite + Tailwind)
- 📱 Mobile apps (iOS & Android with React Native/Expo)
- ⚡ Real-time notifications (Socket.io)
- 🔐 OAuth authentication (Google, GitHub, Apple)
- 🩸 Blood inventory management
- 🚨 Emergency alerts system
- 🤖 AI-powered fraud detection & priority analysis

---

## ✅ Prerequisites

### System Requirements

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 5.0
- Git

### For Mobile Development

- Expo CLI: `npm install -g expo-cli`
- Xcode (macOS, for iOS)
- Android Studio (for Android)
- EAS CLI: `npm install -g eas-cli`

---

## 🚀 Quick Start (All-in-One)

### 1. Clone Repository

```bash
git clone https://github.com/your-org/blood-donation-network.git
cd blood-donation-network
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev
```

**Expected Output**:

```
╔════════════════════════════════════════════════════════════╗
║  🩸 Blood Donation Network API                            ║
║  🚀 Server running on http://localhost:5000               ║
║  📋 Health check: http://localhost:5000/api/health        ║
║  🌍 Environment: development                              ║
║  📦 Version: 2.0.0                                         ║
╚════════════════════════════════════════════════════════════╝
```

### 3. Frontend Setup (Web)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
nano .env

# Start development server
npm run dev
```

**Access at**: `http://localhost:5173`

### 4. Mobile Setup (Optional)

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npm start

# For Android emulator
npm run android

# For iOS simulator (macOS only)
npm run ios
```

---

## 🔧 Environment Configuration

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development
APP_VERSION=2.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/blood-donation-network

# JWT
JWT_SECRET=your_very_long_secret_key_min_32_chars_change_in_prod

# OAuth (Get from provider dashboards)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Frontend
CLIENT_URL=http://localhost:5173

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@bloodnet.app
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

---

## 🗄️ Database Setup

### MongoDB Local

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (Ubuntu)
sudo systemctl start mongod

# Or Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Initialize Sample Data

```bash
cd backend
node scripts/seedData.js
```

---

## 🔐 OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Web: `http://localhost:5000/api/auth/oauth/google/callback`
   - Android: Get SHA-1 from `keytool -list -v -keystore ~/.android/debug.keystore`
   - iOS: Bundle ID `com.bloodnet.mobile`
5. Copy credentials to `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:5000/api/auth/oauth/github/callback`
4. Copy Client ID and Secret to `.env`

### Apple OAuth

1. Go to [Apple Developer](https://developer.apple.com/)
2. Create Service ID with Sign in with Apple
3. Generate private key
4. Add to `.env`

---

## 📦 Deployment

### Backend Deployment (Heroku)

```bash
cd backend

# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Mobile Deployment (EAS)

```bash
cd mobile

# Configure EAS
eas build:configure

# Build for production
eas build --platform all

# Submit to App Stores
eas submit --platform all
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 📊 Project Structure

```
blood-donation-network/
├── backend/                 # Express.js backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, validation
│   ├── services/           # External services
│   └── server.js           # Main server file
├── frontend/               # React web app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # State management
│   │   ├── services/      # API client
│   │   └── App.jsx        # Main component
│   └── package.json
├── mobile/                 # React Native app
│   ├── src/
│   │   ├── screens/       # Screen components
│   │   ├── context/       # State management
│   │   ├── services/      # API client
│   │   └── components/    # Shared components
│   └── App.js             # Entry point
└── docs/                  # Documentation
```

---

## 🔍 Health Checks

### Backend Health

```bash
curl http://localhost:5000/api/health
```

**Expected Response**:

```json
{
  "status": "OK",
  "message": "🩸 Blood Donation Network API is running",
  "version": "2.0.0"
}
```

### Database Connection

```bash
mongo mongodb://localhost:27017/blood-donation-network
> show collections
```

---

## 📱 Features Checklist

### Authentication

- [x] Traditional registration/login
- [x] OAuth (Google, GitHub, Apple)
- [x] OTP verification
- [x] JWT tokens
- [x] Session management

### Blood Requests

- [x] Create/read requests
- [x] AI priority analysis
- [x] Fraud detection
- [x] Respond to requests
- [x] Mark fulfilled

### Blood Inventory

- [x] Track blood units
- [x] Low stock alerts
- [x] Expiry tracking
- [x] Search nearby blood
- [x] Transaction history

### Emergency Alerts

- [x] Create alerts
- [x] Geographic targeting
- [x] Real-time notifications
- [x] Response tracking
- [x] Auto-resolution

### Real-time

- [x] Socket.io notifications
- [x] Live request updates
- [x] Emergency broadcasts
- [x] User presence

### Mobile

- [x] iOS/Android support
- [x] Location services
- [x] Push notifications
- [x] Offline mode
- [x] Document uploads

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process
kill -9 <PID>

# Restart
npm run dev
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongosh

# Or check service status
sudo systemctl status mongod

# Restart if needed
sudo systemctl restart mongod
```

### Frontend Not Loading

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite

# Restart dev server
npm run dev
```

### Mobile Build Issues

```bash
# Clear cache
expo prebuild --clean

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
expo start --clean
```

---

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Mobile Setup Guide](./MOBILE_APP_DEPLOYMENT.md)
- [Production Deployment](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit Pull Request

---

## 📞 Support

- 📧 Email: support@bloodnet.app
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/blood-donation-network/issues)
- 💬 Discord: [Community Server](https://discord.gg/bloodnet)

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file

---

## 🙏 Acknowledgments

- MongoDB for database
- Expo for mobile framework
- React for UI framework
- Socket.io for real-time features

---

**Version**: 2.0.0  
**Last Updated**: 2026-04-25  
**Maintainer**: Blood Donation Network Team
