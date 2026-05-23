import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, ArrowRight, RefreshCw, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAuth } from '@/hooks/useAuth'
import { scanAPI } from '@/lib/api'
import ImageUploader from '@/components/scan/ImageUploader'
import ScanProgress from '@/components/scan/ScanProgress'
import OcrResult from '@/components/scan/OcrResult'

const STAGE_DELAYS = [0, 900, 1800] // ms — simulates pipeline stages for UX

export default function ScanPage() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const [imageFile, setImageFile]   = useState(null)
  const [scanning, setScanning]     = useState(false)
  const [stage, setStage]           = useState(0)
  const [ocrResult, setOcrResult]   = useState(null)
  const [error, setError]           = useState('')

  const handleImageSelected = (file) => {
    setImageFile(file)
    setOcrResult(null)
    setError('')
  }

  const advanceStages = () => {
    // Animate through pipeline stages for visual feedback
    STAGE_DELAYS.forEach((delay, i) => {
      setTimeout(() => setStage(i), delay)
    })
  }

  const handleScan = async () => {
    if (!imageFile) {
      toast.error('Please upload a food label image first.')
      return
    }

    setScanning(true)
    setOcrResult(null)
    setError('')
    setStage(0)
    advanceStages()

    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const result = await scanAPI.scan(formData)
      setOcrResult(result)

      if (result.ingredients?.length === 0) {
        toast('Text extracted but no ingredients detected. Try the analyze step anyway.', {
          icon: '⚠️',
        })
      } else {
        toast.success(`Found ${result.ingredients.length} ingredients!`)
      }
    } catch (err) {
      const msg = err.message || 'Scan failed. Try a clearer image.'
      setError(msg)
      toast.error(msg)
    } finally {
      setScanning(false)
    }
  }

  const handleAnalyze = () => {
  if (!ocrResult) return
  navigate('/analyze', {
    state: {
      ocrResult,
      userProfile: profile,
    },
  })
}

  const reset = () => {
    setImageFile(null)
    setOcrResult(null)
    setError('')
    setStage(0)
  }

  return (
    <div className="page-wrapper py-8">
      <div className="container-sm space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Scan a Food Label
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm ml-12">
            Upload a photo of any packaged food label to extract and analyse its ingredients.
          </p>
        </motion.div>

        {/* Upload card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-6"
        >
          <ImageUploader
            onImageSelected={handleImageSelected}
            disabled={scanning}
          />

          {/* Tips */}
          {!imageFile && (
            <div className="mt-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900">
              <p className="text-xs text-brand-700 dark:text-brand-300 font-medium mb-1">
                📸 Tips for best results
              </p>
              <ul className="text-xs text-brand-600 dark:text-brand-400 space-y-0.5">
                <li>• Lay the product flat on a plain background</li>
                <li>• Make sure the ingredient list is fully visible</li>
                <li>• Use good lighting and avoid glare</li>
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleScan}
              disabled={!imageFile || scanning}
              className="btn-primary flex-1 py-3"
            >
              {scanning ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"
                  />
                  Scanning…
                </span>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  Scan label
                </>
              )}
            </button>

            {(ocrResult || error) && (
              <button onClick={reset} className="btn-secondary px-4 py-3">
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Progress indicator */}
        <ScanProgress stage={stage} visible={scanning} />

        {/* Error state */}
        <AnimatePresence>
          {error && !scanning && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-5 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
            >
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">⚠️ {error}</p>
              <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                Try again with a clearer, well-lit photo of the ingredient list.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OCR result */}
        <AnimatePresence>
          {ocrResult && !scanning && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-6 space-y-5"
            >
              <OcrResult result={ocrResult} />

              {/* Analyse CTA */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Ready to analyse?
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Get health score, allergen warnings, and AI insights
                    </p>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    className="btn-primary gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Analyse
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <button onClick={async () => {
          const { auth } = await import('@/lib/firebase')
          const token = await auth.currentUser.getIdToken()
          console.log('TOKEN:', token)
          navigator.clipboard.writeText(token)
          alert('Token copied to clipboard!')
}}>
  Copy Auth Token
</button>
    </div>
    
  )
}