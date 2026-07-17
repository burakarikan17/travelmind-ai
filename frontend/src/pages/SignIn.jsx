import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn } from '../services/authService'
import Spinner from '../components/Spinner'
import {
  cardClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from '../lib/uiClasses'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-20">
      <div className="mb-6 text-center">
        <h1 className="text-h1 text-ink-900">Tekrar hoş geldin</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Planlarına ulaşmak için giriş yap.
        </p>
      </div>

      <div className={`${cardClass} p-6 sm:p-8`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className={labelClass}>
              E-posta
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Şifre
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-btn border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700"
            >
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading && <Spinner />}
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-ink-500">
        Hesabın yok mu?{' '}
        <Link
          to="/kayit"
          className="rounded font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
        >
          Kayıt ol
        </Link>
      </p>
    </div>
  )
}
