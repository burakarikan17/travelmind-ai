import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTripById } from "../services/tripService";
import { getExchangeRate } from "../services/currencyService";
import { getCategoryMeta } from "../lib/constants";
import TripMap from "../components/TripMap";
import DayWeather from "../components/DayWeather";
import FavoriteButton from "../components/FavoriteButton";
import { generateTripPdf } from "../services/pdfService";

function TripResultSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6"
      aria-hidden="true"
    >
      <div className="h-8 w-52 animate-pulse rounded-btn bg-ink-200" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-ink-200" />
      <div className="mt-8 flex flex-col gap-6">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-card border border-ink-200 bg-white p-5 shadow-card"
          >
            <div className="h-5 w-44 animate-pulse rounded bg-ink-200" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-ink-100" />
            <div className="mt-5 h-40 w-full animate-pulse rounded-card bg-ink-100" />
            <div className="mt-4 flex flex-col gap-3">
              {[0, 1, 2].map((j) => (
                <div
                  key={j}
                  className="h-20 w-full animate-pulse rounded-card bg-ink-100"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TripResult() {
  const { tripId } = useParams();

  const { data, isLoading, isError, error } = useQuery({
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
          <p className="mt-1.5 text-sm text-danger-600">{error.message}</p>
        </div>
        <Link
          to="/"
          className="mt-6 inline-block rounded-btn font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
        >
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

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {/* --- Başlık --- */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-display text-ink-900">{trip.destination}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generateTripPdf(trip, days)}
              className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:border-brand-400 transition"
            >
              📄 PDF İndir
            </button>
            <FavoriteButton tripId={trip.id} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-700 shadow-card">
            {trip.duration_days} gün
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-700 shadow-card">
            {trip.people_count} kişi
          </span>
          <span className="rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white shadow-card">
            {withConverted(trip.budget)}
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {days.map((day) => (
          <section
            key={day.id}
            className="overflow-hidden rounded-panel border border-ink-200 bg-white shadow-panel"
          >
            {/* --- Gün başlığı --- */}
            <div className="flex items-start gap-3 border-b border-ink-200 bg-ink-50/60 px-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-btn bg-brand-700 text-sm font-bold text-white">
                {day.day_number}
              </span>
              <div className="min-w-0">
                <h2 className="text-h2 text-ink-900">{day.day_number}. Gün</h2>
                <p className="text-xs font-medium text-ink-400">{day.date}</p>
              </div>
            </div>

            <div className="p-5">
              {day.summary && (
                <p className="mb-4 text-sm leading-relaxed text-ink-600">
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
                      className="group rounded-card border border-ink-200 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
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
                              <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-500">
                                {activity.time_slot}
                              </span>
                            )}
                          </div>

                          {activity.description && (
                            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                              {activity.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.chip}`}
                            >
                              {meta.label}
                            </span>
                            {activity.estimated_cost != null && (
                              <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">
                                ~{withConverted(activity.estimated_cost)}
                              </span>
                            )}
                            {!activity.is_place_verified && (
                              <span className="rounded-full bg-warning-50 px-2 py-0.5 text-xs font-semibold text-warning-700">
                                AI önerisi, doğrulanamadı
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
    </div>
  );
}
