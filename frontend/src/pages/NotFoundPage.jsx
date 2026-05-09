import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary dark:bg-surface-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm px-4"
      >
        <div className="w-20 h-20 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-10 h-10 text-brand-400" />
        </div>
        <h1 className="font-display text-6xl font-bold text-slate-900 dark:text-white mb-2">404</h1>
        <p className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">Page not found</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          This ingredient doesn't exist in our database.
        </p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </motion.div>
    </div>
  )
}
