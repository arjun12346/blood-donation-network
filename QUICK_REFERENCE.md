# 🩸 Blood Donation Network - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### 1. Install Everything

```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..

# Mobile
cd mobile && npm install && cd ..
```

### 2. Setup Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URL and OAuth credentials

# Frontend
cd ../frontend
cp .env.example .env
# Update VITE_API_URL if needed

# Mobile
cd ../mobile
cp .env.example .env
# Update REACT_APP_API_URL if needed
```

### 3. Start All Services

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - Mobile (optional)
cd mobile && npm start
```

### 4. Access the App

- **Web**: http://localhost:5173
- **API**: http://localhost:5000/api
- **Mobile**: Scan Expo QR code

---

## 🔐 OAuth Setup (10 Minutes)

### Google OAuth

```
1. Go to https://console.cloud.google.com
2. Create new project: "Blood Donation Network"
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web app)
5. Add redirect: http://localhost:5000/api/auth/oauth/google/callback
6. Copy Client ID & Secret to backend/.env
```

### GitHub OAuth

```
1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Authorization callback URL: http://localhost:5000/api/auth/oauth/github/callback
4. Copy Client ID & Secret to backend/.env
```

### Apple OAuth

```
1. Go to https://developer.apple.com
2. Register your domain
3. Create Sign in with Apple key
4. Download private key
5. Add to backend/.env (APPLE_PRIVATE_KEY, APPLE_KEY_ID, APPLE_TEAM_ID)
```

---

## 🗂️ Project Structure at a Glance

```
backend/
  ├── models/          [Database schemas]
  ├── routes/          [API endpoints]
  ├── middleware/      [Passport OAuth, Auth, etc]
  ├── server.js        [Main app + Socket.io]
  └── .env             [Secrets & config]

frontend/
  ├── src/
  │   ├── pages/       [Route pages]
  │   ├── components/  [Reusable components]
  │   ├── context/     [State management]
  │   └── services/    [API calls]
  └── .env             [Config]

mobile/
  ├── App.js           [Main entry]
  ├── src/
  │   ├── screens/     [App screens]
  │   ├── context/     [State management]
  │   └── services/    [API calls]
  └── .env             [Config]
```

---

## 📡 API Endpoints at a Glance

### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-otp
GET    /api/auth/profile
POST   /api/auth/logout

GET    /api/auth/oauth/google
GET    /api/auth/oauth/github
GET    /api/auth/oauth/apple
GET    /api/auth/oauth/google/callback
GET    /api/auth/oauth/github/callback
GET    /api/auth/oauth/apple/callback
```

### Blood Requests

```
POST   /api/requests           [Create]
GET    /api/requests           [List]
GET    /api/requests/:id       [Get one]
PUT    /api/requests/:id       [Update]
POST   /api/requests/:id/respond [Respond]
```

### Blood Inventory

```
GET    /api/inventory/summary/:facilityId
GET    /api/inventory/critical/:facilityId
GET    /api/inventory/expiring/:facilityId?days=7
POST   /api/inventory/update/:facilityId
POST   /api/inventory/search
```

### Emergency Alerts

```
POST   /api/emergency-alerts
GET    /api/emergency-alerts/active
POST   /api/emergency-alerts/nearby
POST   /api/emergency-alerts/:id/respond
POST   /api/emergency-alerts/:id/resolve
```

### Donors

```
GET    /api/donors              [List all]
GET    /api/donors/nearby       [Nearby donors]
GET    /api/donors/:id          [Get one]
PUT    /api/donors/:id          [Update]
```

---

## 🔌 Socket.io Events

### Client to Server

```javascript
socket.emit('join-room', userId)
socket.emit('leave-room', userId)
```

### Server to Client

```javascript
// Emergency alert broadcast
socket.on('emergency-alert', { alert })

// Alert response broadcast
socket.on('alert-response', { alertId, respondent })

// Alert resolved
socket.on('alert-resolved', { alertId })

// Generic notification
socket.on('notification', { message, type })
```

### Usage Example

```javascript
// Client
socket.emit('join-room', 'user-123')

