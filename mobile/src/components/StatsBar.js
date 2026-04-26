import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import api from '../services/api'

export default function StatsBar() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api
      .get('/requests/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
  }, [])

  const items = [
    { label: 'Active', value: stats?.active ?? '—', color: '#f43f5e' },
    { label: 'High Priority', value: stats?.highPriority ?? '—', color: '#f59e0b' },
    { label: 'Fulfilled', value: stats?.fulfilled ?? '—', color: '#10b981' },
    { label: 'Donors', value: stats?.donors ?? '—', color: '#3b82f6' },
  ]

  return (
    <View style={styles.container}>
      {items.map(({ label, value, color }) => (
        <View key={label} style={styles.card}>
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
})
