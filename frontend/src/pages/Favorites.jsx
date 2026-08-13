import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2, Search, ArrowRight, PlusCircle, MapPin, Calendar, Wallet, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import {
  getFavoriteTrips,
  removeFavoriteTrip,
} from "../services/favoriteService";
import Spinner from "../components/Spinner";

export default function Favorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["favorites", user.id],
    queryFn: () => getFavoriteTrips(user.id),
  });

  const removeMutation = useMutation({
    mutationFn: (tripId) => removeFavoriteTrip(user.id, tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
      toast.info("Plan favorilerden çıkarıldı.");
    },
    onError: () => {
      toast.error("Favorilerden çıkarılamadı.");
    },
  });

  function handleRemove(e, tripId) {
    e.preventDefault();
    e.stopPropagation();
    removeMutation.mutate(tripId);
  }

  const filteredTrips = data.filter((fav) =>
    fav.trips?.destination?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">Favoriler yüklenemedi.</div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="mx-auto mt-16 max-w-md px-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-500 shadow-card">
          <Heart className="h-8 w-8 fill-rose-500" />
        </div>
        <h2 className="mt-4 text-h2 font-semibold text-ink-900">
          Henüz favori planın yok
        </h2>
        <p className="mt-2 text-sm text-ink-500">
          Beğendiğin planları favorilere ekleyerek buradan hızlıca ulaşabilirsin.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-btn bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-800 active:translate-y-px"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni Plan Oluştur
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl px-4 pb-16 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
            Favori Planlarım
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Toplam {data.length} kayıtlı seyahat planın var
          </p>
        </div>

        {/* Arama Kutusu */}
        {data.length > 1 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Şehir ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-btn border border-ink-200 bg-white py-1.5 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 sm:w-48"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {filteredTrips.length === 0 ? (
          <div className="py-8 text-center text-sm text-ink-500">
            Arama kriterine uygun favori bulunamadı.
          </div>
        ) : (
          filteredTrips.map((fav) => (
            <Link
              key={fav.id}
              to={`/planlar/${fav.trips.id}`}
              className="group flex items-center justify-between rounded-card border border-ink-200 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
                  <p className="font-semibold text-ink-900 group-hover:text-brand-700 truncate">
                    {fav.trips.destination}
                  </p>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-ink-400" />
                    {fav.trips.duration_days} gün
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-ink-400" />
                    {fav.trips.people_count} kişi
                  </span>
                  <span className="flex items-center gap-1 font-medium text-brand-700">
                    <Wallet className="h-3.5 w-3.5 text-brand-600" />
                    {fav.trips.budget} {fav.trips.currency}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 ml-4">
                <span className="hidden sm:inline-flex items-center text-xs font-medium text-brand-700 group-hover:translate-x-0.5 transition-transform">
                  Görüntüle <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </span>
                <button
                  onClick={(e) => handleRemove(e, fav.trips.id)}
                  disabled={removeMutation.isPending}
                  className="rounded-btn border border-ink-200 bg-white p-2 text-ink-400 transition-colors hover:border-danger-200 hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50 cursor-pointer"
                  title="Favorilerden çıkar"
                  aria-label="Favorilerden çıkar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

