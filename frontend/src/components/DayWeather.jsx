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
    return (
      <div className="h-9 w-full max-w-xs animate-pulse rounded-btn bg-ink-100" />
    )
  }

  if (isError) {
    return <p className="text-xs text-ink-400">Hava durumu alınamadı.</p>
  }

  if (!data) {
    return (
      <p className="text-xs text-ink-400">
        Bu tarih için hava durumu tahmini henüz mevcut değil.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-btn border border-brand-100 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-900">
      <span>🌡️ {data.minTemp}° / {data.maxTemp}°C</span>
      <span>🌧️ {data.precipitation} mm</span>
      <span>💨 {data.windSpeed} km/s</span>
    </div>
  )
}