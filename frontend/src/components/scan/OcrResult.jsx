import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, List, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OcrResult({ result }) {
  const [showRaw, setShowRaw]     = useState(false)
  const [copied, setCopied]       = useState(false)

  if (!result) return null

  const { text, confidence, ingredients = [], raw_text } = result

  const copyText = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const confidenceColor =
    confidence >= 80 ? 'text-brand-600 dark:text-brand-400' :
    confidence >= 60 ? 'text-amber-600 dark:text-amber-400' :
                       'text-red-600 dark:text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Confidence badge */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-500" />
          Extracted Text
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">OCR confidence</span>
          <span className={`text-sm font-bold font-mono ${confidenceColor}`}>
            {confidence.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Cleaned text box */}
      <div className="card p-4 relative">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-8">
          {text}
        </p>
        <button
          onClick={copyText}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          title="Copy text"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Parsed ingredients list */}
      {ingredients.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <List className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Parsed ingredients
            </span>
            <span className="ml-auto badge badge-safe">{ingredients.length} found</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
              >
                {ing}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Raw OCR toggle */}
      {raw_text && raw_text !== text && (
        <div>
          <button
            onClick={() => setShowRaw((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showRaw ? 'Hide' : 'Show'} raw OCR output
          </button>
          {showRaw && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono leading-relaxed break-all">
                {raw_text}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}