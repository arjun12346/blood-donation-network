import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { createContext, useContext, useEffect, useState } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [expoPushToken, setExpoPushToken] = useState(null)

  useEffect(() => {
    registerForPushNotificationsAsync()

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification)
    })

    return () => subscription.remove()
  }, [])

  async function registerForPushNotificationsAsync() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!')
        return
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data
      setExpoPushToken(token)
      await AsyncStorage.setItem('pushToken', token)
    } catch (error) {
      console.error('Push notification registration failed:', error)
    }
  }

  const value = {
    expoPushToken,
  }

  return (
    // @ts-ignore
    // eslint-disable-next-line react/react-in-jsx-scope
    React.createElement(NotificationContext.Provider, { value: value }, children)
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
