# 🌍 TravelMind AI

> Yapay Zeka Destekli Akıllı Seyahat Planlama Platformu

Software Developer stajı kapsamında geliştirilen, kullanıcıların birkaç bilgi girerek yapay zeka desteğiyle kişiselleştirilmiş, günlük bazda seyahat planı oluşturmasını sağlayan web uygulaması.

---

## 📖 Proje Nedir, Ne Yapar

Kullanıcı;

- Gideceği şehir/ülkeyi
- Seyahat başlangıç tarihini
- Gün sayısını
- Bütçesini
- Kişi sayısını
- İlgi alanlarını (tarih, doğa, yemek, sanat vb.)

girer, sistem bu bilgilerle **Google Gemini API**'yi kullanarak günlük, saatlik bazda bir gezi planı üretir. Üretilen plan:

- Her gün için zaman dilimli aktiviteler (gezi, yeme-içme, eğlence, ulaşım)
- Her aktivite için tahmini maliyet (kullanıcının seçtiği para birimi + hedef ülkenin resmi para birimiyle birlikte)
- Harita üzerinde günün aktivitelerinin konumu
- Seyahat tarihine göre hava durumu tahmini

içerir. Uygulama **bilinçli olarak konaklama/otel önerisi yapmaz** — kullanıcının kalacağı yeri kendisinin ayarlaması varsayılıyor, plan yalnızca günlük gezi programına odaklanıyor.

### Yapay zeka güvenilirliği

Dil modellerinin var olmayan mekan uydurma riskine (halüsinasyon) karşı, Gemini'nin önerdiği her mekan adı ayrıca **Nominatim (OpenStreetMap) API**'si ile doğrulanır. Doğrulanamayan öneriler kullanıcıya "AI önerisi, doğrulanamadı" etiketiyle şeffaf şekilde gösterilir, haritada gösterilmez.

---

## 🚦 Mevcut Durum

Proje, geliştirme hızına göre 25 günden **20 güne** revize edilmiş bir staj takvimine göre ilerliyor (5 gün teknoloji öğrenimi + 15 gün geliştirme). Detaylı takvim için: [docs/DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md)

**Tamamlanan fazlar:**
- ✅ Faz 1 — Kullanıcı sistemi (Supabase Auth: kayıt/giriş/çıkış, korumalı route'lar)
- ✅ Faz 2 — Seyahat formu (React Hook Form + Zod validasyonu)
- ✅ Faz 3 — Backend + Gemini entegrasyonu (yapılandırılmış JSON plan üretimi, JWT doğrulama, rate limiting, Nominatim yer doğrulama, Supabase cache mekanizması)
- ✅ Faz 4 — Sonuç ekranı (plan kartları, React Leaflet harita, Open-Meteo hava durumu, canlı kur çevirme, tasarım sistemi)

**Kalan fazlar:**
- Faz 5 — Favorileme (plan/mekan) ve PDF export (jsPDF)
- Faz 6 — Sorun giderme ve iyileştirme (bilinen teknik borçların temizlenmesi, responsive son kontroller)
- Faz 7 — Son gözden geçirme ve yayın hazırlığı (uçtan uca test, deploy, dokümantasyon teyidi)

---

## 🛠️ Teknoloji Yığını

### Frontend
- React (Vite), JavaScript (TypeScript kullanılmadı — bilinçli bir kapsam kararı, bkz. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md))
- Tailwind CSS v4 (custom tema: `@theme` bloğunda marka/nötr/durum renk tokenları, Manrope font)
- React Router, TanStack Query (server state), React Hook Form + Zod
- React Leaflet (harita), Axios

### Backend
- Node.js + Express — **yalnızca** Gemini API proxy'si, JWT doğrulama, rate limiting ve iş mantığı orkestrasyonu için kullanılıyor. Auth ve CRUD işlemleri doğrudan frontend'den Supabase client'ı ile yapılıyor (RLS güvenceli)

