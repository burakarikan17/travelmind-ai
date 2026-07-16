// Nominatim kullanım politikası: saniyede en fazla 1 istek.
// Bu yüzden aktiviteler sıralı (sequential) işlenir, Promise.all KULLANILMAZ.
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function verifyPlace(title, destination) {
  const query = encodeURIComponent(`${title}, ${destination}`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`

  console.log('Nominatim sorgusu:', title, '→', url)

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TravelMindAI/1.0 (staj projesi)' },
    })

    if (!response.ok) {
      console.log('Nominatim response hatası:', response.status)
      return { verified: false, latitude: null, longitude: null }
    }

    const results = await response.json()
    console.log('Nominatim sonuç sayısı:', results.length, 'title:', title)

    if (results.length === 0) {
      return { verified: false, latitude: null, longitude: null }
    }

    return {
      verified: true,
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
    }
  } catch (err) {
    console.error('Nominatim hatası:', err.message)
    return { verified: false, latitude: null, longitude: null }
  }
}

export async function verifyPlanPlaces(planData, destination) {
  for (const day of planData.days) {
    for (const activity of day.activities) {
      const searchTerm = activity.placeName?.trim() || activity.title

      if (!searchTerm) {
        activity.isPlaceVerified = false
        activity.latitude = null
        activity.longitude = null
        continue
      }

      const result = await verifyPlace(searchTerm, destination)
      activity.isPlaceVerified = result.verified
      activity.latitude = result.latitude
      activity.longitude = result.longitude

      await sleep(1100)
    }
  }
  return planData
}