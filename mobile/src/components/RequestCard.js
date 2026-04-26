import { useState } from 'react'
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const PRIORITY_COLORS = {
  HIGH: { bg: '#fee2e2', text: '#be123c', border: '#fecdd3' },
  MEDIUM: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  LOW: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
}

const TRUST_COLORS = {
  trusted: { bg: '#d1fae5', text: '#065f46' },
  moderate: { bg: '#fef3c7', text: '#b45309' },
  new: { bg: '#f3f4f6', text: '#4b5563' },
  risk: { bg: '#fee2e2', text: '#991b1b' },
}

const RISK_COLORS = {
  SAFE: { bg: '#d1fae5', text: '#065f46' },
  MEDIUM: { bg: '#fef3c7', text: '#b45309' },
  HIGH: { bg: '#fee2e2', text: '#991b1b' },
}

export default function RequestCard({ request, onUpdate }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [responded, setResponded] = useState(false)
  const [reported, setReported] = useState(false)

  const priority = PRIORITY_COLORS[request.priorityLevel] || PRIORITY_COLORS.LOW
  const trust = TRUST_COLORS[request.trustScore] || TRUST_COLORS.new
  const risk = RISK_COLORS[request.riskLevel] || RISK_COLORS.SAFE

  const isOwner = user && request.requester?._id?.toString() === user._id?.toString()
  const phoneHidden = request.riskLevel === 'HIGH' && !isOwner

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000)
    if (s < 60) return 'Just now'
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  const handleCall = () => {
    if (phoneHidden) {
      Alert.alert('Hidden', 'Phone number is hidden for high-risk requests.')
      return
    }
    Linking.openURL(`tel:${request.phone}`)
  }

  const handleRespond = async () => {
    if (!user) {
      Alert.alert('Sign In', 'Please sign in to respond.')
      return
    }
    if (responded) return
    setLoading(true)
    try {
      await api.post(`/requests/${request._id}/respond`)
      setResponded(true)
      Alert.alert('Success', 'Response recorded! The requester has been notified.')
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to respond')
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async () => {
    if (!user) {
      Alert.alert('Sign In', 'Please sign in to report.')
      return
    }
    if (reported) return
    setLoading(true)
    try {
      await api.post(`/requests/${request._id}/report`, { reason: 'Suspicious activity' })
      setReported(true)
      onUpdate?.()
      Alert.alert('Reported', 'Thank you for keeping the community safe.')
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Report failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFulfill = async () => {
    setLoading(true)
    try {
      await api.post(`/requests/${request._id}/fulfill`)
      onUpdate?.()
      Alert.alert('Success', 'Request marked as fulfilled!')
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.card, { borderLeftColor: priority.text, borderLeftWidth: 3 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.bloodCircle, { backgroundColor: priority.text }]}>
            <Text style={styles.bloodText}>{request.bloodGroup}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{request.name}</Text>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: priority.bg, borderColor: priority.border },
                ]}
              >
                <Text style={[styles.badgeText, { color: priority.text }]}>
                  {request.priorityLevel}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: trust.bg }]}>
                <Text style={[styles.badgeText, { color: trust.text }]}>{request.trustScore}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: risk.bg }]}>
                <Text style={[styles.badgeText, { color: risk.text }]}>{request.riskLevel}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.time}>{timeAgo(request.createdAt)}</Text>
      </View>

      {/* Message */}
      <Text style={styles.message} numberOfLines={2}>
        {request.message}
      </Text>

      {/* Info */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>📍 {request.location?.text}</Text>
        <Text style={styles.infoText}>
          🏥 {request.nearestHospital?.name} {request.nearestHospital?.distance}
        </Text>
        <Text style={styles.infoText}>🩸 {request.unitsNeeded || 1} unit(s)</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} onPress={handleCall}>
          <Text style={styles.callBtnText}>{phoneHidden ? '📵 Hidden' : '📞 Call'}</Text>
        </TouchableOpacity>

        <View style={styles.actionRight}>
          {user && user.role === 'donor' && !isOwner && (
            <TouchableOpacity
              style={[styles.actionBtn, responded ? styles.respondedBtn : styles.respondBtn]}
              onPress={handleRespond}
              disabled={loading || responded}
            >
              <Text style={responded ? styles.respondedText : styles.respondText}>
                {responded ? '✓ Responded' : 'Respond'}
              </Text>
            </TouchableOpacity>
          )}

          {isOwner && request.status === 'active' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.fulfillBtn]}
              onPress={handleFulfill}
              disabled={loading}
            >
              <Text style={styles.fulfillText}>✓ Fulfilled</Text>
            </TouchableOpacity>
          )}

          {!isOwner && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.reportBtn]}
              onPress={handleReport}
              disabled={loading || reported}
            >
              <Text style={styles.reportText}>{reported ? 'Reported' : '🚩'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Responded donors */}
      {request.respondedDonors?.length > 0 && (
        <Text style={styles.respondedText2}>
          ✅ {request.respondedDonors.length} donor(s) responded
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bloodCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bloodText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    color: '#9ca3af',
  },
  message: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  infoRow: {
    gap: 4,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRight: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  callBtn: {
    backgroundColor: '#10b981',
  },
  callBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  respondBtn: {
    backgroundColor: '#3b82f6',
  },
  respondText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  respondedBtn: {
    backgroundColor: '#dbeafe',
  },
  respondedText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '700',
  },
  fulfillBtn: {
    backgroundColor: '#10b981',
  },
  fulfillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  reportBtn: {
    backgroundColor: '#f3f4f6',
  },
  reportText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
  },
  respondedText2: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
})
