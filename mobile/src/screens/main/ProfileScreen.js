import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const TRUST_CONFIG = {
  trusted: { label: 'Trusted', color: '#059669', bg: '#d1fae5' },
  moderate: { label: 'Moderate', color: '#b45309', bg: '#fef3c7' },
  new: { label: 'New User', color: '#4b5563', bg: '#f3f4f6' },
  risk: { label: 'Risk', color: '#dc2626', bg: '#fee2e2' },
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/auth/notifications')
      setNotifications(data.notifications || [])
    } catch {
      // silent
    }
  }

  const handleMarkDonation = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/donation-success')
      updateUser({
        ...user,
        trustScore: data.trustScore,
        trustPoints: data.trustPoints,
        successfulDonations: data.successfulDonations,
      })
      Alert.alert('Success', 'Donation recorded! Trust score updated.')
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: logout,
      },
    ])
  }

  if (!user) return null

  const trust = TRUST_CONFIG[user.trustScore] || TRUST_CONFIG.new
  const trustPercent = Math.min(100, ((user.trustPoints || 0) / 100) * 100)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: trust.bg }]}>
                <Text style={[styles.badgeText, { color: trust.color }]}>{trust.label}</Text>
              </View>
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodBadgeText}>{user.bloodGroup}</Text>
              </View>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor: user.role === 'donor' ? '#dbeafe' : '#ede9fe',
                  },
                ]}
              >
                <Text
                  style={{
                    color: user.role === 'donor' ? '#1e40af' : '#5b21b6',
                    fontSize: 10,
                    fontWeight: '700',
                  }}
                >
                  {user.role?.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trust Score */}
        <View style={styles.trustCard}>
          <View style={styles.trustHeader}>
            <Text style={styles.trustTitle}>Trust Score</Text>
            <Text style={styles.trustPoints}>{user.trustPoints || 0} / 100 pts</Text>
          </View>
          <View style={styles.trustBarTrack}>
            <View
              style={[
                styles.trustBarFill,
                { width: `${trustPercent}%`, backgroundColor: trust.color },
              ]}
            />
          </View>
          <Text style={styles.trustDesc}>
            {trust.label === 'Trusted'
              ? 'You are a highly trusted member.'
              : trust.label === 'Moderate'
                ? 'Complete a donation to increase trust.'
                : trust.label === 'Risk'
                  ? 'Account flagged. Contact support.'
                  : 'Verify phone and donate to build trust.'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Donations', value: user.successfulDonations || 0 },
            { label: 'Trust Pts', value: user.trustPoints || 0 },
            { label: 'Reports', value: user.reportCount || 0 },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        {user.role === 'donor' && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleMarkDonation}
            disabled={loading}
          >
            <Text style={styles.actionEmoji}>🩸</Text>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Record a Donation</Text>
              <Text style={styles.actionSubtitle}>Earn +20 trust points for each donation</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔔 Notifications {unread > 0 && `(${unread})`}</Text>
          </View>
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>No notifications yet</Text>
          ) : (
            notifications.slice(0, 10).map((n, i) => (
              <View key={i} style={[styles.notifItem, !n.read && styles.notifItemUnread]}>
                <Text style={styles.notifMessage}>{n.message}</Text>
                <Text style={styles.notifTime}>{new Date(n.createdAt).toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bloodBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bloodBadgeText: {
    color: '#be123c',
    fontSize: 10,
    fontWeight: '700',
  },
  roleBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  trustCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  trustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  trustPoints: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  trustBarTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 8,
  },
  trustBarFill: {
    height: 6,
    borderRadius: 3,
  },
  trustDesc: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: 2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  actionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065f46',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 18,
    color: '#065f46',
    fontWeight: '700',
  },
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  notifItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  notifItemUnread: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  notifMessage: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
  },
})
