# 🩸 Blood Donation Network - AI-Powered Emergency Blood Donation Platform

A production-grade, full-stack blood donation network connecting donors and recipients in real-time with AI-powered fraud detection, emergency alerts, and inventory management.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Web%2BiOS%2BAndroid-brightgreen.svg)

## ✨ Key Features

### 🔐 Authentication

- **Traditional**: Email/password with OTP verification
- **OAuth**: Google, GitHub, Apple Sign-in
- **Security**: JWT tokens, HTTPS, rate limiting, fraud detection

### 🩸 Blood Requests

- Real-time blood request posting
- AI-powered priority analysis
- Fraud detection system
- Geographic matching
- Donor response tracking
- Request fulfillment management

### 📱 Mobile Apps

- **iOS & Android**: React Native with Expo
- **Location Services**: GPS-based donor/hospital finder
- **Push Notifications**: Instant alerts for blood requests
- **Document Upload**: Medical verification
- **Offline Support**: Works without internet

### 🌐 Web Platform

- **Responsive Design**: Apple-inspired UI with Tailwind CSS
- **Real-time Updates**: Socket.io live notifications
- **Dark Mode**: System theme support
- **Dashboard**: Analytics and request tracking

### 🩸 Blood Inventory Management

- Real-time inventory tracking
- Low/critical stock alerts
- Expiry date monitoring
- Transaction history
- Nearby blood bank finder
- Multi-facility support

### 🚨 Emergency Alerts

- Create emergency alerts for disasters/shortages
- Geographic targeting with radius
- Real-time donor notifications
- Response tracking and analytics
- Auto-resolution when fulfilled

### 🔔 Real-Time Features

- Socket.io notifications
- Live request broadcasts
- Emergency alert updates
- User presence tracking
- Instant messenger

### 🤖 AI-Powered Features

- **Fraud Detection**: Suspicious activity identification
- **Priority Analysis**: Request urgency classification
- **Trust Scoring**: Donor reliability ranking
- **Predictive Analytics**: Blood demand forecasting

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Applications                 │
├──────────────────┬──────────────────┬──────────────────┐
│    Web App       │   iOS App        │   Android App    │
│   (React)        │  (React Native)  │  (React Native)  │
└─────────┬────────┴────────┬─────────┴────────┬────────┘
          │                 │                   │
          └─────────────────┼───────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Express.js    │
                    │  Backend API   │
                    ├────────────────┤
                    │  Routes        │
                    │  Controllers   │
                    │  Middleware    │
                    │  Services      │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼──────┐  ┌────────▼─────┐  ┌─────────▼──┐
   │ MongoDB   │  │  Socket.io   │  │  External  │
   │ Database  │  │  Real-time   │  │  Services  │
   └───────────┘  └──────────────┘  └────────────┘
```

---

## 📋 Tech Stack

### Backend

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, OAuth 2.0 (Google, GitHub, Apple)
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Rate Limiting, Mongo Sanitize
- **Payments**: Stripe, Razorpay
- **SMS**: Twilio
- **Email**: SendGrid
- **Cloud**: AWS S3
- **Monitoring**: Sentry

### Frontend (Web)

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State**: Context API
- **Notifications**: React Hot Toast

### Mobile

- **Framework**: React Native
- **Platform**: Expo
- **Navigation**: React Navigation
- **Location**: Expo Location
- **Maps**: React Native Maps
- **Storage**: AsyncStorage
- **Auth**: Expo AuthSession

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 5.0
- npm >= 8.0.0

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/blood-donation-network.git
cd blood-donation-network

# Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# Frontend Setup (in another terminal)
cd frontend
npm install
cp .env.example .env
npm run dev

# Mobile Setup (optional, in another terminal)
cd mobile
npm install
npm start
```

### Access Points

- **Web App**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs
- **Mobile**: Available through Expo

---

## 📖 Documentation

| Document                                                  | Description                            |
| --------------------------------------------------------- | -------------------------------------- |
| [Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md)         | Full installation and configuration    |
| [API Documentation](./API_DOCUMENTATION.md)               | REST API endpoints and usage           |
| [Mobile App Guide](./MOBILE_APP_DEPLOYMENT.md)            | iOS/Android development and deployment |
| [Production Deployment](./PRODUCTION_DEPLOYMENT_GUIDE.md) | Deploy to production environments      |
| [Migration Guide](./MIGRATION_GUIDE.md)                   | Database migrations and updates        |

---

## 🎯 Use Cases

### For Donors

- Find blood requests near you
- Respond to emergency alerts
- Track donation history
- Build trust score
- Earn rewards/badges

### For Receivers

- Post urgent blood requests
- View available donors
- Receive real-time responses
- Emergency alert system
- Hospital partnerships

