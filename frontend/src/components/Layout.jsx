import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "../services/authService";

const navLinkClass = ({ isActive }) =>
  [
    "relative rounded-btn px-3 py-1.5 text-sm font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
    isActive
      ? "text-brand-700 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-600"
      : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
  ].join(" ");

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/giris");
    } catch (err) {
      console.error("Çıkış yapılırken hata oluştu:", err.message);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="sticky top-0 z-40 border-b border-ink-200/80 bg-white/80 shadow-nav backdrop-blur-md relative z-[9999]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-btn text-h2 font-bold tracking-tight text-ink-900 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-btn bg-gradient-to-br from-brand-500 to-brand-700 text-sm text-white shadow-card"
            >
              ✈
            </span>
            TravelMind <span className="text-brand-700">AI</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <NavLink to="/" className={navLinkClass} end>
                  Yeni Plan
                </NavLink>
                <Link
                  to="/favoriler"
                  className="text-sm text-gray-600 hover:text-brand-700"
                >
                  Favorilerim
                </Link>
                <span className="hidden max-w-[16ch] truncate text-sm text-ink-500 md:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded-btn border border-ink-200 bg-white px-3 py-1.5 text-sm font-semibold text-ink-700 shadow-card transition-all hover:border-danger-200 hover:bg-danger-50 hover:text-danger-700 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-200 focus-visible:ring-offset-2"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <NavLink to="/giris" className={navLinkClass}>
                  Giriş Yap
                </NavLink>
                <NavLink
                  to="/kayit"
                  className={({ isActive }) =>
                    [
                      "rounded-btn px-3 py-1.5 text-sm font-semibold text-white shadow-card transition-all",
                      "hover:bg-brand-800 active:translate-y-px",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
                      isActive ? "bg-brand-800" : "bg-brand-700",
                    ].join(" ")
                  }
                >
                  Kayıt Ol
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
