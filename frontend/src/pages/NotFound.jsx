import { Link } from 'react-router-dom'
import { primaryButtonClass } from '../lib/uiClasses'

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center sm:py-28">
      <div
        aria-hidden="true"
        className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-5xl shadow-card-hover"
      >
        🧭
      </div>

      <p className="mt-8 text-display text-ink-900">404</p>
      <h1 className="mt-1 text-h2 text-ink-800">Rotadan çıktın</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Aradığın sayfa bulunamadı. Adres değişmiş ya da sayfa kaldırılmış
        olabilir.
      </p>

      <Link to="/" className={`${primaryButtonClass} mt-7`}>
        Ana sayfaya dön
      </Link>
    </div>
  )
}
