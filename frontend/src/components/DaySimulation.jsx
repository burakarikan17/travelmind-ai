import { useState, useEffect } from 'react'
import SimulationMap from './SimulationMap'

export default function DaySimulation({ day, onClose }) {
  const activities = day.trip_activities
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const activeActivity = activities[activeIndex]

  // Doğrulanmış noktaların ortalaması (fallback merkez)
  const verified = activities.filter((a) => a.latitude != null && a.longitude != null)
  const fallbackCenter =
    verified.length > 0
      ? [
          verified.reduce((sum, a) => sum + a.latitude, 0) / verified.length,
          verified.reduce((sum, a) => sum + a.longitude, 0) / verified.length,
        ]
      : [41.9028, 12.4964] // son çare: Roma (harita hiç boş kalmasın)

  // Otomatik oynatma
  useEffect(() => {
    if (!isPlaying) return

    const timer = setTimeout(() => {
      if (activeIndex < activities.length - 1) {
        setActiveIndex((prev) => prev + 1)
      } else {
        setIsPlaying(false) // son aktivitede dur
      }
    }, 3000) // her 3 saniyede bir sonraki

    return () => clearTimeout(timer)
  }, [isPlaying, activeIndex, activities.length])

  function goNext() {
    if (activeIndex < activities.length - 1) setActiveIndex((prev) => prev + 1)
  }

  function goPrev() {
    if (activeIndex > 0) setActiveIndex((prev) => prev - 1)
  }

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-ink-900/95 backdrop-blur">
      {/* Üst bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="font-semibold">
          {day.day_number}. Gün Simülasyonu · {activeIndex + 1}/{activities.length}
        </span>
        <button
          onClick={onClose}
          className="rounded-btn bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
        >
          ✕ Kapat
        </button>
      </div>

      {/* Harita */}
      <div className="relative flex-1 overflow-hidden">
        <SimulationMap
          activities={activities}
          activeIndex={activeIndex}
          fallbackCenter={fallbackCenter}
        />
      </div>

      {/* Alt panel: aktif aktivite kartı + kontroller */}
      <div className="bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-semibold text-brand-700">
                {activeActivity.time_slot}
              </span>
              <h3 className="mt-0.5 text-h3 font-bold text-ink-900">
                {activeActivity.title}
              </h3>
              {activeActivity.description && (
                <p className="mt-1 text-sm text-ink-500">{activeActivity.description}</p>
              )}
              {!activeActivity.is_place_verified && (
                <p className="mt-1.5 text-xs text-warning-700">
                  ⚠ Bu mekanın tam konumu doğrulanamadı, harita yaklaşık bölgeyi gösteriyor.
                </p>
              )}
            </div>
          </div>

          {/* Kontroller */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="rounded-btn border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 disabled:opacity-40"
            >
              ← Önceki
            </button>

            <button
              onClick={() => setIsPlaying((prev) => !prev)}
              className="rounded-btn bg-brand-700 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            >
              {isPlaying ? '⏸ Duraklat' : '▶ Oynat'}
            </button>

            <button
              onClick={goNext}
              disabled={activeIndex === activities.length - 1}
              className="rounded-btn border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 disabled:opacity-40"
            >
              Sonraki →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}