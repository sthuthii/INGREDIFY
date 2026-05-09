import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-secondary dark:bg-surface-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow"
        >
          <Leaf className="w-6 h-6 text-white" strokeWidth={2.5} />
        </motion.div>
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{message}</p>
        </div>
      </motion.div>
    </div>
  )
}

/** Inline spinner for buttons/cards */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' }
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`rounded-full border-2 border-current border-t-transparent ${sizes[size]} ${className}`}
    />
  )
}
