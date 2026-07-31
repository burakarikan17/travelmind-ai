import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { getRecentTrips } from '../services/tripService'

export default function RecentTrips() {
  const { user } = useAuth()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recentTrips', user.id],
    queryFn: () => getRecentTrips(user.id, 3),
  })

  // Yükleniyor veya hata varsa ya da hiç plan yoksa, bu bölümü hiç gösterme
  if (isLoading || isError || !data || data.length === 0) {
    return null
  }

  return (
    <div className="mt-10">
      <h2 className="text-label uppercase tracking-wide text-ink-400 mb-3">
        Son Planların
      </h2>
      <div className="flex flex-col gap-2">
        {data.map((trip) => (
          <Link
            key={trip.id}
            to={`/planlar/${trip.id}`}
            className="flex items-center justify-between rounded-card border border-ink-200 bg-white px-4 py-3 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
          >
            <div className="min-w-0">
              <p className="font-semibold text-ink-900 truncate">{trip.destination}</p>
              <p className="text-xs text-ink-400">
                {trip.duration_days} gün · {trip.people_count} kişi
              </p>
            </div>
            <span className="shrink-0 text-xs text-brand-700">Görüntüle →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}