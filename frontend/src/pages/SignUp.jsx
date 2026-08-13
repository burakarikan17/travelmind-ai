import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../services/authService";
import Spinner from "../components/Spinner";
import {
  cardClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../lib/uiClasses";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-20">
      <div className="mb-6 text-center">
        <h1 className="text-h1 text-ink-900">Hesap oluştur</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Yapay zeka destekli seyahat planların birkaç saniye uzağında.
        </p>
      </div>

      <div className={`${cardClass} p-6 sm:p-8`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Ad Soyad
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              E-posta
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Şifre
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="En az 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass}
              aria-describedby="password-hint"
            />

            <div style={{ marginTop: "1rem" }}>
              <label className="mb-1 block text-sm font-medium text-ink-700">
                Şifre (Tekrar)
              </label>
              <input
                type="password"
                placeholder="Şifreni tekrar gir"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-btn border border-ink-200 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <p id="password-hint" className="mt-1.5 text-xs text-ink-400">
              En az 6 karakter olmalı.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-btn border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={primaryButtonClass}
          >
            {loading && <Spinner />}
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-ink-500">
        Zaten hesabın var mı?{" "}
        <Link
          to="/giris"
          className="rounded font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
        >
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
