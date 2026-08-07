import { useState, useEffect } from "react";
import SimulationMap from "./SimulationMap";

// "09:00 - 12:00" formatından başlangıç ve bitişi dakikaya çevir
function parseTimeSlot(timeSlot) {
  if (!timeSlot) return null;
  const match = timeSlot.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const startMin = parseInt(match[1]) * 60 + parseInt(match[2]);
  const endMin = parseInt(match[3]) * 60 + parseInt(match[4]);
  return { startMin, endMin };
}

// Dakikayı "09:30" formatına çevir
function formatMinutes(totalMin) {
  const h = Math.floor(totalMin / 60) % 24;
  const m = Math.floor(totalMin % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function DaySimulation({ day, onClose }) {
  const activities = day.trip_activities;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMin, setCurrentMin] = useState(null);

  const activeActivity = activities[activeIndex];
  const timeRange = parseTimeSlot(activeActivity?.time_slot);

  const verified = activities.filter(
    (a) => a.latitude != null && a.longitude != null,
  );
  const fallbackCenter =
    verified.length > 0
      ? [
          verified.reduce((sum, a) => sum + a.latitude, 0) / verified.length,
          verified.reduce((sum, a) => sum + a.longitude, 0) / verified.length,
        ]
      : [41.9028, 12.4964];

  // Aktivite değişince saati başlangıca sıfırla
  useEffect(() => {
    if (timeRange) {
      setCurrentMin(timeRange.startMin);
    } else {
      setCurrentMin(null);
    }
  }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Oynatma: saati ilerlet, bitince sonraki aktiviteye geç
  // Oynatma: saati ilerlet
  useEffect(() => {
    if (!isPlaying || timeRange == null) return;

    const timer = setInterval(() => {
      setCurrentMin((prev) => {
        const next = prev + 5;
        return next >= timeRange.endMin ? timeRange.endMin : next;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [isPlaying, timeRange]);

  // Saat bitişe ulaşınca sonraki aktiviteye geç (ayrı, güvenli kontrol)
  useEffect(() => {
    if (!isPlaying || timeRange == null || currentMin == null) return;

    if (currentMin >= timeRange.endMin) {
      // Kısa bir bekleme sonra sonraki aktiviteye geç
      const timer = setTimeout(() => {
        if (activeIndex < activities.length - 1) {
          setActiveIndex((i) => i + 1);
        } else {
          setIsPlaying(false);
        }
      }, 500); // bitiş saatinde yarım saniye bekle, sonra geç

      return () => clearTimeout(timer);
    }
  }, [currentMin, timeRange, isPlaying, activeIndex, activities.length]);

  // Saat parse edilemeyen aktivitelerde oynatmada basit geçiş
  useEffect(() => {
    if (!isPlaying || timeRange != null) return;
    const timer = setTimeout(() => {
      if (activeIndex < activities.length - 1) {
        setActiveIndex((i) => i + 1);
      } else {
        setIsPlaying(false);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isPlaying, timeRange, activeIndex, activities.length]);

  function goNext() {
    if (activeIndex < activities.length - 1) setActiveIndex((prev) => prev + 1);
  }

  function goPrev() {
    if (activeIndex > 0) setActiveIndex((prev) => prev - 1);
  }

  if (!activeActivity) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-ink-900/95 backdrop-blur">
      {/* Üst bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="font-semibold">
          {day.day_number}. Gün Simülasyonu · {activeIndex + 1}/
          {activities.length}
        </span>
        <button
          onClick={onClose}
          className="rounded-btn bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
        >
          ✕ Kapat
        </button>
      </div>

      {/* Saat göstergesi */}
      <div className="flex justify-center pb-2">
        <div className="rounded-full bg-white/10 px-6 py-2 font-mono text-2xl font-bold text-white tabular-nums">
          🕐{" "}
          {currentMin != null
            ? formatMinutes(currentMin)
            : activeActivity.time_slot}
        </div>
      </div>

      {/* Harita */}
      <div className="relative flex-1 overflow-hidden">
        <SimulationMap
          activities={activities}
          activeIndex={activeIndex}
          fallbackCenter={fallbackCenter}
        />
      </div>

      {/* Alt panel */}
      <div className="bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <span className="text-xs font-semibold text-brand-700">
            {activeActivity.time_slot}
          </span>
          <h3 className="mt-0.5 text-h3 font-bold text-ink-900">
            {activeActivity.title}
          </h3>
          {activeActivity.description && (
            <p className="mt-1 text-sm text-ink-500">
              {activeActivity.description}
            </p>
          )}
          {!activeActivity.is_place_verified && (
            <p className="mt-1.5 text-xs text-warning-700">
              ⚠ Bu mekanın tam konumu doğrulanamadı, harita yaklaşık bölgeyi
              gösteriyor.
            </p>
          )}

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
              {isPlaying ? "⏸ Duraklat" : "▶ Oynat"}
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
  );
}
