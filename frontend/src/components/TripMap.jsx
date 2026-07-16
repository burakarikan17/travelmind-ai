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
    <MapContainer center={center} zoom={13} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap katkıda bulunanlar'
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