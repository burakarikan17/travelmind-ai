export const INTEREST_OPTIONS = [
  { value: 'tarih', label: 'Tarih' },
  { value: 'doga', label: 'Doğa' },
  { value: 'yemek', label: 'Yeme-İçme' },
  { value: 'sanat', label: 'Sanat' },
  { value: 'eglence', label: 'Eğlence' },
  { value: 'alisveris', label: 'Alışveriş' },
  { value: 'plaj', label: 'Plaj' },
  { value: 'fotografcilik', label: 'Fotoğrafçılık' },
  { value: 'gece-hayati', label: 'Gece Hayatı' },
  { value: 'muze', label: 'Müzeler' },
]

export const CURRENCY_OPTIONS = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
]

/*
  Aktivite kategorileri — geminiService.js'in ürettiği değerlerle birebir aynı
  olmalı: "gezi | yeme-icme | eglence | ulasim | diger"
*/
export const ACTIVITY_CATEGORY_META = {
  gezi: { icon: '🏛️', label: 'Gezi', chip: 'bg-brand-50 text-brand-800' },
  'yeme-icme': { icon: '🍽️', label: 'Yeme-İçme', chip: 'bg-orange-50 text-orange-800' },
  eglence: { icon: '🎭', label: 'Eğlence', chip: 'bg-purple-50 text-purple-800' },
  ulasim: { icon: '🚌', label: 'Ulaşım', chip: 'bg-sky-50 text-sky-800' },
  diger: { icon: '📍', label: 'Diğer', chip: 'bg-ink-100 text-ink-700' },
}

export function getCategoryMeta(category) {
  return ACTIVITY_CATEGORY_META[category] ?? ACTIVITY_CATEGORY_META.diger
}