import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Share2,
  Play,
  Calendar,
  Users,
  Wallet,
  MapPin,
  Check,
  ExternalLink,
  PlusCircle,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";
import { getTripById } from "../services/tripService";
import { getExchangeRate } from "../services/currencyService";
import { getCategoryMeta } from "../lib/constants";
import TripMap from "../components/TripMap";
import DayWeather from "../components/DayWeather";
import FavoriteButton from "../components/FavoriteButton";
import { generateTripPdf } from "../services/pdfService";
import TripResultSkeleton from "../components/TripResultSkeleton";
import DaySimulation from "../components/DaySimulation";

export default function TripResult() {
  const { tripId } = useParams();
  const [simulationDay, setSimulationDay] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTripById(tripId),
  });

  const trip = data?.trip;
  const days = data?.days;

  const { data: exchangeRate } = useQuery({
    queryKey: ["fx", trip?.currency, trip?.destination_currency],
    queryFn: () => getExchangeRate(trip.currency, trip.destination_currency),
    enabled:
      !!trip?.destination_currency &&
      trip.destination_currency !== trip.currency,
  });

  if (isLoading) {
    return <TripResultSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
        <div className="rounded-card border border-danger-200 bg-danger-50 p-6">
          <p className="text-h2 text-danger-700">Plan yüklenemedi</p>
          <p className="mt-1.5 text-sm text-danger-600">
            Bu plan bulunamadı veya erişim izniniz yok.
          </p>
        </div>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-btn font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni plan oluştur
        </Link>
      </div>
    );
  }

  function withConverted(amount) {
    if (
      !exchangeRate ||
      !trip.destination_currency ||
      trip.destination_currency === trip.currency
    ) {
      return `${amount} ${trip.currency}`;
    }
    const converted = (amount * exchangeRate).toFixed(0);
    return `${amount} ${trip.currency} (~${converted} ${trip.destination_currency})`;
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Plan linki panoya kopyalandı! 🔗");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Link kopyalanamadı.");
    }
  }

  async function handleDownloadPdf() {
    const toastId = toast.loading("PDF hazırlanıyor...");
    try {
      await generateTripPdf(trip, days, exchangeRate);
      toast.success("PDF başarıyla indirildi! 📄", { id: toastId });
    } catch (err) {
      console.error("PDF hatası:", err);
      toast.error("PDF oluşturulurken hata oluştu.", { id: toastId });
    }
  }

  // Kategori bazlı tahmini harcama hesaplama
  const categoryTotals = days
    ? days.reduce((acc, day) => {
        day.trip_activities.forEach((act) => {
          if (act.estimated_cost) {
            const cat = act.category || "diger";
            acc[cat] = (acc[cat] || 0) + Number(act.estimated_cost);
          }
        });
        return acc;
      }, {})
    : {};

  const totalEstimatedCost = Object.values(categoryTotals).reduce(
    (sum, val) => sum + val,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* --- Başlık & Aksiyonlar --- */}
      <header className="mb-8 rounded-panel border border-ink-200 bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-brand-600 shrink-0" />
              <h1 className="text-display text-ink-900">{trip.destination}</h1>
            </div>
            <p className="text-xs text-ink-500 mt-1">
              Yapay Zeka Destekli Kişiselleştirilmiş Seyahat Planı
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-btn border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-card transition-all hover:border-brand-300 hover:text-brand-700 cursor-pointer"
              title="Plan Linkini Paylaş"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success-700" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              <span>{copied ? "Kopyalandı" : "Paylaş"}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 rounded-btn border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-card transition-all hover:border-brand-300 hover:text-brand-700 cursor-pointer"
            >
              <Download className="h-4 w-4 text-brand-600" />
              <span>PDF İndir</span>
            </button>

            <FavoriteButton tripId={trip.id} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-ink-100">
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-700">
            <Calendar className="h-3.5 w-3.5 text-ink-500" />
            {trip.duration_days} gün
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-700">
            <Users className="h-3.5 w-3.5 text-ink-500" />
            {trip.people_count} kişi
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white shadow-card">
            <Wallet className="h-3.5 w-3.5 text-white/80" />
            Bütçe: {withConverted(trip.budget)}
          </span>
        </div>

        {/* --- Kategori Bütçe Özeti --- */}
        {totalEstimatedCost > 0 && (
          <div className="mt-5 rounded-card bg-ink-50/80 p-4 border border-ink-200/60">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink-900">
                <PieChart className="h-4 w-4 text-brand-600" />
                Tahmini Harcama Dağılımı
              </span>
              <span className="text-xs font-semibold text-brand-700">
                Toplam ~{withConverted(totalEstimatedCost)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
              {Object.entries(categoryTotals).map(([cat, cost]) => {
                const meta = getCategoryMeta(cat);
                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded bg-white p-2 border border-ink-100 shadow-xs"
                  >
                    <span className="flex items-center gap-1 font-medium text-ink-700">
                      <span>{meta.icon}</span>
                      {meta.label}
                    </span>
                    <span className="font-semibold text-ink-900">
                      ~{cost} {trip.currency}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* --- Günlük Planlar --- */}
      <div className="flex flex-col gap-6">
        {days.map((day) => (
          <section
            key={day.id}
            className="overflow-hidden rounded-panel border border-ink-200 bg-white shadow-panel"
          >
            {/* --- Gün başlığı --- */}
            <div className="flex items-center justify-between border-b border-ink-200 bg-ink-50/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-btn bg-brand-700 text-sm font-bold text-white shadow-card">
                  {day.day_number}
                </span>
                <div>
                  <h2 className="text-h2 font-semibold text-ink-900">
                    {day.day_number}. Gün
                  </h2>
                  <p className="text-xs font-medium text-ink-400">{day.date}</p>
                </div>
              </div>

              <button
                onClick={() => setSimulationDay(day)}
                className="inline-flex items-center gap-1.5 rounded-btn bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-card transition-all hover:bg-brand-800 active:translate-y-px cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                Simülasyon
              </button>
            </div>

            <div className="p-5">
              {day.summary && (
                <p className="mb-4 text-sm leading-relaxed text-ink-600 bg-brand-50/40 p-3 rounded-card border border-brand-100/60">
                  {day.summary}
                </p>
              )}

              {(() => {
                const firstVerified = day.trip_activities.find(
                  (a) => a.latitude != null && a.longitude != null,
                );
                return (
                  <div className="mb-4">
                    <DayWeather
                      latitude={firstVerified?.latitude}
                      longitude={firstVerified?.longitude}
                      date={day.date}
                    />
                  </div>
                );
              })()}

              <div className="mb-5 overflow-hidden rounded-card border border-ink-200 relative isolate z-0">
                <TripMap activities={day.trip_activities} />
              </div>

              {/* --- Aktivite kartları --- */}
              <div className="flex flex-col gap-3">
                {day.trip_activities.map((activity) => {
                  const meta = getCategoryMeta(activity.category);
                  return (
                    <article
                      key={activity.id}
                      className="group rounded-card border border-ink-200 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-btn bg-ink-100 text-lg transition-colors group-hover:bg-brand-50"
                        >
                          {meta.icon}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-bold text-ink-900">
                              {activity.title}
                            </h3>
                            {activity.time_slot && (
                              <span className="shrink-0 rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-600">
                                {activity.time_slot}
                              </span>
                            )}
                          </div>

                          {activity.description && (
                            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                              {activity.description}
                            </p>
                          )}

                          {activity.place_name && (
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(activity.place_name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline mt-1.5 font-medium"
                            >
                              <MapPin className="h-3 w-3" />
                              {activity.place_name}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.chip}`}
                            >
                              {meta.label}
                            </span>
                            {activity.estimated_cost != null && (
                              <span className="rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-semibold text-success-700 border border-success-200/60">
                                ~{withConverted(activity.estimated_cost)}
                              </span>
                            )}
                            {!activity.is_place_verified && (
                              <span className="rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-semibold text-warning-700 border border-warning-200/60">
                                AI önerisi, harita konumu yok
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-btn bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-800 active:translate-y-px"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni Plan Oluştur
        </Link>
      </div>

      {simulationDay && (
        <DaySimulation
          day={simulationDay}
          onClose={() => setSimulationDay(null)}
        />
      )}
    </div>
  );
}

