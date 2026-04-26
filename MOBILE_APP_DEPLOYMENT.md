# Blood Donation Network - Mobile App Setup & Deployment Guide

## 📱 Overview

The BloodNet Mobile App is built with React Native + Expo for cross-platform support on iOS and Android. This guide covers setup, development, and production deployment.

## ✅ Prerequisites

- Node.js >= 16.0.0
- Expo CLI: `npm install -g expo-cli`
- Xcode (for iOS development on macOS)
- Android Studio (for Android development)
- EAS CLI: `npm install -g eas-cli`

## 🚀 Quick Start

### 1. Setup Project

```bash
cd mobile
npm install
```

### 2. Development Environment

#### Start Development Server

```bash
npm start
# or
expo start
```

#### Run on Android

```bash
npm run android
# or
expo start --android
```

#### Run on iOS (macOS only)

```bash
npm run ios
# or
expo start --ios
```

#### Run on Web

```bash
npm run web
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in the `mobile` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_APPLE_CLIENT_ID=com.bloodnet.mobile
REACT_APP_WEB_CLIENT_ID=your_web_client_id
```

### OAuth Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth credentials for:
   - Web application
   - Android app
   - iOS app
3. Add credentials to `.env`

#### Apple OAuth

1. Create App ID in [Apple Developer](https://developer.apple.com/)
2. Configure Sign in with Apple capability
3. Generate private key and add to backend `.env`

## 📦 Building for Production

### EAS Build Setup

1. Initialize EAS project:

```bash
eas build:configure
```

2. Create `eas.json`:

```json
{
  "build": {
    "production": {
      "node": "18.13.0",
      "env": {
        "REACT_APP_API_URL": "https://api.bloodnet.app"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json"
      }
    }
  }
}
```

### Build for Android

#### Generate Upload Key

```bash
# Generate keystore (one-time)
keytool -genkey-pair -v -keystore ./android/bloodnet-upload-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 -alias bloodnet-key

# Store credentials securely
```

#### Build Android APK/AAB

```bash
# Using EAS (recommended)
eas build --platform android --auto-submit

# Or manually with Gradle
cd android
./gradlew assembleRelease
```

### Build for iOS

#### Prerequisites

- Apple Developer Account ($99/year)
- Valid provisioning profiles and certificates

#### Build with EAS

```bash
eas build --platform ios --auto-submit

# Or for both platforms
eas build --platform all --auto-submit
```

#### Manual iOS Build

```bash
# Generate iOS build files
expo prebuild --clean

# Build with Xcode
cd ios
xcodebuild -workspace BloodNetMobile.xcworkspace \
  -scheme BloodNetMobile \
  -configuration Release \
  -derivedDataPath build
```

## 📲 App Store & Play Store Submission

### Google Play Store

1. Create Google Play Developer account ($25 one-time)
2. Create app entry
3. Upload AAB file
4. Configure store listing (screenshots, description, etc.)
5. Submit for review (24-48 hours)

```bash
# With EAS (automatic)
eas submit --platform android
```

### Apple App Store

1. Create Apple Developer account ($99/year)
2. Create app in App Store Connect
3. Upload IPA/build
4. Configure store listing
5. Submit for review (1-3 days)

```bash
# With EAS (automatic)
eas submit --platform ios
```

## 🔐 Security Best Practices

### API Endpoints

- Use HTTPS for all API calls
- Implement certificate pinning in production
- Validate SSL certificates

### Local Storage

- Encrypt sensitive data stored in AsyncStorage
- Use `react-native-keychain` for tokens

```javascript
import * as SecureStore from 'expo-secure-store'

// Store token securely
await SecureStore.setItemAsync('userToken', token)

// Retrieve token
const token = await SecureStore.getItemAsync('userToken')
```

### Permissions

- Request permissions at runtime
- Handle permission denials gracefully
- Be transparent about why permissions are needed

```javascript
import * as Location from 'expo-location'

const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync()
  return status === 'granted'
}
```

## 🔔 Push Notifications

### Expo Push Notifications

1. Get Expo Push Token

```javascript
import * as Notifications from 'expo-notifications'

async function registerForPushNotificationsAsync() {
  const token = (await Notifications.getExpoPushTokenAsync()).data
  return token
}
```

2. Send from Backend

```javascript
const ExpoSDK = require('expo-server-sdk').Expo

const expo = new ExpoSDK()

await expo.sendPushNotificationsAsync([
  {
    to: pushToken,
    sound: 'default',
    title: 'New Blood Request',
    body: 'O+ blood needed urgently at City Hospital',
    data: { requestId: 'req_123' },
  },
])
```

## 🗺️ Location Services

```javascript
import * as Location from 'expo-location'

const getCurrentLocation = async () => {
  try {
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    })
    return { lat: coords.latitude, lng: coords.longitude }
  } catch (error) {
    console.error('Location error:', error)
  }
}
```

## 📸 Image & Document Upload

```javascript
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  })
  return result.assets[0]
}

const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.fileName,
  })
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

## 📊 Performance Optimization

- Use `FlatList` instead of `ScrollView` for long lists
- Implement image caching with `react-native-fast-image`
- Use `React.memo` for component memoization
- Profile with React DevTools

## 🐛 Debugging

### Console Logs

```javascript
console.log('Debug:', data)
console.error('Error:', error)
```

### React DevTools

```bash
# Install in app
npm install --save-dev @react-native-community/eslint-config

# Debug in VS Code
# Install React Native Tools extension
```

### Expo DevTools

Press `d` in Expo CLI to open DevTools menu

## 📚 Additional Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [React Navigation Docs](https://reactnavigation.org/)

## 🤝 Support

For issues and questions:

1. Check [GitHub Issues](https://github.com/your-repo/issues)
2. Review [FAQ](#faq)
3. Create new issue with reproduction steps

## 📝 Version History

- v1.0.0 - Initial release with core features
- v1.1.0 - Added real-time notifications
- v1.2.0 - Added offline support

---

**Last Updated**: 2026-04-25  
**Maintainer**: Blood Donation Network Team