### Veri & Kimlik Doğrulama
- Supabase (PostgreSQL + Auth + Row Level Security)

### Dış Servisler
- **Google Gemini API** (`gemini-flash-lite-latest`) — plan üretimi
- **Nominatim (OpenStreetMap)** — yer doğrulama, sıralı istek (rate-limit uyumlu)
- **Open-Meteo** — hava durumu (key gerektirmez, ~16 gün ileriye kadar tahmin)
- **Frankfurter API** — canlı döviz kuru çevirme (key gerektirmez)

---

## 🏗️ Mimari Özet

```text
                    React (Vite)
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
     Supabase                     Express API
 (Auth + Database)             (JWT doğrulama +
         │                      rate limiting)
         │                               │
         │                               ▼
         │                        Gemini API
         │                               │
         │                               ▼
         │                    Nominatim (yer doğrulama)
         │
         ▼
  Open-Meteo / Frankfurter (frontend'den direkt, key gerektirmez)
```

Backend'in **tek amacı**, `GEMINI_API_KEY`'in frontend'de görünmemesini sağlamak ve isteği güvenli/kontrollü şekilde yönetmek. Neden bu ayrımın seçildiği ve hangi teknolojilerin bilinçli olarak dışarıda bırakıldığı için: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## 📂 Proje Yapısı

```text
TravelMind-AI/
├── frontend/
│   ├── src/
│   │   ├── components/    → Layout, ProtectedRoute, TripMap, DayWeather, Spinner...
│   │   ├── pages/          → SignIn, SignUp, CreateTrip, TripResult, NotFound
│   │   ├── hooks/          → useAuth (global auth state)
│   │   ├── services/       → authService, tripService, weatherService, currencyService
│   │   └── lib/             → supabaseClient, constants, uiClasses (tasarım sistemi)
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── routes/          → tripRoutes (generate-plan endpoint'i)
│   │   ├── middleware/     → authMiddleware (JWT), rateLimitMiddleware
│   │   └── services/        → geminiService, nominatimService, cacheService, supabaseClient
│   └── .env.example
└── docs/
    ├── DEVELOPMENT_PLAN.md  → 25 günlük detaylı takvim
    ├── DATABASE.md            → Supabase tablo şemaları (SQL dahil)
    ├── API.md                  → Backend endpoint dokümantasyonu
    ├── FEATURES.md             → Özellik kapsamı ve öncelik matrisi
    ├── AI_PROMPTS.md          → Gemini prompt şablonu ve tasarım kararları
    ├── ARCHITECTURE.md       → Mimari kararların gerekçeleri
    ├── ROADMAP.md              → v2/v3 planı
    └── CHANGELOG.md           → Sürüm geçmişi
```

---

## 🚀 Kurulum

```bash
git clone https://github.com/burakarikan17/travelmind-ai
cd travelmind-ai

cd frontend && npm install
cd ../backend && npm install
```

### Ortam değişkenleri

`.env.example` dosyalarını referans alarak her klasörde bir `.env` oluştur:

**frontend/.env**
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3000/api
```

**backend/.env**
```env
PORT=3000
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Gemini API key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey) üzerinden ücretsiz alınabilir.

### Veritabanı

Supabase projesi oluşturulduktan sonra, `docs/DATABASE.md` içindeki SQL bloklarını sırayla Supabase SQL Editor'de çalıştır (tablolar + RLS policy'leri + indeksler).

### Çalıştırma

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Frontend `http://localhost:5173`, backend `http://localhost:3000` üzerinde çalışır.

---

## 📚 Detaylı Dokümantasyon

Tüm mimari kararlar, veri şeması, API sözleşmesi ve prompt tasarımı `/docs` klasöründe detaylandırılmıştır — yukarıdaki "Proje Yapısı" tablosundaki linklere bakılabilir.

---

## 👨‍💻 Geliştirici

Burak Arıkan (Yazılım Mühendisliği 3.Sınıf Öğrencisi)