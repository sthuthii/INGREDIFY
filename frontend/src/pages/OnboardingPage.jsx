import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, ArrowRight, ArrowLeft, Check, User,
  Heart, AlertTriangle, Utensils, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { DIETARY_PREFERENCES, ALLERGENS, HEALTH_CONDITIONS } from '@/lib/utils'
import toast from 'react-hot-toast'

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 'basics',     label: 'About you',     icon: User },
  { id: 'diet',       label: 'Diet',          icon: Utensils },
  { id: 'conditions', label: 'Health',        icon: Heart },
  { id: 'allergens',  label: 'Allergens',     icon: AlertTriangle },
]

// ── Reusable select chip ──────────────────────────────────────────────────────
function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
        selected
          ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
          : 'bg-white dark:bg-surface-dark-secondary border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600'
      }`}
    >
      {selected && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
      {label}
    </button>
  )
}

// ── Step 1 — basic info ───────────────────────────────────────────────────────
function StepBasics({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Age <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="number"
          min="1" max="120"
          value={data.age}
          onChange={(e) => onChange('age', e.target.value)}
          placeholder="e.g. 28"
          className="input w-40"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Gender <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
            <Chip
              key={g}
              label={g}
              selected={data.gender === g}
              onClick={() => onChange('gender', data.gender === g ? '' : g)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 2 — dietary preference ───────────────────────────────────────────────
function StepDiet({ data, onChange }) {
  return (
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        We'll use this to flag ingredients that don't fit your diet.
      </p>
      <div className="flex flex-wrap gap-2">
        {DIETARY_PREFERENCES.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            selected={data.dietaryPreference === value}
            onClick={() => onChange('dietaryPreference', data.dietaryPreference === value ? '' : value)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Step 3 — health conditions ────────────────────────────────────────────────
function StepConditions({ data, onChange }) {
  const toggle = (value) => {
    const current = data.healthConditions || []
    onChange(
      'healthConditions',
      current.includes(value) ? current.filter((c) => c !== value) : [...current, value]
    )
  }
  return (
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Select all that apply. We'll give you extra warnings for relevant ingredients.
      </p>
      <div className="flex flex-wrap gap-2">
        {HEALTH_CONDITIONS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            selected={(data.healthConditions || []).includes(value)}
            onClick={() => toggle(value)}
          />
        ))}
      </div>
      {(data.healthConditions || []).length === 0 && (
        <p className="text-xs text-slate-400 mt-3">Select any that apply, or skip to continue.</p>
      )}
    </div>
  )
}

// ── Step 4 — allergens ────────────────────────────────────────────────────────
function StepAllergens({ data, onChange }) {
  const toggle = (item) => {
    const current = data.allergies || []
    onChange(
      'allergies',
      current.includes(item) ? current.filter((a) => a !== item) : [...current, item]
    )
  }
  return (
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        We'll show prominent alerts whenever these appear in a scanned product.
      </p>
      <div className="flex flex-wrap gap-2">
        {ALLERGENS.map((a) => (
          <Chip
            key={a}
            label={a}
            selected={(data.allergies || []).includes(a)}
            onClick={() => toggle(a)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main wizard ───────────────────────────────────────────────────────────────
const STEP_COMPONENTS = [StepBasics, StepDiet, StepConditions, StepAllergens]

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}

export default function OnboardingPage() {
  const { updateUserProfile, user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    dietaryPreference: '',
    healthConditions: [],
    allergies: [],
  })

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const goNext = () => {
    setDirection(1)
    setStep((s) => s + 1)
  }
  const goBack = () => {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      await updateUserProfile({
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        dietaryPreference: formData.dietaryPreference || 'none',
        healthConditions: formData.healthConditions,
        allergies: formData.allergies,
        onboardingComplete: true,
      })
      toast.success('Profile saved! You\'re all set.')
      navigate('/scan', { replace: true })
    } catch (err) {
      toast.error('Failed to save profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const StepContent = STEP_COMPONENTS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-surface-secondary dark:bg-surface-dark flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow">
            <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-slate-900 dark:text-white">Ingredify</span>
        </div>
        <button
          onClick={() => navigate('/scan', { replace: true })}
          className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-200 dark:bg-slate-800">
        <motion.div
          className="h-full bg-brand-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Step pills */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done = i < step
              const active = i === step
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                      active
                        ? 'bg-brand-500 text-white shadow-sm'
                        : done
                        ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {done ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 h-px ${done ? 'bg-brand-300' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Card */}
          <div className="card p-8 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {/* Step header */}
                <div className="mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    step === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' :
                    step === 1 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' :
                    step === 2 ? 'bg-red-50 dark:bg-red-900/20 text-red-500' :
                                 'bg-purple-50 dark:bg-purple-900/20 text-purple-500'
                  }`}>
                    {(() => { const Icon = STEPS[step].icon; return <Icon className="w-5 h-5" /> })()}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {['Tell us about yourself', 'Your dietary preference', 'Any health conditions?', 'Food allergies?'][step]}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {['Helps us personalise your health insights.', 'We\'ll flag non-compliant ingredients.', 'Get tailored warnings for your conditions.', 'We\'ll never let an allergen slip past you.'][step]}
                  </p>
                </div>

                {/* Step body */}
                <StepContent data={formData} onChange={handleChange} />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={goBack}
                disabled={step === 0}
                className={`btn-secondary ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {isLast ? (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="btn-primary px-8"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"
                      />
                      Saving…
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Finish setup
                    </>
                  )}
                </button>
              ) : (
                <button onClick={goNext} className="btn-primary">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Step count */}
          <p className="text-center text-xs text-slate-400 mt-4">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  )
}