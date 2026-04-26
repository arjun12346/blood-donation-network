# 📱 Install BloodNet on Your Mobile Device

## ✅ Current Status

| Service      | Status       | URL                       |
| ------------ | ------------ | ------------------------- |
| Backend API  | ✅ Running   | http://localhost:5000     |
| Frontend Web | ✅ Running   | http://localhost:5174     |
| MongoDB      | ✅ Connected | mongodb://localhost:27017 |

---

## 🚀 Method 1: Expo Go (Fastest - 2 Minutes)

**No APK build needed. Test immediately.**

### Step 1: Install Expo Go

- **Android**: Download "Expo Go" from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: Download "Expo Go" from [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Step 2: Start Expo Dev Server

Open a new terminal and run:

```bash
cd "C:\Users\Arjun Yadav\Downloads\blood-donation-network (1)\mobile"
npx expo start
```

### Step 3: Scan QR Code

- A QR code will appear in the terminal
- Open **Expo Go** app on your phone
- Tap **"Scan QR Code"**
- Point camera at the terminal QR code
- The BloodNet app will load instantly!

### Step 4: Test the App

- Register a new account
- Login
- Create a blood request
- View donor leaderboard
- Test dark mode toggle

---

## 📦 Method 2: Install APK Directly (Android Only)

### Option A: Build APK Locally (Requires Java 17)

Your system has **Java 25** which is too new for Android Gradle. You need **Java 17**:

1. **Download Java 17**:

   ```
   https://www.oracle.com/java/technologies/downloads/#java17
   ```

   Download: `jdk-17_windows-x64_bin.exe`

2. **Install Java 17** (keep Java 25 too)

3. **Set JAVA_HOME for build**:

   ```cmd
   set JAVA_HOME=C:\Program Files\Java\jdk-17
   set PATH=%JAVA_HOME%\bin;%PATH%
   ```

4. **Build APK**:

   ```bash
   cd "C:\Users\Arjun Yadav\Downloads\blood-donation-network (1)\mobile\android"
   .\gradlew assembleRelease
   ```

5. **Find APK**:

   ```
   .\mobile\android\app\build\outputs\apk\release\app-release.apk
   ```

6. **Transfer to phone**:
   - USB cable: Copy APK to Downloads folder
   - Or: `adb install app-release.apk`

7. **Install on phone**:
   - Open File Manager → Downloads
   - Tap `app-release.apk`
   - Allow "Install from unknown sources"
   - BloodNet is installed! 🎉

### Option B: EAS Cloud Build (No Java Needed)

1. **Create Expo account**:

   ```bash
   cd "C:\Users\Arjun Yadav\Downloads\blood-donation-network (1)\mobile"
   eas login
   ```

   Or signup at: https://expo.dev/signup

2. **Build APK in cloud**:

   ```bash
   eas build --platform android --profile preview
   ```

3. **Download APK**:
   - EAS will provide a download link
   - Download on your phone and install

---

## 🔧 Method 3: ADB Install (For Developers)

If you have Android Debug Bridge:

```bash
# Connect phone via USB (enable USB debugging in Developer Options)
adb devices
adb install -r ".\mobile\android\app\build\outputs\apk\release\app-release.apk"
```

---

## 🌐 Method 4: Web App (No Install Needed)

Open in mobile browser:

```
http://localhost:5174
```

Or if on same WiFi network, find your PC's IP:

```cmd
ipconfig
```

Then open: `http://YOUR_PC_IP:5174`

Add to Home Screen for app-like experience.

---

## 🧪 Testing Checklist

Once installed, test these features:

- [ ] Register new account
- [ ] Login with email/password
- [ ] Toggle dark mode
- [ ] Create blood request
- [ ] View donor leaderboard
- [ ] Check trust score system
- [ ] Test responsive design
- [ ] Verify AI urgency badges

---

## 🆘 Troubleshooting

### "Cannot connect to server"

- Make sure backend is running: `curl http://localhost:5000/api/health`
- Check Windows Firewall isn't blocking port 5000

### "Expo Go can't find development server"

- Make sure phone and PC are on same WiFi
- Try: `npx expo start --tunnel` (uses internet tunnel)

### "APK install blocked"

- Settings → Security → Allow Unknown Sources
- Or: Settings → Apps → Special Access → Install Unknown Apps

### "Java version error when building"

- Install Java 17 (see Method 2, Option A)
- Or use EAS cloud build (Method 2, Option B)

---

## 📞 Quick Commands Reference

```bash
# Start Backend
cd "blood-donation-network\backend" && npm run dev

# Start Frontend
cd "blood-donation-network\frontend" && npm run dev

# Start Mobile (Expo)
cd "mobile" && npx expo start

# Build APK (requires Java 17)
cd "mobile\android" && .\gradlew assembleRelease

# Health Check
curl http://localhost:5000/api/health
```

---

**Recommended**: Start with **Method 1 (Expo Go)** for immediate testing, then use **Method 2B (EAS Cloud)** for the final APK.
