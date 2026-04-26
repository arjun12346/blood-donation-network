import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import { AuthProvider, useAuth } from './src/context/AuthContext'
import { NotificationProvider } from './src/context/NotificationContext'

import LoginScreen from './src/screens/auth/LoginScreen'
import RegisterScreen from './src/screens/auth/RegisterScreen'
import DashboardScreen from './src/screens/main/DashboardScreen'
import DonorsScreen from './src/screens/main/DonorsScreen'
import HomeScreen from './src/screens/main/HomeScreen'
import ProfileScreen from './src/screens/main/ProfileScreen'

SplashScreen.preventAutoHideAsync()

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function TabIcon({ emoji, focused }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  )
}

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#f43f5e',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingTop: 4,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DonorsTab"
        component={DonorsScreen}
        options={{
          title: 'Donors',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Requests',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🩸" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}

function RootNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  return <NavigationContainer>{user ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        setAppIsReady(true)
      } catch (e) {
        console.warn(e)
      } finally {
        await SplashScreen.hideAsync()
      }
    }

    prepare()
  }, [])

  if (!appIsReady) {
    return null
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <RootNavigator />
        <StatusBar barStyle="dark-content" />
      </NotificationProvider>
    </AuthProvider>
  )
}
