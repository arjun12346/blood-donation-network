import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
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
import CreateRequestModal from '../../components/CreateRequestModal'
import RequestCard from '../../components/RequestCard'
import StatsBar from '../../components/StatsBar'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function DashboardScreen() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [bloodGroup, setBloodGroup] = useState('All')
  const [search, setSearch] = useState('')
  const [modalVisible, setModalVisible] = useState(false)

  const fetchRequests = useCallback(async () => {
    try {
      const params = {
        sort: 'priority',
        ...(bloodGroup !== 'All' && { bloodGroup }),
        ...(search && { location: search }),
      }
      const { data } = await api.get('/requests', { params })
      setRequests(data.requests || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [bloodGroup, search])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const onRefresh = () => {
    setRefreshing(true)
    fetchRequests()
  }

  const highPriorityCount = requests.filter((r) => r.priorityLevel === 'HIGH').length

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>🩸 Blood Requests</Text>
            <Text style={styles.headerSubtitle}>
              {requests.length} active request{requests.length !== 1 ? 's' : ''}
              {highPriorityCount > 0 && (
                <Text style={styles.highPriorityBadge}> • {highPriorityCount} HIGH priority</Text>
              )}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <StatsBar />

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Blood Group Filters */}
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

        {/* Requests */}
        {loading && !refreshing ? (
          <Text style={styles.loadingText}>Loading blood requests...</Text>
        ) : requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🩸</Text>
            <Text style={styles.emptyTitle}>No requests found</Text>
            <Text style={styles.emptySubtitle}>
              {bloodGroup !== 'All' || search
                ? 'Try changing filters or search terms'
                : 'No active blood requests right now'}
            </Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {requests.map((req) => (
              <RequestCard key={req._id} request={req} onUpdate={fetchRequests} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB for creating request */}
      {user && user.role === 'receiver' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <CreateRequestModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreated={fetchRequests}
      />
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
  highPriorityBadge: {
    color: '#f43f5e',
    fontWeight: '700',
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
  requestsList: {
    gap: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
})
