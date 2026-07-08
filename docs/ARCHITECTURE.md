# 🏗️ ARCHITECTURE.md

## TravelMind AI — Sistem Mimarisi

---

## 1. Genel Bakış

TravelMind AI, üç ana katmandan oluşur:

1. **Frontend (React/Vite)** — kullanıcı arayüzü, Supabase ile doğrudan iletişim
2. **Backend (Express)** — yalnızca Gemini API proxy'si ve güvenlik katmanı
3. **Supabase** — kimlik doğrulama ve veritabanı

Bu ayrım bilinçlidir: **auth ve CRUD işlemleri backend'den geçirilmez**, doğrudan Supabase client'ı ile frontend'den yapılır. Backend sadece Gemini API key'inin gizli kalması gereken tek noktadır.

---

## 2. Mimari Diyagram

```text
                        ┌──────────────────┐
                        │   Kullanıcı       │
                        │  (Tarayıcı)       │
                        └────────┬──────────┘
                                 │
                                 ▼
                   ┌─────────────────────────┐
                   │   Frontend (React/Vite)  │
                   │   - Vercel'de host edilir │
                   └───────────┬─────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
      ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
      │   Supabase     │ │  Express API   │ │  Open-Meteo    │
      │ (Auth + DB)    │ │  (Render)      │ │  (public API)  │
      │                │ │                │ │                │
      │ - auth.users   │ │ - JWT doğrulama│ └───────────────┘
      │ - profiles     │ │ - rate limit   │
      │ - trips        │ │ - Gemini proxy │
      │ - favorites    │ │                │
      │ - ai_cache     │ └───────┬────────┘
      └───────────────┘         │
                                 │
                    ┌────────────┴────────────┐
                    │                          │
                    ▼                          ▼
            ┌───────────────┐         ┌───────────────┐
            │  Gemini API    │         │  Nominatim     │
            │ (Google)       │         │ (OSM Geocoding)│
            └───────────────┘         └───────────────┘
```

---

## 3. Katman Sorumlulukları

### 3.1 Frontend
- Kullanıcı arayüzü ve tüm UI state yönetimi
- Supabase Auth ile kayıt/giriş/çıkış
- Supabase client ile doğrudan CRUD (trips, favorites, profiles)
- `/api/generate-plan` endpoint'ine (Express) yalnızca plan üretimi için istek atar
- Open-Meteo'ya doğrudan istek atar (backend'e gerek yok, public API, key gerektirmiyor)
- React Leaflet ile harita render'ı

**Neden Supabase işlemleri doğrudan frontend'den yapılıyor?**
Supabase'in RLS (Row Level Security) politikaları, veritabanı seviyesinde güvenliği zaten sağlıyor. Her istek için ayrı bir Express endpoint'i yazmak gereksiz bir aracı katman eklemek, geliştirme süresini uzatmak ve staj süresi kısıtı göz önüne alındığında karmaşıklığı artırmak anlamına gelirdi.

### 3.2 Backend (Express)
Backend'in **tek amacı**, gizli kalması gereken `GEMINI_API_KEY`'i frontend'den korumaktır. Ayrıca:
- Gelen isteğin Supabase JWT'sini doğrular (`supabase.auth.getUser()`)
- Rate limiting uygular
- Gemini'ye istek atar, cevabı parse eder
- Nominatim ile yer doğrulama akışını yönetir
- Sonucu Supabase'e yazar (service role key ile) ve frontend'e döner

Backend **stateless** tutulur — kendi başına iş mantığı veritabanı dışında bir yerde saklanmaz.

### 3.3 Supabase
- **Auth:** e-posta/şifre tabanlı kimlik doğrulama, JWT üretimi
- **Database (PostgreSQL):** tüm kalıcı veri (bkz. [DATABASE.md](./DATABASE.md))
- **RLS:** her tabloda kullanıcının yalnızca kendi verisine erişebilmesini garanti eder

---

## 4. Veri Akışı — "Plan Oluştur" Senaryosu

```text
1. Kullanıcı formu doldurur (frontend)
2. Frontend, Supabase access_token'ı ile
   POST /api/generate-plan isteği atar (Express)
3. Express middleware JWT'yi doğrular
4. Express rate limit kontrolü yapar
5. Express, cache_key oluşturup ai_response_cache tablosunda arar (Supabase)
   ├── Bulunursa → adım 8'e atla
   └── Bulunmazsa → adım 6'ya devam
6. Express, Gemini API'ye prompt gönderir (bkz. AI_PROMPTS.md)
7. Gemini'nin cevabı parse edilir, her mekan Nominatim ile doğrulanır
8. Sonuç trips/trip_days/trip_activities tablolarına yazılır,
   cache güncellenir
9. Express, yapılandırılmış JSON'u frontend'e döner
10. Frontend sonucu kart listesi + harita + hava durumu ile gösterir
    (hava durumu için Open-Meteo'ya ayrıca, doğrudan frontend'den istek atılır)
```

---

## 5. Neden Bu Teknolojiler?

| Karar | Gerekçe |
|---|---|
| TypeScript **yok** | JS'i yeni öğrenen bir geliştirici için ek soyutlama yükü; MVP sonrası eklenebilir |
| Zustand **yok**, sadece TanStack Query | Sunucu state'i (server state) zaten Query ile yönetiliyor; ayrı bir client state kütüphanesi MVP için gereksiz karmaşıklık |
| Framer Motion **yok** | Görsel bonus, öğrenme yükü/fayda oranı düşük; CSS transition yeterli |
| Gerçek yol routing (OSRM) **yok** | Ayrı bir öğrenme eğrisi ve ek servis bağımlılığı; polyline (düz çizgi) MVP için yeterli görsel bilgi veriyor |
| Custom auth **yok**, Supabase Auth kullanılıyor | Auth'u sıfırdan yazmak güvenlik riski + zaman kaybı; Supabase hazır ve güvenli bir çözüm sunuyor |
| Backend sadece Gemini proxy'si | API key güvenliği dışında bir aracı katmana gerek yok; Supabase RLS zaten CRUD güvenliğini sağlıyor |

---

## 6. Ölçeklenebilirlik Notları (v1 kapsamı dışında ama bilinmesi gerekenler)

- `ai_response_cache` tablosu büyüdükçe `expires_at` bazlı bir temizlik job'ı (Supabase cron / pg_cron) eklenebilir.
- Nominatim'in rate limit'i (saniyede 1 istek) çok günlü planlarda darboğaz oluşturabilir; ileride kendi self-hosted Nominatim instance'ı veya ücretli bir geocoding servisi değerlendirilebilir.
- Backend şu an tek instance olarak Render'da çalışır; trafik artarsa yatay ölçekleme (horizontal scaling) ve Redis tabanlı rate limiting düşünülebilir.

Gelecek özellikler ve mimari genişlemeler için bkz. [ROADMAP.md](./ROADMAP.md).