import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import NotFound from './pages/NotFound'

function Home() {
  return <div className="p-6">Ana Sayfa (giriş yapıldı)</div>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/kayit" element={<SignUp />} />
            <Route path="/giris" element={<SignIn />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}