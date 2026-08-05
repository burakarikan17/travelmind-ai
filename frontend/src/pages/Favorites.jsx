import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { getFavoriteTrips, removeFavoriteTrip } from '../services/favoriteService'

export default function Favorites() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['favorites', user.id],
    queryFn: () => getFavoriteTrips(user.id),
  })

  const removeMutation = useMutation({
    mutationFn: (tripId) => removeFavoriteTrip(user.id, tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user.id] })
    },
  })

function handleRemove(e, tripId) {
  e.preventDefault()
  e.stopPropagation()
  if (window.confirm('Bu planı favorilerden çıkarmak istediğinize emin misiniz?')) {
    removeMutation.mutate(tripId)
  }
}

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Favoriler yükleniyor...</div>
  }

  if (isError) {
    return <div className="p-6 text-center text-red-500">Favoriler yüklenemedi.</div>
  }

  if (data.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 text-center text-gray-500">
        <p>Henüz favori bir planınız yok.</p>
        <Link to="/" className="text-brand-700 hover:underline text-sm mt-2 inline-block">
          Yeni bir plan oluştur
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">Favori Planlarım</h1>

      <div className="flex flex-col gap-3">
        {data.map((fav) => (
          <Link
            key={fav.id}
            to={`/planlar/${fav.trips.id}`}
            className="flex items-center justify-between rounded-card border border-ink-200 bg-white px-4 py-3 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
          >
            <div className="min-w-0">
              <p className="font-semibold text-ink-900 truncate">{fav.trips.destination}</p>
              <p className="text-xs text-ink-400">
                {fav.trips.duration_days} gün · {fav.trips.people_count} kişi · {fav.trips.budget} {fav.trips.currency}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-brand-700">Görüntüle →</span>
              <button
                onClick={(e) => handleRemove(e, fav.trips.id)}
                disabled={removeMutation.isPending}
                className="rounded-btn border border-ink-200 px-2 py-1 text-xs text-ink-500 transition-colors hover:border-danger-200 hover:bg-danger-50 hover:text-danger-700 disabled:opacity-50"
                aria-label="Favorilerden çıkar"
              >
                ♥ Çıkar
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}