import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const { t } = useLanguage()

  if (loading) {
    return <div>{t('common.loading')}</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
