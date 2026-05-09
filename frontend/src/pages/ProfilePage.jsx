import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Heart, AlertTriangle, Utensils, Save,
  Edit2, Check, LogOut, Trash2, Shield, Mail,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { DIETARY_PREFERENCES, ALLERGENS, HEALTH_CONDITIONS } from '@/lib/utils'
import toast from 'react-hot-toast'

// ── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-150 ${
        selected
          ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
          : 'bg-white dark:bg-surface-dark-secondary border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed'
      }`}
    >
      {selected && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
      {label}
    </button>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, iconColor, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="font-display font-semibold text-slate-900 dark:text-white text-lg">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, profile, updateUserProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name:               profile?.name || user?.displayName || '',
    age:                profile?.age || '',
    gender:             profile?.gender || '',
    dietaryPreference:  profile?.dietaryPreference || 'none',
    healthConditions:   profile?.healthConditions || [],
    allergies:          profile?.allergies || [],
  })

  // Sync form if profile loads after mount
  const initForm = () => ({
    name:               profile?.name || user?.displayName || '',
    age:                profile?.age || '',
    gender:             profile?.gender || '',
    dietaryPreference:  profile?.dietaryPreference || 'none',
    healthConditions:   profile?.healthConditions || [],
    allergies:          profile?.allergies || [],
  })

  const startEdit = () => {
    setForm(initForm())
    setEditing(true)
  }

  const cancelEdit = () => setEditing(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUserProfile({
        name:               form.name.trim(),
        age:                form.age ? parseInt(form.age) : null,
        gender:             form.gender || null,
        dietaryPreference:  form.dietaryPreference || 'none',
        healthConditions:   form.healthConditions,
        allergies:          form.allergies,
      })
      toast.success('Profile updated!')
      setEditing(false)
    } catch {
      toast.error('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleList = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const displayName = profile?.name || user?.displayName || 'User'
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="page-wrapper py-8">
      <div className="container-md space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Manage your health settings and preferences
            </p>
          </div>
          {!editing ? (
            <button onClick={startEdit} className="btn-secondary gap-2">
              <Edit2 className="w-4 h-4" /> Edit profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEdit} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"
                  />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save changes
              </button>
            </div>
          )}
        </motion.div>

        {/* Identity card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-6"
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-display font-bold shadow-glow flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="input text-lg font-semibold mb-2"
                  placeholder="Your name"
                />
              ) : (
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </h2>
              )}
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Age + Gender row */}
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Age</p>
              {editing ? (
                <input
                  type="number"
                  min="1" max="120"
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  className="input w-28"
                  placeholder="e.g. 28"
                />
              ) : (
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {profile?.age || <span className="text-slate-400 font-normal">Not set</span>}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Gender</p>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      selected={form.gender === g}
                      onClick={() => setForm((p) => ({ ...p, gender: p.gender === g ? '' : g }))}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {profile?.gender || <span className="text-slate-400 font-normal">Not set</span>}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Dietary preference */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section icon={Utensils} title="Dietary Preference" iconColor="bg-amber-50 dark:bg-amber-900/20 text-amber-500">
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {DIETARY_PREFERENCES.map(({ value, label }) => (
                  <Chip
                    key={value}
                    label={label}
                    selected={form.dietaryPreference === value}
                    onClick={() => setForm((p) => ({ ...p, dietaryPreference: value }))}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="badge badge-safe capitalize text-sm px-3 py-1">
                  {DIETARY_PREFERENCES.find((d) => d.value === profile?.dietaryPreference)?.label || 'No restriction'}
                </span>
              </div>
            )}
          </Section>
        </motion.div>

        {/* Health conditions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section icon={Heart} title="Health Conditions" iconColor="bg-red-50 dark:bg-red-900/20 text-red-500">
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {HEALTH_CONDITIONS.map(({ value, label }) => (
                  <Chip
                    key={value}
                    label={label}
                    selected={form.healthConditions.includes(value)}
                    onClick={() => toggleList('healthConditions', value)}
                  />
                ))}
              </div>
            ) : profile?.healthConditions?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.healthConditions.map((c) => (
                  <span key={c} className="badge badge-danger text-sm px-3 py-1">
                    {HEALTH_CONDITIONS.find((h) => h.value === c)?.label || c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">None selected</p>
            )}
          </Section>
        </motion.div>

        {/* Allergens */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Section icon={AlertTriangle} title="Food Allergens" iconColor="bg-purple-50 dark:bg-purple-900/20 text-purple-500">
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((a) => (
                  <Chip
                    key={a}
                    label={a}
                    selected={form.allergies.includes(a)}
                    onClick={() => toggleList('allergies', a)}
                  />
                ))}
              </div>
            ) : profile?.allergies?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((a) => (
                  <span key={a} className="badge badge-warn text-sm px-3 py-1">{a}</span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No allergens selected</p>
            )}
          </Section>
        </motion.div>

        {/* Account actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Section icon={Shield} title="Account" iconColor="bg-slate-100 dark:bg-slate-800 text-slate-500">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address</p>
                  <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                </div>
                <span className="badge badge-safe">Verified</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Member since</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {user?.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          </Section>
        </motion.div>

      </div>
    </div>
  )
}