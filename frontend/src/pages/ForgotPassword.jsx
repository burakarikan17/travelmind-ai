import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../services/authService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-20 w-full max-w-md px-4">
      <h1 className="text-h1 text-ink-900 text-center">Şifreni mi unuttun?</h1>
      <p className="mt-2 text-center text-sm text-ink-500">
        E-posta adresini gir, sana bir şifre sıfırlama bağlantısı gönderelim.
      </p>

      <div className="mt-8 rounded-panel border border-ink-200 bg-white p-6 shadow-card">
        {sent ? (
          <div className="text-center">
            <p className="text-success-700 font-semibold">Bağlantı gönderildi ✓</p>
            <p className="mt-2 text-sm text-ink-500">
              E-postanı kontrol et. Bağlantı gelmezse spam klasörüne de bak.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ornek@eposta.com"
                className="w-full rounded-btn border border-ink-200 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            {error && <p className="text-sm text-danger-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-btn bg-brand-700 px-4 py-2.5 font-semibold text-white shadow-card transition-all hover:bg-brand-800 disabled:opacity-50"
            >
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
            </button>
          </form>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-ink-500">
        <Link to="/giris" className="text-brand-700 hover:underline">
          Giriş sayfasına dön
        </Link>
      </p>
    </div>
  )
}