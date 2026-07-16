import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'

export default function TripMap({ activities }) {
  // Sadece koordinatı olan (Nominatim ile doğrulanmış) aktiviteleri filtrele
  const verifiedActivities = activities.filter(
    (a) => a.latitude != null && a.longitude != null
  )

  if (verifiedActivities.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded">
        Bu gün için haritada gösterilecek doğrulanmış konum bulunamadı.
      </div>
    )
  }

  // Haritanın nereye ortalanacağını ilk aktivitenin konumuna göre belirle
  const center = [verifiedActivities[0].latitude, verifiedActivities[0].longitude]

  // Polyline için sıralı koordinat listesi
  const routePoints = verifiedActivities.map((a) => [a.latitude, a.longitude])

  return (
   <MapContainer
  center={center}
  zoom={13}
  scrollWheelZoom={false}
  style={{ height: '320px', width: '100%', borderRadius: '8px' }}
>
      <TileLayer
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıda bulunanlar &copy; <a href="https://carto.com/attributions">CARTO</a>'
/>

      {verifiedActivities.map((activity) => (
        <Marker key={activity.id} position={[activity.latitude, activity.longitude]}>
          <Popup>
            <strong>{activity.title}</strong>
            <br />
            {activity.time_slot}
          </Popup>
        </Marker>
      ))}

      <Polyline positions={routePoints} color="#2563eb" />
    </MapContainer>
  )
}   