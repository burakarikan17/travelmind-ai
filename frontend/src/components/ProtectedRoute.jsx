import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Yükleniyor...</div>
  if (!user) return <Navigate to="/giris" replace />

  return children
}