# Mobile App Setup Guide (React Native & Flutter)

## 📱 Option 1: React Native (Recommended for Quick Launch)

### Project Setup

```bash
# Create React Native project
npx react-native init BloodDonationApp

cd BloodDonationApp

# Install essential dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install axios react-native-geolocation-service
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install react-native-twilio-video-webrtc
npm install react-native-maps
npm install redux react-redux redux-thunk
npm install react-native-toast-message
npm install react-native-keychain
```

### Directory Structure

```
BloodDonationApp/
├── src/
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── OTPScreen.js
│   │   │   └── KYCScreen.js
│   │   ├── Home/
│   │   │   ├── Dashboard.js
│   │   │   ├── BloodRequestMap.js
│   │   │   └── RequestDetails.js
│   │   ├── Donation/
│   │   │   ├── CreateRequestScreen.js
│   │   │   ├── DonationStatus.js
│   │   │   └── CallScreen.js
│   │   ├── Profile/
│   │   │   ├── ProfileScreen.js
│   │   │   ├── SettingsScreen.js
│   │   │   └── KYCStatus.js
│   │   └── Admin/
│   │       ├── AdminDashboard.js
│   │       └── FraudReview.js
│   ├── components/
│   │   ├── RequestCard.js
│   │   ├── DonorCard.js
│   │   ├── StatusBadge.js
│   │   └── LocationPicker.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── locationService.js
│   │   ├── callService.js
│   │   └── notificationService.js
│   ├── redux/
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── requestsSlice.js
│   │   │   └── notificationSlice.js
│   │   ├── store.js
│   │   └── rootReducer.js
│   ├── navigation/
│   │   ├── RootNavigator.js
│   │   ├── AuthStack.js
│   │   └── AppStack.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── styles/
│   │   ├── theme.js
│   │   └── colors.js
│   ├── App.js
│   └── index.js
├── android/
├── ios/
├── .env
├── package.json
└── README.md
```

### Key Files

**src/services/api.js**

```javascript
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.blooddonationnetwork.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      // Refresh token logic here
    }
    return Promise.reject(error)
  }
)

export default api
```

**src/services/locationService.js**

```javascript
import Geolocation from 'react-native-geolocation-service'
import { PermissionsAndroid, Platform } from 'react-native'

export const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    return true
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Blood Donation Network needs access to your location',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    )
    return granted === PermissionsAndroid.RESULTS.GRANTED
  } catch (err) {
    return false
  }
}

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
  })
}
```

**src/screens/Auth/OTPScreen.js**

```javascript
import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native'
import api from '../../services/api'

export default function OTPScreen({ route, navigation }) {
  const { phoneNumber } = route.params
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const timerRef = useRef(null)

  React.useEffect(() => {
    // Start resend timer
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [])

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/verify-otp', { otp })
      navigation.replace('Home', {
        user: response.data.user,
        token: response.data.token,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      await api.post('/auth/resend-otp')
      setResendTimer(60)
      setOtp('')
      setError('')
    } catch (err) {
      setError('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {phoneNumber}</Text>

        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor="#999"
          keyboardType="numeric"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendOTP} disabled={resendTimer > 0}>
          <Text style={styles.resendText}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#e74c3c',
    marginBottom: 10,
  },
  resendText: {
    color: '#3498db',
    textAlign: 'center',
    marginTop: 10,
  },
})
```

### Android Setup

**android/app/build.gradle**

```gradle
apply plugin: "com.android.application"

android {
    compileSdkVersion 33

    defaultConfig {
        applicationId "com.blooddonationnetwork"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }

    buildFeatures {
        viewBinding true
    }
}

dependencies {
    implementation 'com.google.android.gms:play-services-location:21.0.1'
    implementation 'com.google.android.gms:play-services-maps:18.2.0'
}
```

### iOS Setup

**ios/Podfile**

```ruby
target 'BloodDonationApp' do
  # Core RN pods
  pod 'React', :path => '../node_modules/react-native/'

  # Location services
  pod 'react-native-geolocation-service', :path => '../node_modules/react-native-geolocation-service'

  # Maps
  pod 'react-native-maps', :path => '../node_modules/react-native-maps'

  # Firebase (for notifications)
  pod 'Firebase/Core'
  pod 'Firebase/Messaging'
end
```

---

## 📱 Option 2: Flutter (Alternative)

If you prefer Flutter for better performance:

```bash
# Create Flutter project
flutter create blood_donation_app --org com.blooddonationnetwork

cd blood_donation_app

# Add dependencies in pubspec.yaml
flutter pub add:
  - http: ^0.13.0
  - geolocator: ^9.0.0
  - google_maps_flutter: ^2.2.0
  - firebase_messaging: ^13.0.0
  - provider: ^6.0.0
  - intl: ^0.18.0
  - twilio_flutter: ^1.0.0
```

---

## 🚀 Features Checklist

### Phase 1: MVP (First Release)

- [ ] User authentication with OTP
- [ ] Blood request creation
- [ ] Nearby blood requests map
- [ ] Donor profiles
- [ ] Chat/messaging
- [ ] Call integration

### Phase 2: Enhanced

- [ ] KYC verification (photo upload)
- [ ] Push notifications
- [ ] Donation history
- [ ] Ratings & reviews
- [ ] Payment processing
- [ ] Admin panel

### Phase 3: Advanced

- [ ] ML-based recommendations
- [ ] Video calls for verification
- [ ] Blockchain transaction records
- [ ] Integration with blood banks
- [ ] AR features for finding blood banks
- [ ] Voice commands

---

## 🔐 Security Considerations

```javascript
// 1. Store token securely
import AsyncStorage from '@react-native-async-storage/async-storage'
// Ideally use react-native-keychain for iOS/Android

// 2. SSL Pinning
import axios from 'axios'
import { createSSLPinning } from 'react-native-ssl-pinning'

// 3. Encrypt sensitive data
import Crypto from 'react-native-crypto'

// 4. Don't log sensitive data
// Log only in development mode
if (__DEV__) {
  console.log('User:', user)
}
```

---

## 📊 Building & Deployment

### Android Release Build

```bash
cd android
./gradlew clean bundleRelease
# Output: app/release/app-release.aab (for Google Play)

# Or APK
./gradlew clean assembleRelease
# Output: app/release/app-release.apk
```

### iOS Release Build

```bash
cd ios
xcodebuild -workspace BloodDonationApp.xcworkspace \
  -scheme BloodDonationApp \
  -configuration Release \
  -derivedDataPath build

# Upload to App Store
```

### Publishing

1. **Google Play Store**
   - Create app listing
   - Upload APK/AAB
   - Wait for review (24-72 hours)
   - Live on store

2. **Apple App Store**
   - Create app record
   - Upload IPA
   - Wait for review (24-48 hours)
   - Live on store

---

## 🧪 Testing

```javascript
// Unit tests
npm test

// E2E tests
npx detox build-framework ios
npx detox build-configuration ios.sim.debug
npx detox test e2e --configuration ios.sim.debug

// Performance testing
npx react-native run-android --profile
npx react-native run-ios --configuration Release
```

---

## 📞 Support & Troubleshooting

Common issues and solutions in mobile development guide.

**Completion Time**: 4-6 weeks for MVP
**Estimated Cost**: $2,000-5,000 (without server infrastructure)
