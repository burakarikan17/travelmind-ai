import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { getFavoriteTrips } from '../services/favoriteService'

export default function Favorites() {
  const { user } = useAuth()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['favorites', user.id],
    queryFn: () => getFavoriteTrips(user.id),
  })

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
            className="border rounded-lg p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{fav.trips.destination}</span>
              <span className="text-xs text-gray-500">
                {fav.trips.duration_days} gün
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {fav.trips.people_count} kişi · {fav.trips.budget} {fav.trips.currency}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}