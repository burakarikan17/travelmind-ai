# 🔌 API.md

## TravelMind AI — Backend API Dokümantasyonu

Backend (Express.js), yalnızca aşağıdaki amaçlar için kullanılır:
- Gemini API'ye güvenli proxy (API key'in frontend'de expose olmaması için)
- Supabase JWT doğrulama
- Rate limiting
- Yer doğrulama (Nominatim) ve önbellekleme orkestrasyonu

Tüm diğer işlemler (auth, CRUD, favoriler) doğrudan frontend'den Supabase client'ı ile yapılır — bunlar için backend endpoint'i **yoktur**.

**Base URL (development):** `http://localhost:3000/api`
**Base URL (production):** `https://<render-app-adı>.onrender.com/api`

---

## 🔐 Kimlik Doğrulama

Tüm endpoint'ler `Authorization` header'ında geçerli bir Supabase JWT bekler:

```
Authorization: Bearer <supabase_access_token>
```

Middleware bu token'ı Supabase'in `auth.getUser()` metoduyla doğrular. Geçersiz/eksik token → `401 Unauthorized`.

---

## Endpoint'ler

### 1. `POST /api/generate-plan`

Kullanıcının seyahat formundan gelen verilerle Gemini API'den seyahat planı üretir.

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "destination": "Roma, İtalya",
  "startDate": "2026-08-10",
  "durationDays": 4,
  "budget": 20000,
  "currency": "TRY",
  "peopleCount": 2,
  "interests": ["tarih", "yemek", "sanat"]
}
```

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `destination` | string | ✅ | Şehir/ülke adı |
| `startDate` | string (ISO date) | ✅ | Seyahat başlangıç tarihi |
| `durationDays` | number | ✅ | 1-30 arası |
| `budget` | number | ✅ | Pozitif sayı |
| `currency` | string | ❌ | Varsayılan `"TRY"` |
| `peopleCount` | number | ✅ | Pozitif sayı |
| `interests` | string[] | ✅ | En az 1 ilgi alanı |

**Success Response — `200 OK`**
```json
{
  "tripId": "b3f1c2...",
  "cached": false,
  "days": [
    {
      "dayNumber": 1,
      "date": "2026-08-10",
      "summary": "Tarihi merkez ve antik kalıntılar",
      "activities": [
        {
          "timeSlot": "09:00 - 11:00",
          "title": "Colosseum",
          "description": "Antik Roma'nın simge yapısı",
          "category": "gezi",
          "estimatedCost": 800,
          "isPlaceVerified": true,
          "latitude": 41.8902,
          "longitude": 12.4922
        }
      ]
    }
  ]
}
```

**Error Responses**

| Kod | Durum | Açıklama |
|---|---|---|
| `400` | Bad Request | Eksik/geçersiz form alanı |
| `401` | Unauthorized | Token yok/geçersiz |
| `429` | Too Many Requests | Rate limit aşıldı |
| `502` | Bad Gateway | Gemini API hatası/timeout |
| `500` | Internal Server Error | Beklenmeyen sunucu hatası |

```json
// 429 örneği
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Saatlik istek limitine ulaştınız. Lütfen daha sonra tekrar deneyin.",
  "retryAfterSeconds": 1800
}
```

**İç akış**
1. JWT doğrulanır.
2. `cache_key` oluşturulur (`destination+startDate+durationDays+budget+interests` hash'i).
3. `ai_response_cache` tablosunda eşleşme aranır → varsa direkt döner (`cached: true`).
4. Yoksa Gemini API'ye [AI_PROMPTS.md](./AI_PROMPTS.md) şablonuyla istek atılır.
5. Dönen JSON parse edilir; her aktivitenin `title` alanı Nominatim ile doğrulanır, `isPlaceVerified` set edilir.
6. Sonuç `trips` / `trip_days` / `trip_activities` tablolarına yazılır ve cache'e kaydedilir.
7. Yanıt frontend'e döner.

---

### 2. `GET /api/health`

Servisin ayakta olup olmadığını kontrol etmek için basit health-check endpoint'i. Auth gerektirmez.

**Response — `200 OK`**
```json
{ "status": "ok", "timestamp": "2026-07-08T10:00:00Z" }
```

---

## ⏱️ Rate Limiting

`express-rate-limit` ile yapılandırılır:

| Endpoint | Limit |
|---|---|
| `POST /api/generate-plan` | Kullanıcı başına saatte 10 istek |
| Genel (IP bazlı, ek koruma) | 100 istek / 15 dakika |

---

## 🛡️ Güvenlik Notları

- `SUPABASE_SERVICE_ROLE_KEY` yalnızca backend `.env` dosyasında tutulur, asla frontend'e veya repoya gönderilmez.
- `GEMINI_API_KEY` yalnızca backend'de kullanılır; frontend hiçbir zaman Gemini'ye doğrudan istek atmaz.
- Tüm gelen body'ler backend tarafında da (Zod ile) tekrar doğrulanır — frontend validasyonuna güvenilmez.
- CORS yalnızca frontend'in production/development origin'lerine izin verecek şekilde kısıtlanır.
- `helmet` middleware'i temel HTTP header güvenliği için kullanılır.

---

## 🧩 Kullanılmayan / Backend'e Taşınmayan İşlemler

Aşağıdaki işlemler backend endpoint'i olmadan doğrudan Supabase client (frontend) üzerinden yapılır:

- Kayıt / giriş / çıkış (`supabase.auth.*`)
- Trip listeleme, silme (`supabase.from('trips')...`)
- Favori ekleme/çıkarma (`supabase.from('favorite_trips')...`, `favorite_places`)
- Profil güncelleme

Bu, backend'i sade tutmak ve gereksiz proxy katmanından kaçınmak için bilinçli bir tercihtir (bkz. [ARCHITECTURE.md](./ARCHITECTURE.md)).