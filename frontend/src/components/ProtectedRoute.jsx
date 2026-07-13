import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-500">
        Yükleniyor...
      </div>
    );
  }
  if (!user) return <Navigate to="/giris" replace />;

  return children;
}
