import { useQuery } from '@tanstack/react-query'
import { getWeatherForecast } from '../services/weatherService'

export default function DayWeather({ latitude, longitude, date }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['weather', latitude, longitude, date],
    queryFn: () => getWeatherForecast(latitude, longitude, date),
    enabled: latitude != null && longitude != null, // koordinat yoksa hiç istek atma
  })

  if (latitude == null || longitude == null) {
    return null // bu güne ait doğrulanmış konum yoksa hava durumu da gösterilemez
  }

  if (isLoading) {
    return <p className="text-xs text-gray-400">Hava durumu yükleniyor...</p>
  }

  if (isError) {
    return <p className="text-xs text-gray-400">Hava durumu alınamadı.</p>
  }

  if (!data) {
    return (
      <p className="text-xs text-gray-400">
        Bu tarih için hava durumu tahmini henüz mevcut değil.
      </p>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm bg-blue-50 rounded px-3 py-2">
      <span>🌡️ {data.minTemp}° / {data.maxTemp}°C</span>
      <span>🌧️ {data.precipitation} mm</span>
      <span>💨 {data.windSpeed} km/s</span>
    </div>
  )
}