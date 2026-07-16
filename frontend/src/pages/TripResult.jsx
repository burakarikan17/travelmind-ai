import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTripById } from "../services/tripService";
import TripMap from "../components/TripMap";
import DayWeather from "../components/DayWeather";

export default function TripResult() {
  const { tripId } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTripById(tripId),
  });

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">Plan yükleniyor...</div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Plan yüklenemedi: {error.message}
      </div>
    );
  }

  const { trip, days } = data;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-1">{trip.destination}</h1>
      <p className="text-gray-500 mb-6">
        {trip.duration_days} gün · {trip.people_count} kişi · {trip.budget}{" "}
        {trip.currency}
      </p>

      <div className="flex flex-col gap-6">
        {days.map((day) => (
          <div key={day.id} className="border rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-1">
              {day.day_number}. Gün — {day.date}
            </h2>
            {day.summary && (
              <p className="text-gray-600 text-sm mb-3">{day.summary}</p>
            )}
            {(() => {
              const firstVerified = day.trip_activities.find(
                (a) => a.latitude != null && a.longitude != null,
              );
              return (
                <div className="mb-3">
                  <DayWeather
                    latitude={firstVerified?.latitude}
                    longitude={firstVerified?.longitude}
                    date={day.date}
                  />
                </div>
              );
            })()}
            <div className="mb-4 rounded overflow-hidden">
              <TripMap activities={day.trip_activities} />
            </div>
            <div className="flex flex-col gap-3">
              {day.trip_activities.map((activity) => (
                <div key={activity.id} className="bg-gray-50 rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{activity.title}</span>
                    <span className="text-xs text-gray-500">
                      {activity.time_slot}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {activity.estimated_cost != null && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        ~{activity.estimated_cost} {trip.currency}
                      </span>
                    )}
                    {!activity.is_place_verified && (
                      <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">
                        AI önerisi, doğrulanamadı
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
