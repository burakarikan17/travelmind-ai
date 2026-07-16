export async function getWeatherForecast(latitude, longitude, date) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto&start_date=${date}&end_date=${date}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('WEATHER_FETCH_FAILED')
  }

  const data = await response.json()

  // Open-Meteo, tarih aralığın dışındaysa boş dizi döndürür (hata vermez)
  if (!data.daily || data.daily.time.length === 0) {
    return null
  }

  return {
    maxTemp: data.daily.temperature_2m_max[0],
    minTemp: data.daily.temperature_2m_min[0],
    precipitation: data.daily.precipitation_sum[0],
    windSpeed: data.daily.windspeed_10m_max[0],
  }
}