/*
  Tasarım sistemindeki tekrar eden Tailwind sınıf gruplarını tek yerde tutar.
  Bir component kütüphanesi değildir; yalnızca string sabitleridir.
*/

export const labelClass = 'mb-1.5 block text-label text-ink-700'

export const inputClass = [
  'w-full rounded-btn border border-ink-300 bg-white px-3 py-2.5 text-sm text-ink-900',
  'placeholder:text-ink-400',
  'transition-colors outline-none',
  'hover:border-ink-400',
  'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25',
  'disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-400',
].join(' ')

/* Zod/react-hook-form hatası olan alanlar için */
export const inputErrorClass = [
  'border-danger-600 focus:border-danger-600 focus:ring-danger-600/25',
].join(' ')

export const primaryButtonClass = [
  'inline-flex items-center justify-center gap-2 rounded-btn bg-brand-700 px-4 py-2.5',
  'text-sm font-semibold text-white shadow-card',
  'transition-all outline-none',
  'hover:bg-brand-800 hover:shadow-card-hover',
  'active:translate-y-px active:shadow-card',
  'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:bg-brand-700/50 disabled:shadow-none disabled:hover:translate-y-0',
].join(' ')

export const cardClass =
  'rounded-card border border-ink-200 bg-white shadow-card'

export const fieldErrorClass = 'mt-1.5 text-xs font-medium text-danger-600'
