import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ScanLine, Sparkles, Shield, AlertTriangle,
  Heart, Leaf, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react'
import { scanAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { getScoreColor, getScoreLabel } from '@/lib/utils'
import toast from 'react-hot-toast'

// ── Health Score Ring ─────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const { text, ring } = getScoreColor(score)
  const label          = getScoreLabel(score)
  const radius         = 44
  const circumference  = 2 * Math.PI * radius
  const dash           = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor"
            className="text-slate-100 dark:text-slate-800" strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8"
            stroke={ring === 'text-brand-600' ? '#22c55e' : ring === 'text-amber-600' ? '#f59e0b' : '#ef4444'}
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-display font-bold ${text}`}>{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold ${text}`}>{label}</span>
    </div>
  )
}

// ── Severity badge ────────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const map = {
    Critical: 'badge-danger',
    High:     'badge-danger',
    Medium:   'badge-warn',
    Low:      'badge-safe',
  }
  return <span className={`badge ${map[severity] || 'badge-safe'}`}>{severity}</span>
}

// ── Flagged ingredient card ───────────────────────────────────────────────────
function FlaggedCard({ item, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card p-4"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
            item.severity === 'Critical' || item.severity === 'High'
              ? 'text-red-500' : 'text-amber-500'
          }`} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
              {item.ingredient}
            </p>
            <p className="text-xs text-slate-400">{item.risk}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SeverityBadge severity={item.severity} />
          {open
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />
          }
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 pt-3
              border-t border-slate-100 dark:border-slate-800 leading-relaxed">
              {item.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyzePage() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { profile } = useAuth()

  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const ocrResult = location.state?.ocrResult

  useEffect(() => {
    if (!ocrResult) {
      navigate('/scan', { replace: true })
      return
    }
    runAnalysis()
  }, [])

  const runAnalysis = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await scanAPI.analyze({
        extracted_text: ocrResult.text,
        product_name:   ocrResult.product_name || null,
        user_profile:   profile
          ? {
              allergies:        profile.allergies || [],
              healthConditions: profile.healthConditions || [],
            }
          : null,
      })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
      toast.error('Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-wrapper py-8">
        <div className="container-sm">
          <div className="card p-10 flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div className="text-center">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Analysing ingredients…
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Checking for risks, allergens, and generating your health summary
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="page-wrapper py-8">
        <div className="container-sm">
          <div className="card p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-medium text-slate-800 dark:text-white mb-2">Analysis failed</p>
            <p className="text-sm text-slate-500 mb-5">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/scan')} className="btn-secondary">
                <ArrowLeft className="w-4 h-4" /> Back to scan
              </button>
              <button onClick={runAnalysis} className="btn-primary">
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!result) return null

  const {
    health_score, score_label, ai_summary,
    flagged_ingredients, allergens_detected,
    personalized_warnings, alternatives,
    ingredients, total_ingredients, harmful_count,
  } = result

  return (
    <div className="page-wrapper py-8">
      <div className="container-sm space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button onClick={() => navigate('/scan')} className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Analysis Results
            </h1>
            <p className="text-sm text-slate-500">
              {result.product_name !== 'Unknown product' ? result.product_name : `${total_ingredients} ingredients analysed`}
            </p>
          </div>
        </motion.div>

        {/* Score + summary card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-6"
        >
          <div className="flex items-start gap-6">
            <ScoreRing score={health_score} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  AI Health Summary
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {ai_summary}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
            {[
              { label: 'Total',    value: total_ingredients, color: 'text-slate-700 dark:text-slate-300' },
              { label: 'Flagged',  value: harmful_count,     color: harmful_count > 0 ? 'text-red-600' : 'text-brand-600' },
              { label: 'Allergens', value: allergens_detected.length, color: allergens_detected.length > 0 ? 'text-amber-600' : 'text-brand-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Personalized warnings */}
        {personalized_warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h2 className="font-display font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Personalized warnings
            </h2>
            {personalized_warnings.map((w, i) => (
              <div key={i} className="card p-4 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
                <p className="text-sm text-red-700 dark:text-red-300">{w.message}</p>
                <p className="text-xs text-red-400 mt-1 capitalize">
                  {w.condition.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Allergens */}
        {allergens_detected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="card p-4 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="font-medium text-amber-800 dark:text-amber-300 text-sm">
                Allergens detected
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergens_detected.map((a) => (
                <span key={a} className="badge badge-warn">{a}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Flagged ingredients */}
        {flagged_ingredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <h2 className="font-display font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              Flagged ingredients ({harmful_count})
            </h2>
            {flagged_ingredients.map((item, i) => (
              <FlaggedCard key={i} item={item} index={i} />
            ))}
          </motion.div>
        )}

        {/* All ingredients */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <h2 className="font-display font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-brand-500" />
            All ingredients ({total_ingredients})
          </h2>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing, i) => {
              const isFlagged = flagged_ingredients.some(
                (f) => f.ingredient.toLowerCase() === ing.toLowerCase()
              )
              return (
                <span
                  key={i}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    isFlagged
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {ing}
                </span>
              )
            })}
          </div>
        </motion.div>

        {/* Healthier alternatives */}
        {alternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-5"
          >
            <h2 className="font-display font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              Healthier alternatives
            </h2>
            <div className="space-y-3">
              {alternatives.map((alt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Leaf className="w-3 h-3 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{alt.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{alt.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 pb-8"
        >
          <button onClick={() => navigate('/scan')} className="btn-secondary flex-1">
            <ScanLine className="w-4 h-4" /> Scan another
          </button>
          <button onClick={() => navigate('/chat', { state: { context: result } })} className="btn-primary flex-1">
            <Sparkles className="w-4 h-4" /> Ask AI
          </button>
        </motion.div>

      </div>
    </div>
  )
}