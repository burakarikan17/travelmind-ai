import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import {
  addFavoriteTrip,
  removeFavoriteTrip,
  isTripFavorited,
} from "../services/favoriteService";

export default function FavoriteButton({ tripId }) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    isTripFavorited(user.id, tripId).then((result) => {
      if (isMounted) {
        setIsFavorited(result);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user.id, tripId]);

  async function handleToggle() {
    setLoading(true);
    try {
      if (isFavorited) {
        await removeFavoriteTrip(user.id, tripId);
        setIsFavorited(false);
        toast.info("Plan favorilerden çıkarıldı.");
      } else {
        await addFavoriteTrip(user.id, tripId);
        setIsFavorited(true);
        toast.success("Plan favorilere eklendi! ❤️");
      }
    } catch (err) {
      console.error("Favori işlemi başarısız:", err.message);
      toast.error("İşlem gerçekleştirilemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-btn font-medium border transition-all shadow-card cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isFavorited
          ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
          : "bg-white text-ink-700 border-ink-200 hover:border-rose-300 hover:text-rose-600"
      }`}
    >
      <Heart
        className={`h-4 w-4 transition-transform ${
          isFavorited ? "fill-rose-600 text-rose-600 scale-110" : ""
        }`}
      />
      <span>{isFavorited ? "Favorilerde" : "Favorile"}</span>
    </button>
  );
}

