import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

// Harita görünümünü aktif aktiviteye yumuşakça kaydıran yardımcı
function FlyToActive({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.2 })
    }
  }, [position, map])

  return null
}

export default function SimulationMap({ activities, activeIndex, fallbackCenter }) {
  const verifiedActivities = activities.filter(
    (a) => a.latitude != null && a.longitude != null
  )

  const activeActivity = activities[activeIndex]
  const activePosition =
    activeActivity?.latitude != null && activeActivity?.longitude != null
      ? [activeActivity.latitude, activeActivity.longitude]
      : fallbackCenter

  const initialCenter =
    verifiedActivities.length > 0
      ? [verifiedActivities[0].latitude, verifiedActivities[0].longitude]
      : fallbackCenter

  return (
    <MapContainer
      center={initialCenter}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />

      {verifiedActivities.map((activity) => (
        <Marker key={activity.id} position={[activity.latitude, activity.longitude]}>
          <Popup>{activity.title}</Popup>
        </Marker>
      ))}

      <FlyToActive position={activePosition} />
    </MapContainer>
  )
}