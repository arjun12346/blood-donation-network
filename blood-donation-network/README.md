# 🩸 BloodNet — AI-Powered Emergency Blood Donation Network

> A hackathon-ready full-stack web application connecting blood donors and receivers in emergencies, powered by AI classification logic.

---

## 🎯 Features

- **AI Urgency Detection** — Classifies requests as HIGH / MEDIUM / LOW based on keywords (ICU, accident, surgery, etc.)
- **AI Fake Detection** — Flags spam, repeated patterns, suspicious users (SAFE / MEDIUM / HIGH RISK)
- **JWT Authentication** — Secure login/register with OTP verification (mock)
- **Donor Trust Score** — Points-based trust system (New → Trusted)
- **Phone Hiding** — HIGH RISK requests hide phone numbers automatically
- **Report System** — Community-driven fake request flagging
- **Real-time Notifications** — Donors notified on matching blood requests
- **Dark Mode** — Full dark/light theme toggle
- **Responsive UI** — Mobile-first Tailwind CSS design
- **Donor Leaderboard** — Top donors ranked by donations + trust

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| HTTP Client | Axios |

---

## 🚀 Quick Setup (5 Minutes)

### Prerequisites
- Node.js v16+ installed
- MongoDB running locally OR MongoDB Atlas URI

---

### 1. Clone / Extract the Project

```bash
cd blood-donation-network
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file (already included as `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blood-donation
JWT_SECRET=bloodnet_super_secret_key_2024
CLIENT_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
# OR
npm start
```

> ✅ Server starts at http://localhost:5000
> ✅ Demo data auto-seeds on first run

---

### 3. Setup Frontend

```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```

> ✅ App opens at http://localhost:5173

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Trust |
|------|-------|----------|-------|
| 🩸 Donor | ravi@demo.com | demo1234 | Trusted |
| 🩸 Donor | deepak@demo.com | demo1234 | Trusted (5 donations) |
| 💉 Receiver | amit@demo.com | demo1234 | Moderate |
| 💉 Receiver | sunita@demo.com | demo1234 | New |

---

## 📁 Project Structure

```
blood-donation-network/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, OTP, Profile
│   │   ├── requestController.js   # CRUD + AI analysis
│   │   └── donorController.js     # Donor list, leaderboard
│   ├── middleware/
│   │   └── auth.js                # JWT verification
│   ├── models/
│   │   ├── User.js                # User schema with trust system
│   │   └── BloodRequest.js        # Request schema with AI fields
│   ├── routes/
│   │   ├── auth.js
│   │   ├── requests.js
│   │   └── donors.js
│   ├── utils/
│   │   ├── aiEngine.js            # 🤖 AI fake + urgency detection
│   │   └── seedData.js            # Demo data seeder
│   ├── .env
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── RequestCard.jsx        # Blood request card with AI badges
        │   ├── CreateRequestModal.jsx # 3-step request form with AI preview
        │   ├── StatsBar.jsx
        │   ├── OTPVerification.jsx
        │   └── LoadingSpinner.jsx
        ├── context/
        │   ├── AuthContext.jsx        # Global auth state
        │   └── ThemeContext.jsx       # Dark mode
        ├── pages/
        │   ├── Home.jsx              # Hero + features landing page
        │   ├── Dashboard.jsx         # Main requests feed
        │   ├── Login.jsx
        │   ├── Register.jsx          # 3-step registration
        │   ├── MyRequests.jsx        # User's own requests
        │   ├── Donors.jsx            # Donor list + leaderboard
        │   └── Profile.jsx           # Settings + notifications
        ├── services/
        │   └── api.js                # Axios instance
        ├── App.jsx
        └── main.jsx
```

---

## 🤖 AI Engine Logic

### Fake Detection (`utils/aiEngine.js`)

| Condition | Risk Added |
|-----------|-----------|
| Repeated spam words ("urgent urgent") | +25 |
| New user + urgent language | +20 |
| 3+ requests in 1 hour | +35 |
| Message < 15 characters | +20 |
| Money-related words | +30 |
| Known risk user | +40 |
| Verified/trusted user | -15 |

**Output:** `SAFE` / `MEDIUM` / `HIGH`

### Urgency Detection

| Keywords | Priority |
|----------|----------|
| accident, ICU, stroke, hemorrhage, coma | HIGH |
| hospitalized, needed today, admitted | MEDIUM |
| routine, next week, planned | LOW |

**Output:** `HIGH` / `MEDIUM` / `LOW`

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| POST | /api/auth/verify-otp | Verify phone OTP |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/profile | Update profile |
| POST | /api/auth/donation-success | Record donation |
| GET | /api/auth/notifications | Get notifications |

### Blood Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/requests | Get all requests (filters/sort) |
| POST | /api/requests | Create request (AI analyzed) |
| GET | /api/requests/my | My requests |
| GET | /api/requests/stats | Platform statistics |
| POST | /api/requests/:id/report | Report request |
| POST | /api/requests/:id/respond | Respond as donor |
| POST | /api/requests/:id/fulfill | Mark fulfilled |

### Donors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/donors | List donors |
| GET | /api/donors/leaderboard | Top donors |

---

## 🏆 Hackathon Highlights

1. **AI Integration** — Real working classification logic, not just UI
2. **Safety First** — Phone hiding, report system, trust scores
3. **Full-Stack** — Complete backend + frontend + database
4. **Demo Ready** — Auto-seeded data, demo accounts
5. **Production Quality** — Rate limiting, JWT auth, error handling
6. **Beautiful UI** — Dark mode, animations, responsive design

---

Built with ❤️ for hackathon — **BloodNet 2024**
