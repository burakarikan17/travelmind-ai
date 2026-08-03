import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { getRecentTrips, deleteTrip } from '../services/tripService'

export default function RecentTrips() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recentTrips', user.id],
    queryFn: () => getRecentTrips(user.id, 3),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      // Silme başarılı olunca listeyi yeniden çek
      queryClient.invalidateQueries({ queryKey: ['recentTrips', user.id] })
    },
  })

  function handleDelete(e, tripId) {
    e.preventDefault() // Link'e tıklamayı engelle (silme butonu Link'in içinde)
    e.stopPropagation()
    if (window.confirm('Bu planı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(tripId)
    }
  }

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
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-brand-700">Görüntüle →</span>
              <button
                onClick={(e) => handleDelete(e, trip.id)}
                disabled={deleteMutation.isPending}
                className="rounded-btn border border-ink-200 px-2 py-1 text-xs text-ink-500 transition-colors hover:border-danger-200 hover:bg-danger-50 hover:text-danger-700 disabled:opacity-50"
                aria-label="Planı sil"
              >
                Sil
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}