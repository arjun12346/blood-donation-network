import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function CreateRequestModal({ visible, onClose, onCreated }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    bloodGroup: user?.bloodGroup || '',
    message: '',
    locationText: user?.location?.text || '',
    unitsNeeded: '1',
    patientName: '',
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAnalyze = () => {
    if (!form.bloodGroup || !form.message.trim() || !form.locationText.trim()) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }
    if (form.message.trim().length < 15) {
      Alert.alert('Error', 'Message must be at least 15 characters')
      return
    }
    setStep(2)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/requests', {
        bloodGroup: form.bloodGroup,
        message: form.message,
        location: { text: form.locationText, lat: null, lng: null },
        unitsNeeded: Number(form.unitsNeeded),
        patientName: form.patientName || user?.name,
      })
      Alert.alert('Success', 'Blood request created! Donors will be notified.')
      onCreated?.()
      onClose()
      setStep(1)
      setForm({
        bloodGroup: user?.bloodGroup || '',
        message: '',
        locationText: user?.location?.text || '',
        unitsNeeded: '1',
        patientName: '',
      })
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Blood Request</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {step === 1 && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Blood Group *</Text>
                  <View style={styles.bloodGroupGrid}>
                    {BLOOD_GROUPS.map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.bloodGroupBtn,
                          form.bloodGroup === g && styles.bloodGroupBtnActive,
                        ]}
                        onPress={() => updateField('bloodGroup', g)}
                      >
                        <Text
                          style={[
                            styles.bloodGroupText,
                            form.bloodGroup === g && styles.bloodGroupTextActive,
                          ]}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Units Needed</Text>
                  <TextInput
                    style={styles.input}
                    value={form.unitsNeeded}
                    onChangeText={(v) => updateField('unitsNeeded', v)}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Patient Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Full name of patient"
                    value={form.patientName}
                    onChangeText={(v) => updateField('patientName', v)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Location (Hospital/Area) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. AIIMS Hospital, New Delhi"
                    value={form.locationText}
                    onChangeText={(v) => updateField('locationText', v)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Request Message * ({form.message.length}/500)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the urgency clearly..."
                    value={form.message}
                    onChangeText={(v) => updateField('message', v)}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                  />
                  <Text style={styles.hint}>
                    Tip: Mention emergency, surgery, ICU for higher priority.
                  </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleAnalyze}>
                  <Text style={styles.buttonText}>Review Request →</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.reviewTitle}>Review Before Submitting</Text>

                <View style={styles.reviewCard}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Blood Group</Text>
                    <Text style={styles.reviewValue}>{form.bloodGroup}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Units</Text>
                    <Text style={styles.reviewValue}>{form.unitsNeeded}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Location</Text>
                    <Text style={styles.reviewValue}>{form.locationText}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Message</Text>
                    <Text style={styles.reviewValue} numberOfLines={3}>
                      {form.message}
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => setStep(1)}
                  >
                    <Text style={styles.secondaryButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Submit Request</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodGroupBtn: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  bloodGroupBtnActive: {
    borderColor: '#f43f5e',
    backgroundColor: '#f43f5e',
  },
  bloodGroupText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4b5563',
  },
  bloodGroupTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#f43f5e',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
})
