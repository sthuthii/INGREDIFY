import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image as ImageIcon, X, Camera, AlertCircle } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

const ACCEPTED = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }
const MAX_SIZE  = 10 * 1024 * 1024 // 10MB

export default function ImageUploader({ onImageSelected, disabled }) {
  const [preview, setPreview]   = useState(null)
  const [file, setFile]         = useState(null)
  const [fileError, setFileError] = useState('')

  const onDrop = useCallback((accepted, rejected) => {
    setFileError('')

    if (rejected.length > 0) {
      const err = rejected[0].errors[0]
      if (err.code === 'file-too-large') setFileError('File is too large. Max size is 10MB.')
      else if (err.code === 'file-invalid-type') setFileError('Only JPEG, PNG, and WebP images are supported.')
      else setFileError(err.message)
      return
    }

    if (accepted.length === 0) return

    const selected = accepted[0]
    setFile(selected)

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      onImageSelected(selected)
    }
    reader.readAsDataURL(selected)
  }, [onImageSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled,
  })

  const clearImage = (e) => {
    e.stopPropagation()
    setPreview(null)
    setFile(null)
    setFileError('')
    onImageSelected(null)
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {preview ? (
          // ── Preview state ─────────────────────────────────────────────────
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative rounded-2xl overflow-hidden border-2 border-brand-200 dark:border-brand-800 bg-slate-50 dark:bg-slate-900"
          >
            <img
              src={preview}
              alt="Food label preview"
              className="w-full max-h-80 object-contain"
            />
            {/* Overlay bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white text-sm">
                <ImageIcon className="w-4 h-4" />
                <span className="truncate max-w-48">{file?.name}</span>
                <span className="text-white/60 text-xs">{formatFileSize(file?.size)}</span>
              </div>
              <button
                onClick={clearImage}
                disabled={disabled}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors disabled:opacity-50"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          // ── Drop zone state ───────────────────────────────────────────────
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 scale-[1.01]'
                  : disabled
                  ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 cursor-not-allowed opacity-60'
                  : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10'
              }`}
            >
              <input {...getInputProps()} />

              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragActive
                    ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  <Upload className="w-7 h-7" />
                </div>

                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isDragActive ? 'Drop your image here' : 'Drag & drop your food label'}
                  </p>
                  <p className="text-sm text-slate-400">
                    or{' '}
                    <span className="text-brand-600 dark:text-brand-400 font-medium">
                      browse files
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> JPEG, PNG, WebP
                  </span>
                  <span>•</span>
                  <span>Max 10MB</span>
                </div>
              </motion.div>
            </div>

            {/* Mobile camera hint */}
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-3">
              <Camera className="w-3.5 h-3.5" />
              On mobile, you can take a photo directly
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File error */}
      <AnimatePresence>
        {fileError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {fileError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}