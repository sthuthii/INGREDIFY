import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoadingScreen from '@/components/ui/LoadingScreen'

// Routes that don't require a completed profile
const PROFILE_EXEMPT = ['/onboarding', '/profile']

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, profile } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />

  // Not logged in → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but hasn't completed onboarding → send to onboarding
  const isExempt = PROFILE_EXEMPT.some((p) => location.pathname.startsWith(p))
  if (!isExempt && profile && !profile.onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}