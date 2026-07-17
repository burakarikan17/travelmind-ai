import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "./Spinner";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2.5 py-32 text-sm font-medium text-ink-500">
        <Spinner className="h-4 w-4 text-brand-700" />
        Yükleniyor...
      </div>
    );
  }
  if (!user) return <Navigate to="/giris" replace />;

  return children;
}
