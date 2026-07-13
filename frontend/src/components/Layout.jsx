import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../services/authService'

export default function Layout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/giris')
    } catch (err) {
      console.error('Çıkış yapılırken hata oluştu:', err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">
          TravelMind AI
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/giris" className="text-sm text-blue-600">Giriş Yap</Link>
              <Link to="/kayit" className="text-sm text-blue-600">Kayıt Ol</Link>
            </div>
          )}
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  )
}