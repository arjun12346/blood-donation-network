import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

const Feature = ({ emoji, title, desc }) => (
  <View style={styles.featureCard}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDesc}>{desc}</Text>
  </View>
)

export default function HomeScreen({ navigation }) {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api
      .get('/requests/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.heroBadgeText}>AI-Powered Emergency Network</Text>
          </View>
          <Text style={styles.heroTitle}>Every Drop of Blood Saves a Life</Text>
          <Text style={styles.heroSubtitle}>
            Connect with verified blood donors instantly during emergencies.
          </Text>

          {user ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.primaryButtonText}>Go to Dashboard →</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.primaryButtonText}>🩸 Register as Donor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.secondaryButtonText}>Find Blood →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Blood group badges */}
          <View style={styles.bloodGroupRow}>
            {BLOOD_GROUPS.map((g) => (
              <View key={g} style={styles.bloodGroupBadge}>
                <Text style={styles.bloodGroupText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Active', value: stats?.active ?? '—', color: '#f43f5e' },
            { label: 'High Priority', value: stats?.highPriority ?? '—', color: '#f59e0b' },
            { label: 'Fulfilled', value: stats?.fulfilled ?? '—', color: '#10b981' },
            { label: 'Donors', value: stats?.donors ?? '—', color: '#3b82f6' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>Why BloodNet?</Text>
        <View style={styles.featuresGrid}>
          <Feature
            emoji="🤖"
            title="AI Urgency Detection"
            desc="Our AI analyzes requests and classifies urgency automatically."
          />
          <Feature
            emoji="🛡️"
            title="Fake Request Detection"
            desc="Advanced spam detection keeps donors safe from fraud."
          />
          <Feature
            emoji="⭐"
            title="Donor Trust Score"
            desc="Verified donors earn trust points with each donation."
          />
          <Feature
            emoji="📍"
            title="Nearest Hospital"
            desc="Shows the closest hospital automatically for every request."
          />
          <Feature
            emoji="📞"
            title="One-Tap Call"
            desc="Direct call button on every request — no middlemen."
          />
          <Feature
            emoji="🔔"
            title="Real-Time Alerts"
            desc="Get notified instantly when matching blood is needed."
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          <Text style={{ fontWeight: '700', color: '#f43f5e' }}>BloodNet</Text> — AI-Powered
          Emergency Blood Donation Network
        </Text>
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
    padding: 20,
  },
  hero: {
    backgroundColor: '#be123c',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6ee7b7',
    marginRight: 8,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 10,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: '#be123c',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bloodGroupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
  },
  bloodGroupBadge: {
    backgroundColor: '#f43f5e',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bloodGroupText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  featuresGrid: {
    gap: 10,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  featureEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    marginBottom: 20,
  },
})