// Server
io.on('connection', (socket) => {
  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`)
  })
})

// Broadcast to specific user
io.to(`user-${userId}`).emit('notification', data)
```

---

## 🧪 Testing Quick Commands

### Test Backend Health

```bash
curl http://localhost:5000/api/health
```

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test Blood Requests

```bash
# Get all requests
curl http://localhost:5000/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create request
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bloodGroup": "O+",
    "unitsNeeded": 2,
    "location": "Hospital Name",
    "urgency": "urgent"
  }'
```

### Test Inventory

```bash
# Get inventory summary
curl http://localhost:5000/api/inventory/summary/facility-123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check critical stock
curl http://localhost:5000/api/inventory/critical/facility-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Emergency Alerts

```bash
# Create emergency alert
curl -X POST http://localhost:5000/api/emergency-alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Emergency Blood Shortage",
    "description": "Urgent need for O+ blood",
    "severity": "critical",
    "location": {"city": "Bangalore", "lat": 12.9, "lng": 77.6},
    "bloodRequirements": [{"bloodGroup": "O+", "unitsNeeded": 10}]
  }'
```

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'express'"

**Solution**: Run `npm install` in the appropriate directory

### Issue: "Connection refused to MongoDB"

**Solution**:

```bash
# Check MongoDB is running
mongod --version
# Start MongoDB
mongod --dbpath ./data
```

### Issue: "OAuth credentials invalid"

**Solution**:

- Double-check credentials in `.env`
- Verify redirect URLs match exactly in OAuth console
- Clear browser cache and cookies

### Issue: "Socket.io connection failed"

**Solution**:

- Check backend is running
- Verify CORS settings in server.js
- Check firewall isn't blocking port 5000

### Issue: "Mobile app can't reach backend"

**Solution**:

- Update API_URL in mobile/.env
- Check backend URL is accessible from your network
- For Android emulator: use 10.0.2.2:5000 instead of localhost

### Issue: "JSX syntax errors in frontend"

**Solution**:

- Check all closing tags match
- Run `npm run dev` to see specific errors
- Use VS Code's error highlighting

---

## 📦 Environment Variables Checklist

### Backend `.env` (Minimum Required)

```
MONGODB_URI=mongodb://localhost:27017/blood-donation-network
JWT_SECRET=your_secret_key_min_32_chars_long
NODE_ENV=development
PORT=5000

# OAuth (optional but recommended)
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
```

### Frontend `.env` (Minimum Required)

```
VITE_API_URL=http://localhost:5000/api
```

### Mobile `.env` (Minimum Required)

```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🔄 Development Workflow

### Adding a New API Endpoint

1. **Create Model** (if needed)

   ```javascript
   // backend/models/YourModel.js
   const schema = new Schema({...})
   module.exports = mongoose.model('YourModel', schema)
   ```

2. **Create Route**

   ```javascript
   // backend/routes/yourRoutes.js
   router.post('/', async (req, res) => {
     try {
       const item = new YourModel(req.body)
       await item.save()
       res.json(item)
     } catch (err) {
       res.status(400).json({ error: err.message })
     }
   })
   ```

3. **Register Route**

   ```javascript
   // backend/server.js
   app.use('/api/your-endpoint', require('./routes/yourRoutes'))
   ```

4. **Test**
   ```bash
   curl http://localhost:5000/api/your-endpoint
   ```

### Adding a New Frontend Page

1. **Create Component**

   ```javascript
   // frontend/src/pages/YourPage.jsx
   export default function YourPage() {
     return <div>Your content</div>
   }
   ```

2. **Add Route**

   ```javascript
   // frontend/src/App.jsx
   import YourPage from './pages/YourPage'
   // In router: <Route path="/your-page" element={<YourPage />} />
   ```

3. **Test**
   - Go to http://localhost:5173/your-page

---

## 🛠️ Debug Mode

### Backend Debug

```bash
cd backend
DEBUG=* npm run dev        # Show all debug messages
NODE_ENV=development npm run dev  # Dev mode
```

### Frontend Debug

```bash
cd frontend
npm run dev -- --debug     # Enable debug mode
```

### Mobile Debug

```bash
cd mobile
npm start -- --clear       # Clear cache
```

---

## 📊 File Sizes Reference

| Component | Size   | Time to Install |
| --------- | ------ | --------------- |
| Backend   | 150 MB | 2 min           |
| Frontend  | 500 MB | 3 min           |
| Mobile    | 800 MB | 5 min           |
| MongoDB   | Varies | Varies          |

---

## 🎯 Success Indicators

✅ Backend running:

```
✓ Server listening on port 5000
✓ Connected to MongoDB
✓ Routes registered: /api/auth, /api/requests, etc
```

✅ Frontend running:

```
✓ Vite dev server running on port 5173
✓ Page loads without errors
✓ Can navigate to different pages
```

✅ Mobile running:

```
✓ Expo server started
✓ QR code displays
✓ App loads in Expo app
```

✅ OAuth working:

```
✓ Can click "Sign in with Google"
✓ Redirects to Google login
✓ Returns to app with token
```

✅ Inventory working:

```
✓ Can create inventory entries
✓ Can query blood levels
✓ Alerts trigger on low stock
```

✅ Emergency Alerts working:

```
✓ Can create emergency alert
✓ Donors receive notification
✓ Responses tracked in real-time
```

---

## 📞 Getting Help

1. **Check Documentation**: See FILES_INDEX.md for all docs
2. **Check API_DOCUMENTATION.md**: For endpoint details
3. **Check COMPLETE_SETUP_GUIDE.md**: For setup issues
4. **Check error logs**: Look at terminal output
5. **Check network**: Verify ports 5000, 5173 are not blocked

---

## 🚀 Deployment Checklist

- [ ] All `.env` variables filled with production values
- [ ] MongoDB production instance setup
- [ ] OAuth credentials verified
- [ ] Backend deployed to production
- [ ] Frontend deployed to production
- [ ] Mobile app built and uploaded to App Stores
- [ ] DNS configured
- [ ] SSL certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring/logging configured
- [ ] Rate limiting tested
- [ ] Load testing completed

---

## 📝 Quick Notes

- **Default Admin**: Check backend/.env for ADMIN_EMAIL
- **Database**: MongoDB must be running on port 27017
- **Ports**: Backend (5000), Frontend (5173), Mobile (19000)
- **Token Expiry**: 7 days by default
- **Rate Limit**: 200 requests per 15 min globally, 30 for auth
- **Timezone**: Store all dates in UTC

---

## 🎉 You're All Set!

Start with the Quick Start section above, and refer to full documentation as needed.

**Happy coding!** 🚀

---

_Last Updated: April 25, 2026_  
_Version: 2.0.0_  
_Status: Production Ready ✅_
