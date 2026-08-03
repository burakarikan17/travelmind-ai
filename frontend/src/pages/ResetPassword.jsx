import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../services/authService'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      alert('Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.')
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-20 w-full max-w-md px-4">
      <h1 className="text-h1 text-ink-900 text-center">Yeni Şifre Belirle</h1>
      <p className="mt-2 text-center text-sm text-ink-500">
        Hesabın için yeni bir şifre gir.
      </p>

      <div className="mt-8 rounded-panel border border-ink-200 bg-white p-6 shadow-card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Yeni Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="En az 6 karakter"
              className="w-full rounded-btn border border-ink-200 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          {error && <p className="text-sm text-danger-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-btn bg-brand-700 px-4 py-2.5 font-semibold text-white shadow-card transition-all hover:bg-brand-800 disabled:opacity-50"
          >
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  )
}