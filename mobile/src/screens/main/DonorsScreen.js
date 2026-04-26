import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../../services/api'

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const TRUST_COLORS = {
  trusted: { bg: '#d1fae5', text: '#065f46' },
  moderate: { bg: '#fef3c7', text: '#92400e' },
  new: { bg: '#f3f4f6', text: '#4b5563' },
  risk: { bg: '#fee2e2', text: '#991b1b' },
}

function DonorCard({ donor, rank }) {
  const trust = TRUST_COLORS[donor.trustScore] || TRUST_COLORS.new
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {rank !== undefined && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{rank + 1}</Text>
          </View>
        )}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{donor.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.donorName}>{donor.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.bloodBadge]}>
              <Text style={styles.bloodBadgeText}>{donor.bloodGroup}</Text>
            </View>
            <View style={[styles.trustBadge, { backgroundColor: trust.bg }]}>
              <Text style={[styles.trustBadgeText, { color: trust.text }]}>
                {donor.trustScore === 'trusted'
                  ? 'Trusted'
                  : donor.trustScore === 'moderate'
                    ? 'Moderate'
                    : donor.trustScore === 'risk'
                      ? 'Risk'
                      : 'New'}
              </Text>
            </View>
          </View>
          {donor.location?.text && (
            <Text style={styles.locationText}>📍 {donor.location.text}</Text>
          )}
        </View>
        <View style={styles.donationCount}>
          <Text style={styles.donationNumber}>{donor.successfulDonations || 0}</Text>
          <Text style={styles.donationLabel}>donations</Text>
        </View>
      </View>
      {donor.trustPoints !== undefined && (
        <View style={styles.trustBarContainer}>
          <View style={styles.trustBarTrack}>
            <View
              style={[
                styles.trustBarFill,
                {
                  width: `${Math.min(100, ((donor.trustPoints || 0) / 100) * 100)}%`,
                  backgroundColor: trust.text,
                },
              ]}
            />
          </View>
          <Text style={styles.trustPointsText}>{donor.trustPoints || 0} pts</Text>
        </View>
      )}
    </View>
  )
}

export default function DonorsScreen() {
  const [donors, setDonors] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [bloodGroup, setBloodGroup] = useState('All')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  const fetchDonors = async () => {
    try {
      const params = {
        ...(bloodGroup !== 'All' && { bloodGroup }),
        ...(search && { location: search }),
      }
      const [donorsRes, lbRes] = await Promise.all([
        api.get('/donors', { params }),
        api.get('/donors/leaderboard'),
      ])
      setDonors(donorsRes.data.donors || [])
      setLeaderboard(lbRes.data.leaderboard || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDonors()
  }, [bloodGroup, search])

  const onRefresh = () => {
    setRefreshing(true)
    fetchDonors()
  }

  const displayList = tab === 'leaderboard' ? leaderboard : donors

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👥 Donor Community</Text>
          <Text style={styles.headerSubtitle}>{donors.length} verified donors ready to help</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {[
            { key: 'all', label: 'All Donors' },
            { key: 'leaderboard', label: '🏆 Leaderboard' },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tabBtn, tab === key && styles.tabBtnActive]}
              onPress={() => setTab(key)}
            >
              <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filters (only for all tab) */}
        {tab === 'all' && (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by location..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#9ca3af"
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {BLOOD_GROUPS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.filterBtn, bloodGroup === g && styles.filterBtnActive]}
                  onPress={() => setBloodGroup(g)}
                >
                  <Text style={[styles.filterText, bloodGroup === g && styles.filterTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Leaderboard header */}
        {tab === 'leaderboard' && (
          <View style={styles.leaderboardBanner}>
            <Text style={styles.leaderboardTitle}>🏆 Top Donors</Text>
            <Text style={styles.leaderboardSubtitle}>
              Ranked by successful donations and trust points
            </Text>
          </View>
        )}

        {/* List */}
        {loading && !refreshing ? (
          <Text style={styles.loadingText}>Loading donors...</Text>
        ) : displayList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>No donors found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {displayList.map((donor, i) => (
              <DonorCard
                key={donor._id}
                donor={donor}
                rank={tab === 'leaderboard' ? i : undefined}
              />
            ))}
          </View>
        )}
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
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  tabBtnActive: {
    backgroundColor: '#f43f5e',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  tabTextActive: {
    color: '#fff',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  filterRow: {
    paddingBottom: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  filterBtnActive: {
    backgroundColor: '#f43f5e',
    borderColor: '#f43f5e',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
  },
  filterTextActive: {
    color: '#fff',
  },
  leaderboardBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  leaderboardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 2,
  },
  leaderboardSubtitle: {
    fontSize: 12,
    color: '#b45309',
  },
  loadingText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 40,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 2,
  },
  bloodBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bloodBadgeText: {
    color: '#be123c',
    fontSize: 11,
    fontWeight: '700',
  },
  trustBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  donationCount: {
    alignItems: 'center',
  },
  donationNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f43f5e',
  },
  donationLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  trustBarContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginRight: 8,
  },
  trustBarFill: {
    height: 4,
    borderRadius: 2,
  },
  trustPointsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
})
