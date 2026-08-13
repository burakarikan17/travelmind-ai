import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import CreateTrip from "./pages/CreateTrip";
import TripResult from "./pages/TripResult";
import Favorites from "./pages/Favorites";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/kayit" element={<SignUp />} />
            <Route path="/giris" element={<SignIn />} />
            <Route path="/sifremi-unuttum" element={<ForgotPassword />} />
            <Route path="/sifre-yenile" element={<ResetPassword />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <CreateTrip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planlar/:tripId"
              element={
                <ProtectedRoute>
                  <TripResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favoriler"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