### For Blood Banks

- Manage blood inventory
- Track expiry dates
- Low stock alerts
- Fulfill requests
- Analytics dashboard

### For Hospitals

- Emergency alert creation
- Blood inventory integration
- Donor network access
- Request management
- Supply chain optimization

---

## 📊 API Endpoints

### Authentication

```
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login user
GET    /api/auth/oauth/google     - Google OAuth
GET    /api/auth/oauth/github     - GitHub OAuth
GET    /api/auth/oauth/apple      - Apple OAuth
POST   /api/auth/verify-otp       - Verify OTP
GET    /api/auth/profile          - Get user profile
```

### Blood Requests

```
POST   /api/requests              - Create blood request
GET    /api/requests              - Get all requests
GET    /api/requests/:id          - Get request details
POST   /api/requests/:id/respond  - Respond to request
POST   /api/requests/:id/fulfill  - Mark fulfilled
```

### Blood Inventory

```
GET    /api/inventory/summary/:facilityId       - Get summary
GET    /api/inventory/critical/:facilityId      - Check critical stock
POST   /api/inventory/update/:facilityId        - Update inventory
POST   /api/inventory/search                    - Search nearby blood
```

### Emergency Alerts

```
POST   /api/emergency-alerts                    - Create alert
GET    /api/emergency-alerts/active             - Get active alerts
POST   /api/emergency-alerts/nearby             - Nearby alerts
POST   /api/emergency-alerts/:id/respond        - Respond to alert
POST   /api/emergency-alerts/:id/resolve        - Resolve alert
```

---

## 🔐 Security Features

- ✅ JWT authentication with 7-day expiry
- ✅ OAuth 2.0 integration
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Rate limiting (200 req/15min global, 30 req/15min auth)
- ✅ NoSQL injection prevention
- ✅ XSS protection (Helmet)
- ✅ HTTPS enforcement in production
- ✅ Fraud detection system
- ✅ Admin verification for sensitive operations

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Mobile tests
cd mobile
npm test
```

---

## 📱 Mobile Screenshots

| Screen           | Feature               |
| ---------------- | --------------------- |
| Login            | OAuth sign-in         |
| Home             | Blood requests nearby |
| Emergency Alerts | Real-time alerts      |
| Inventory        | Blood stock finder    |
| Dashboard        | User statistics       |
| Profile          | Donation history      |

---

## 🚀 Deployment

### Backend (Heroku/Railway)

```bash
cd backend
git push heroku main
```

### Frontend (Vercel/Netlify)

```bash
cd frontend
vercel
```

### Mobile (EAS)

```bash
cd mobile
eas build --platform all
eas submit --platform all
```

[Full Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)

---

## 📊 Performance Metrics

- **API Response Time**: < 200ms (p95)
- **Database Query Time**: < 100ms
- **Frontend Load Time**: < 3s
- **Real-time Latency**: < 100ms
- **Uptime SLA**: 99.9%

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📈 Roadmap

### v2.1.0 (Coming Soon)

- [ ] AI chat support
- [ ] Advanced analytics
- [ ] Blood bank API
- [ ] Multi-language support

### v2.2.0 (Q3 2026)

- [ ] Video verification
- [ ] Blockchain records
- [ ] Telemedicine integration
- [ ] Insurance partnerships

### v3.0.0 (Q4 2026)

- [ ] Machine learning predictions
- [ ] IoT blood bank sensors
- [ ] Advanced scheduling
- [ ] Global expansion

---

## 📞 Support & Community

- 📧 **Email**: support@bloodnet.app
- 💬 **Discord**: [Join Community](https://discord.gg/bloodnet)
- 🐛 **Issues**: [Report Bugs](https://github.com/your-org/blood-donation-network/issues)
- 📖 **Wiki**: [Knowledge Base](https://github.com/your-org/blood-donation-network/wiki)

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 👥 Team

- **Lead Developer**: [Your Name]
- **UI/UX Designer**: [Designer Name]
- **Product Manager**: [PM Name]
- **Medical Advisor**: [Doctor Name]

---

## 🙏 Acknowledgments

Special thanks to:

- MongoDB for database
- Expo team for mobile framework
- React community
- Socket.io contributors
- All our contributors

---

## 📊 Stats

- ⭐ **Stars**: ![GitHub stars](https://img.shields.io/github/stars/your-org/blood-donation-network)
- 🍴 **Forks**: ![GitHub forks](https://img.shields.io/github/forks/your-org/blood-donation-network)
- 👥 **Contributors**: 20+
- 📦 **Dependencies**: 100+
- 📄 **Lines of Code**: 50,000+

---

**Made with ❤️ to save lives**

Version 2.0.0 | Last Updated: April 25, 2026
