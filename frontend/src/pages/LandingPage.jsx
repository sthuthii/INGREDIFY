import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScanLine, Shield, Zap, Heart, ChevronRight, Leaf, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const features = [
  {
    icon: ScanLine,
    title: 'Instant OCR Scanning',
    desc: 'Snap any food label and our AI extracts every ingredient in seconds.',
    color: 'text-brand-500 bg-brand-50 dark:bg-brand-900/30',
  },
  {
    icon: Shield,
    title: 'Harm Detection',
    desc: 'Identifies preservatives, artificial additives, and allergens with severity ratings.',
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30',
  },
  {
    icon: Heart,
    title: 'Personalized Health',
    desc: 'Tailored warnings for diabetes, PCOS, hypertension, and 5+ other conditions.',
    color: 'text-red-500 bg-red-50 dark:bg-red-900/30',
  },
  {
    icon: Zap,
    title: 'AI Health Summary',
    desc: 'Plain-language explanations of what the ingredients mean for your body.',
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30',
  },
]

const stats = [
  { value: '10,000+', label: 'Ingredients tracked' },
  { value: '50+', label: 'Harmful additives flagged' },
  { value: '8', label: 'Health conditions supported' },
  { value: '0–100', label: 'Health score system' },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-brand-50/40 dark:from-surface-dark dark:to-brand-950/20 pt-20 pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-100/50 dark:bg-brand-900/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-brand-100/30 dark:bg-brand-900/10 blur-3xl" />
        </div>

        <div className="container-md relative">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5 fill-current" />
              AI-powered food intelligence
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 text-balance leading-tight"
            >
              Know exactly{' '}
              <span className="gradient-text">what you eat</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 text-balance"
            >
              Scan any packaged food label. Get instant AI analysis of ingredients,
              allergens, health risks — personalized to your health conditions.
            </motion.p>

            {/* CTA */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? '/scan' : '/signup'}
                className="btn-primary text-base px-8 py-3 shadow-glow"
              >
                <ScanLine className="w-5 h-5" />
                {isAuthenticated ? 'Scan a label' : 'Start for free'}
                <ChevronRight className="w-4 h-4" />
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn-secondary text-base px-8 py-3">
                  Sign in
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* Hero visual — mock scan card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 max-w-sm mx-auto"
          >
            <div className="card p-6 shadow-card-hover">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Health Score</p>
                  <p className="text-3xl font-display font-bold text-amber-500">64</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-amber-200 dark:border-amber-800 flex items-center justify-center">
                  <span className="text-amber-500 font-bold text-lg">64</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Sodium Benzoate', badge: 'Medium risk', color: 'badge-warn' },
                  { label: 'Artificial Colors', badge: 'Low risk', color: 'badge-warn' },
                  { label: 'Trans Fat', badge: 'High risk', color: 'badge-danger' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{row.label}</span>
                    <span className={row.color}>{row.badge}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Leaf className="w-3 h-3 text-brand-500" />
                Analyzed by Ingredify AI
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
        <div className="container-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container-lg">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to eat smarter
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Ingredify combines computer vision, NLP, and personalized health data to
              give you the full picture on every food product.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map(({ icon: Icon, title, desc, color }) => (
              <motion.div key={title} variants={item} className="card-hover p-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-600 dark:bg-brand-800">
        <div className="container-sm text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Start scanning for free
          </h2>
          <p className="text-brand-100 mb-8">
            Join thousands making more informed food choices every day.
          </p>
          <Link to={isAuthenticated ? '/scan' : '/signup'} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-colors shadow-lg">
            <ScanLine className="w-5 h-5" />
            {isAuthenticated ? 'Scan now' : 'Create free account'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
        <div className="container-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Leaf className="w-4 h-4 text-brand-500" />
            <span>Ingredify © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
