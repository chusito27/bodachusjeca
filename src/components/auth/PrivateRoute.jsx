import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../ui/LoadingSpinner'
import PendingApproval from './PendingApproval'

export default function PrivateRoute({ children, requiredRole }) {
  const { user, loading, userProfile, profileLoading } = useAuth()

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // User has no role assigned yet
  if (!userProfile?.role) {
    return <PendingApproval />
  }

  // Route requires a specific role the user doesn't have
  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to="/" />
  }

  return children
}
