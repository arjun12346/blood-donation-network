// ============================================================
// CreateRequestModal — Apple Design
// ============================================================
import { AlertTriangle, ArrowRight, Loader2, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const AIResultBadge = ({ level, label }) => {
  const configs = {
    HIGH: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400',
    MEDIUM: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
    LOW: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    SAFE: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${configs[level] || configs.LOW}`}
    >
      {label}
    </span>
  )
}

export default function CreateRequestModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    bloodGroup: user?.bloodGroup || '',
    message: '',
    locationText: user?.location?.text || '',
    unitsNeeded: 1,
    patientName: '',
  })
  const [loading, setLoading] = useState(false)
  const [aiPreview, setAiPreview] = useState(null)
  const [step, setStep] = useState(1)

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAnalyze = async () => {
    if (!form.bloodGroup || !form.message.trim() || !form.locationText.trim()) {
      toast.error('Please fill all required fields')
      return
    }
    if (form.message.trim().length < 15) {
      toast.error('Message must be at least 15 characters')
      return
    }
    setLoading(true)
    try {
      setStep(2)
      const highWords = [
        'accident',
        'icu',
        'surgery',
        'emergency',
        'critical',
        'bleeding',
        'stroke',
        'coma',
      ]
      const mediumWords = ['hospitalized', 'today', 'urgent', 'patient', 'admitted']
      const spamWords = ['urgent urgent', 'pls fast', 'help help help']
      const text = form.message.toLowerCase()
      const hasHigh = highWords.some((w) => text.includes(w))
      const hasMedium = mediumWords.some((w) => text.includes(w))
      const hasSpam = spamWords.some((w) => text.includes(w))
      const isNew = user?.trustScore === 'new'
      setAiPreview({
        priorityLevel: hasHigh ? 'HIGH' : hasMedium ? 'MEDIUM' : 'LOW',
        riskLevel: hasSpam ? 'HIGH' : isNew && (hasHigh || hasMedium) ? 'MEDIUM' : 'SAFE',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/requests', {
        bloodGroup: form.bloodGroup,
        message: form.message,
        location: { text: form.locationText, lat: null, lng: null },
        unitsNeeded: Number(form.unitsNeeded),
        patientName: form.patientName || user?.name,
      })
      setStep(3)
      setAiPreview(data.aiAnalysis)
      toast.success('Blood request created')
      setTimeout(() => {
        onCreated?.()
        onClose()
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-floating w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              New Blood Request
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              AI will analyze priority and safety
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 px-6 pt-4">
          {['Details', 'Preview', 'Done'].map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div
                className={`flex items-center gap-1.5 ${step > i + 1 ? 'text-emerald-600' : step === i + 1 ? 'text-rose-600' : 'text-gray-300'}`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-rose-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}
                >
                  {step > i + 1 ? <ShieldCheck className="w-3 h-3" /> : i + 1}
                </div>
                <span className="text-[10px] font-medium hidden sm:block">{label}</span>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 mx-1 rounded ${step > i + 1 ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    Blood Group *
                  </label>
                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    Units Needed
                  </label>
                  <input
                    type="number"
                    name="unitsNeeded"
                    value={form.unitsNeeded}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Patient Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="Full name of patient"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Location (Hospital/Area) *
                </label>
                <input
                  type="text"
                  name="locationText"
                  value={form.locationText}
                  onChange={handleChange}
                  placeholder="e.g. AIIMS Hospital, New Delhi"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Request Message *
                  <span className="text-gray-400 font-normal text-[11px] ml-2">
                    ({form.message.length}/500)
                  </span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  placeholder="Describe the urgency clearly..."
                  className="input-field resize-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Tip: Mention emergency, surgery, ICU for higher priority.
                </p>
              </div>

              {!user?.isVerified && (
                <div className="flex gap-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    <strong>Unverified account:</strong> Your request will be marked as Medium Risk.
                    Verify your phone for better trust score.
                  </p>
                </div>
              )}

              <button onClick={handleAnalyze} disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Analyze <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && aiPreview && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  AI Analysis Complete
                </h3>
                <p className="text-xs text-gray-500 mt-1">Review before submitting</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Priority Level
                  </span>
                  <AIResultBadge
                    level={aiPreview.priorityLevel}
                    label={`${aiPreview.priorityLevel} Priority`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Risk Level
                  </span>
                  <AIResultBadge
                    level={aiPreview.riskLevel}
                    label={aiPreview.riskLevel === 'SAFE' ? 'Safe' : `${aiPreview.riskLevel} Risk`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Blood Group
                  </span>
                  <span className="font-bold text-rose-600 text-lg">{form.bloodGroup}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Location
                  </span>
                  <span className="text-xs text-gray-700 dark:text-gray-300 max-w-40 text-right truncate">
                    {form.locationText}
                  </span>
                </div>
              </div>

              {aiPreview.riskLevel === 'HIGH' && (
                <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 rounded-xl p-3">
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> High Risk Detected
                  </p>
                  <p className="text-[11px] text-rose-600 dark:text-rose-500 mt-1">
                    Your phone number will be hidden from public view.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Edit
                </button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Confirm <ShieldCheck className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-scale-in">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Request Submitted
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Donors will be notified instantly.
                </p>
              </div>
              {aiPreview && (
                <div className="flex gap-2 justify-center flex-wrap">
                  <AIResultBadge
                    level={aiPreview.priorityLevel}
                    label={`Priority: ${aiPreview.priorityLevel}`}
                  />
                  <AIResultBadge
                    level={aiPreview.riskLevel}
                    label={`Risk: ${aiPreview.riskLevel}`}
                  />
                </div>
              )}
              <p className="text-xs text-gray-400">Redirecting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
