import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAuth } from '../../context/AuthContext'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const COUNTRIES = [
  { code: 'US', name: 'United States', phone: '+1' },
  { code: 'GB', name: 'United Kingdom', phone: '+44' },
  { code: 'IN', name: 'India', phone: '+91' },
  { code: 'CA', name: 'Canada', phone: '+1' },
  { code: 'AU', name: 'Australia', phone: '+61' },
  { code: 'DE', name: 'Germany', phone: '+49' },
  { code: 'FR', name: 'France', phone: '+33' },
  { code: 'JP', name: 'Japan', phone: '+81' },
  { code: 'BR', name: 'Brazil', phone: '+55' },
  { code: 'MX', name: 'Mexico', phone: '+52' },
  { code: 'ZA', name: 'South Africa', phone: '+27' },
  { code: 'NG', name: 'Nigeria', phone: '+234' },
  { code: 'PK', name: 'Pakistan', phone: '+92' },
  { code: 'BD', name: 'Bangladesh', phone: '+880' },
  { code: 'PH', name: 'Philippines', phone: '+63' },
  { code: 'ID', name: 'Indonesia', phone: '+62' },
  { code: 'SG', name: 'Singapore', phone: '+65' },
  { code: 'AE', name: 'UAE', phone: '+971' },
  { code: 'SA', name: 'Saudi Arabia', phone: '+966' },
]

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodGroup: '',
    role: 'donor',
    locationText: '',
    country: COUNTRIES[2], // Default India
  })

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateStep0 = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return false
    }
    if (!form.email.includes('@')) {
      setError('Enter a valid email')
      return false
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const validateStep1 = () => {
    if (!form.phone || form.phone.length < 8) {
      setError('Enter a valid phone number')
      return false
    }
    if (!form.bloodGroup) {
      setError('Please select your blood group')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return
    if (step === 1 && !validateStep1()) return
    if (step === 1) handleRegister()
    else setStep((s) => s + 1)
  }

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.country.phone + ' ' + form.phone,
        password: form.password,
        bloodGroup: form.bloodGroup,
        role: form.role,
        location: { text: form.locationText, lat: null, lng: null },
        country: { code: form.country.code, name: form.country.name },
      })
    } catch (err) {
      setError(err.message || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🩸</Text>
            </View>
            <Text style={styles.title}>Join BloodNet</Text>
            <Text style={styles.subtitle}>Save lives. Be a hero.</Text>
          </View>

          {/* Step indicators */}
          <View style={styles.stepRow}>
            {['Account', 'Details'].map((label, i) => (
              <View key={i} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    i < step && styles.stepDotComplete,
                    i === step && styles.stepDotActive,
                  ]}
                >
                  <Text style={[styles.stepDotText, i === step && styles.stepDotTextActive]}>
                    {i + 1}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>
                  {label}
                </Text>
                {i < 1 && <View style={[styles.stepLine, i < step && styles.stepLineComplete]} />}
              </View>
            ))}
          </View>

          <View style={styles.form}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {step === 0 && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ravi Kumar"
                    value={form.name}
                    onChangeText={(v) => updateField('name', v)}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ravi@example.com"
                    value={form.email}
                    onChangeText={(v) => updateField('email', v)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChangeText={(v) => updateField('password', v)}
                    secureTextEntry
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChangeText={(v) => updateField('confirmPassword', v)}
                    secureTextEntry
                  />
                </View>
              </>
            )}

            {step === 1 && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChangeText={(v) => updateField('phone', v)}
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>

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
                  <Text style={styles.label}>I am a...</Text>
                  <View style={styles.roleRow}>
                    {['donor', 'receiver'].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
                        onPress={() => updateField('role', r)}
                      >
                        <Text style={[styles.roleText, form.role === r && styles.roleTextActive]}>
                          {r === 'donor' ? '🩸 Donor' : '🏥 Receiver'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Location (City/Area)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Connaught Place, New Delhi"
                    value={form.locationText}
                    onChangeText={(v) => updateField('locationText', v)}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{step === 0 ? 'Next' : 'Create Account'}</Text>
              )}
            </TouchableOpacity>

            {step === 0 && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.linkBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            )}

            {step === 1 && (
              <TouchableOpacity style={styles.linkButton} onPress={() => setStep(0)}>
                <Text style={styles.linkText}>
                  <Text style={styles.linkBold}>← Back</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#f43f5e',
  },
  stepDotComplete: {
    backgroundColor: '#10b981',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
  },
  stepDotTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
    marginLeft: 6,
  },
  stepLabelActive: {
    color: '#f43f5e',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  stepLineComplete: {
    backgroundColor: '#10b981',
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 14,
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
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  roleBtnActive: {
    borderColor: '#f43f5e',
    backgroundColor: '#f43f5e',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  roleTextActive: {
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
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 13,
    color: '#6b7280',
  },
  linkBold: {
    color: '#f43f5e',
    fontWeight: '600',
  },
})
