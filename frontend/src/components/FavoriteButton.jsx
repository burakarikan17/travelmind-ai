import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { addFavoriteTrip, removeFavoriteTrip, isTripFavorited } from '../services/favoriteService'

export default function FavoriteButton({ tripId }) {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    isTripFavorited(user.id, tripId).then((result) => {
      if (isMounted) {
        setIsFavorited(result)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [user.id, tripId])

  async function handleToggle() {
    setLoading(true)
    try {
      if (isFavorited) {
        await removeFavoriteTrip(user.id, tripId)
        setIsFavorited(false)
      } else {
        await addFavoriteTrip(user.id, tripId)
        setIsFavorited(true)
      }
    } catch (err) {
      console.error('Favori işlemi başarısız:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-sm px-3 py-1.5 rounded border transition disabled:opacity-50 ${
        isFavorited
          ? 'bg-red-50 text-red-600 border-red-200'
          : 'bg-white text-gray-600 border-gray-300 hover:border-red-300'
      }`}
    >
      {isFavorited ? '❤️ Favorilerde' : '🤍 Favorile'}
    </button>
  )
}