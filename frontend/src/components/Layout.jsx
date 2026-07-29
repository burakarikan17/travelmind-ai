import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/giris");
    } catch (err) {
      console.error("Çıkış yapılırken hata oluştu:", err.message);
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="sticky top-0 z-[9999] border-b border-ink-200/80 bg-white/80 shadow-nav backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 rounded-btn text-base sm:text-h2 font-bold tracking-tight text-ink-900 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-btn bg-gradient-to-br from-brand-500 to-brand-700 text-sm text-white shadow-card"
            >
              ✈
            </span>
            TravelMind <span className="text-brand-700">AI</span>
          </Link>

          {/* --- Masaüstü menü (sm ve üzeri) --- */}
          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                <NavLink to="/" className={navLinkClass} end>
                  Yeni Plan
                </NavLink>
                <NavLink to="/favoriler" className={navLinkClass}>
                  Favorilerim
                </NavLink>
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

          {/* --- Hamburger butonu (sadece mobil) --- */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Menüyü aç/kapat"
            className="grid h-9 w-9 place-items-center rounded-btn border border-ink-200 bg-white text-ink-700 shadow-card sm:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* --- Mobil açılır menü --- */}
        {menuOpen && (
          <div className="border-t border-ink-200 bg-white px-4 py-3 sm:hidden">
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <NavLink to="/" onClick={closeMenu} className={navLinkClass} end>
                    Yeni Plan
                  </NavLink>
                  <NavLink to="/favoriler" onClick={closeMenu} className={navLinkClass}>
                    Favorilerim
                  </NavLink>
                  <span className="truncate px-3 text-xs text-ink-400">
                    {user.email}
                  </span>
                  <button
                    onClick={() => {
                      closeMenu();
                      handleSignOut();
                    }}
                    className="mt-1 rounded-btn border border-ink-200 bg-white px-3 py-2 text-left text-sm font-semibold text-ink-700 shadow-card transition-all hover:border-danger-200 hover:bg-danger-50 hover:text-danger-700"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/giris" onClick={closeMenu} className={navLinkClass}>
                    Giriş Yap
                  </NavLink>
                  <NavLink
                    to="/kayit"
                    onClick={closeMenu}
                    className="rounded-btn bg-brand-700 px-3 py-2 text-center text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-800"
                  >
                    Kayıt Ol
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}