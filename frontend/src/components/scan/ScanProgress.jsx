import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, Cpu, Zap } from 'lucide-react'

const STAGES = [
  { icon: ScanLine, label: 'Uploading image…',          duration: 800  },
  { icon: Cpu,      label: 'Preprocessing with OpenCV…', duration: 1200 },
  { icon: Zap,      label: 'Extracting text via OCR…',  duration: 2000 },
]

export default function ScanProgress({ stage = 0, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="card p-6"
        >
          {/* Animated scanner line */}
          <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
            <motion.div
              className="absolute inset-y-0 left-0 bg-brand-500 rounded-full"
              animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Shimmer */}
            <motion.div
              className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ left: ['-10%', '110%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Stage list */}
          <div className="space-y-3">
            {STAGES.map((s, i) => {
              const Icon   = s.icon
              const done   = i < stage
              const active = i === stage
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    done   ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600'   :
                    active ? 'bg-brand-500 text-white shadow-glow' :
                             'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                  }`}>
                    {done ? (
                      <motion.svg
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-4 h-4" viewBox="0 0 16 16" fill="none"
                      >
                        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </motion.svg>
                    ) : active ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <span className={`text-sm font-medium transition-colors ${
                    done   ? 'text-brand-600 dark:text-brand-400 line-through decoration-brand-300' :
                    active ? 'text-slate-900 dark:text-white' :
                             'text-slate-400 dark:text-slate-600'
                  }`}>
                    {s.label}
                  </span>

                  {active && (
                    <motion.div className="ml-auto flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          className="w-1.5 h-1.5 rounded-full bg-brand-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}