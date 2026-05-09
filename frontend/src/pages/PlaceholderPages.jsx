// Placeholder pages — each will be fully built in their respective phases

import { motion } from 'framer-motion'
import { BarChart2, History, MessageSquare } from 'lucide-react'

const Placeholder = ({ title, icon: Icon, phase, description }) => (
  <div className="page-wrapper min-h-[calc(100vh-4rem)] flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-sm"
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-brand-500" />
      </div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{description}</p>
      <span className="badge badge-safe">Built in {phase}</span>
    </motion.div>
  </div>
)

// ScanPage is now a real page — see src/pages/ScanPage.jsx

export const DashboardPage = () => (
  <Placeholder
    title="Analytics Dashboard"
    icon={BarChart2}
    phase="Phase 6"
    description="Visual breakdown of your food scans and nutrition insights."
  />
)

export const HistoryPage = () => (
  <Placeholder
    title="Scan History"
    icon={History}
    phase="Phase 6"
    description="All your past scans and saved products in one place."
  />
)

export const ChatPage = () => (
  <Placeholder
    title="AI Nutrition Assistant"
    icon={MessageSquare}
    phase="Phase 5"
    description="Ask anything about ingredients, nutrition, and your health."
  />
)

// ProfilePage is now a real page — see src/pages/ProfilePage.jsx