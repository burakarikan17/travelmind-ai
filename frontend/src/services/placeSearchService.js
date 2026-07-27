export async function searchDestinations(query) {
  if (!query || query.trim().length < 2) return []

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`

  const response = await fetch(url)
  if (!response.ok) return []

  const results = await response.json()

  // Kullanıcıya gösterilecek okunabilir bir etiket oluştur: "Roma, İtalya" gibi
  return results.map((r) => ({
    label: formatLabel(r),
    raw: r,
  }))
}

function formatLabel(result) {
  const addr = result.address || {}
  const city = addr.city || addr.town || addr.village || addr.county || result.name
  const country = addr.country

  if (!city || city === country) {
    return country || result.display_name
  }

  return [city, country].filter(Boolean).join(', ')
}