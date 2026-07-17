# 📅 DEVELOPMENT_PLAN.md

## TravelMind AI — 20 Günlük Geliştirme Planı (Güncellenmiş)

Bu doküman, ilk hazırlanan 25 günlük plandan sonra, gerçek geliştirme hızına göre **20 güne** revize edilmiştir. Öğrenme dönemi ve ilk fazlar planlanandan verimli ilerlediği için toplam süre kısaltılmış, buna karşılık son aşamaya **iki yeni faz** (sorun giderme + son gözden geçirme) eklenerek planın gerçekçiliği artırılmıştır.

**Mevcut seviye:** Python/C#/Java/PHP/SQL orta, HTML/CSS iyi, JavaScript ve React başlangıç seviyesi (proje süresince gelişti).

**Toplam süre:** 20 gün (5 gün öğrenme + 15 gün geliştirme)

---

## 🧭 Genel Strateji

- İlk 5 gün, projede kullanılacak teknolojilere odaklanan öğrenme kampı.
- Kalan 15 gün, MVP'yi erken bitirip kalan zamanı **kalite ve sağlamlaştırmaya** ayıran bir geliştirme süreci.
- Kapsam bilinçli olarak sadeleştirilmiştir: TypeScript, Zustand, gerçek yol routing'i gibi ek öğrenme yükü getiren teknolojiler MVP dışında tutulmuştur (bkz. [ROADMAP.md](./ROADMAP.md)).
- **Yeni eklenen fazlar (6 ve 7):** Geliştirme sürecinde biriken küçük hatalar (encoding sorunları, deprecated model isimleri, eksik RLS policy'leri, z-index çakışmaları vb.) tek tek anlık çözülse de, projenin bütünsel kalitesi için ayrı bir "sorun giderme" ve "son gözden geçirme" fazına ihtiyaç duyulduğu görüldü. Bu revizyon, bunu plana resmen yansıtıyor.

---

## 📘 Faz 0 — Öğrenme Dönemi (Gün 1-5)

### Gün 1 — Modern JavaScript
- `let/const`, arrow function, template literal, destructuring, spread/rest
- Array metodları: `map`, `filter`, `find`, `reduce`
- `async/await`, `fetch`, Promise mantığı, modül sistemi

### Gün 2 — React Temelleri
- Component mantığı, JSX, props, `useState`, `useEffect`

### Gün 3 — Routing, Form, HTTP
- React Router, React Hook Form + Zod, Axios, TanStack Query temelleri

### Gün 4 — Supabase
- Proje kurulumu, Auth entegrasyonu, CRUD, RLS kavramı

### Gün 5 — Tailwind + Leaflet + Gemini
- Tailwind pratiği, React Leaflet ile harita, Gemini API'ye basit istek, Express proxy denemesi

**Çıktı:** Uçtan uca çalışan küçük bir mini prototip.

---

## 🏗️ Faz 1 — Temel Kurulum (Gün 6-8)

- Vite proje iskeleti, klasör yapısı
- Supabase projesi, tablo şemaları (`profiles`, `trips`)
- Supabase Auth entegrasyonu: kayıt, giriş, çıkış, korumalı route'lar
- Temel layout: navbar, sayfa iskeletleri

**Kontrol noktası:** Kullanıcı kayıt olabiliyor, giriş yapabiliyor, korumalı sayfaya erişebiliyor. ✅ Tamamlandı.

---

## 📝 Faz 2 — Seyahat Formu (Gün 9-10)

- React Hook Form + Zod ile form: şehir, tarih, gün sayısı, bütçe, ilgi alanları, kişi sayısı
- Form validasyonu ve UX

**Kontrol noktası:** Form dolduruluyor, validasyon çalışıyor. ✅ Tamamlandı.

---

## 🤖 Faz 3 — Backend + Gemini Entegrasyonu (Gün 11-13)

> Projenin en kritik fazı, planlanandan bir gün kısa sürede tamamlandı.

- Express server, `POST /api/generate-plan` endpoint'i
- Supabase JWT doğrulama middleware'i, rate limiting
- Gemini prompt tasarımı, yapılandırılmış JSON çıktı (bkz. [AI_PROMPTS.md](./AI_PROMPTS.md))
- Nominatim ile yer doğrulama (placeName alanı ile temiz sorgu)
- Supabase cache mekanizması (`ai_response_cache`)
- Gemini 503/429 hataları için otomatik retry mekanizması

**Kontrol noktası (MVP hedefi):** Form → Gemini → yapılandırılmış plan çıktısı uçtan uca çalışıyor. ✅ Tamamlandı.

---

## 🗺️ Faz 4 — Sonuç Gösterimi (Gün 14-15)

- Günlük plan kartları, React Leaflet harita (marker + polyline)
- Open-Meteo hava durumu entegrasyonu (16 gün sınırı bilgilendirmesi ile)
- Frankfurter API ile canlı döviz kuru çevirme (hedef ülke para birimi gösterimi)
- Frontend tasarım sistemi: Tailwind v4 custom tema, tutarlı bileşen kütüphanesi

**Kontrol noktası:** Plan; kart listesi, harita, hava durumu ve kur bilgisiyle birlikte görüntüleniyor. ✅ Tamamlandı.

---

## ❤️ Faz 5 — Favoriler + PDF (Gün 16)

- Favorilere ekleme/çıkarma (`favorite_trips` tablosu + toggle buton)
- PDF export: `jsPDF` ile sade, tek sayfalık plan çıktısı

**Not:** Zaman darsa bu faz kısaltılabilir; temel akış (Faz 1-4) her zaman önceliklidir.


---

## 🔧 Faz 6 — Sorun Giderme ve İyileştirme (Gün 17-18)

> **Yeni eklenen faz.** Geliştirme sürecinde biriken, "sonra bakarım" denilip ertelenmiş küçük sorunların toplu olarak ele alındığı, projenin sağlamlığını artıran bir faz.

- Bilinen teknik borçların gözden geçirilmesi:
  - Rate limit middleware'indeki IPv6 uyarısının kökten çözülmesi
  - Gemini model adı gibi dış servis bağımlılıklarının güncel kalması için not düşülmesi
  - Nominatim doğrulama oranının örnek şehirlerle tekrar test edilmesi
- Responsive tasarım kontrolleri: mobil/tablet breakpoint'lerinde form, kartlar, navbar
- Loading skeleton'ları ve error state'lerinin (API hatası, boş sonuç, timeout) gözden geçirilmesi
- Kod tekrarlarının (örn. `withConverted` gibi tekrar eden mantıklar) küçük refactor'larla sadeleştirilmesi
- Konsol/tarayıcıda kalan geçici debug loglarının (`console.log`) temizlenmesi

**Kontrol noktası:** Bilinen açık hata/uyarı kalmıyor, uygulama farklı ekran boyutlarında tutarlı görünüyor.

---

## ✅ Faz 7 — Son Gözden Geçirme ve Yayın Hazırlığı (Gün 19-20)

> **Yeni eklenen faz.** Projenin teslim/sunum öncesi son kontrol ve yayına alma aşaması.

- Kritik akışların uçtan uca manuel testi: kayıt → giriş → plan oluştur → favorile → PDF indir
- `.env.example` dosyalarının güncel ve doğru olduğunun teyidi
- README ve `/docs` dokümantasyonunun projenin son haliyle tutarlı olduğunun kontrolü
- Git geçmişinin gözden geçirilmesi (gizli anahtarların hiç commit'lenmediğinin doğrulanması)
- Frontend → Vercel, Backend → Render deploy'u
- Production ortam değişkenlerinin doğru ayarlanması
- Kısa bir demo video/GIF hazırlığı (staj sunumu için)

**Kontrol noktası:** Proje canlıda çalışıyor, dokümantasyon güncel, sunum materyali hazır.

---

## ⏱️ Özet Takvim

| Gün | Faz | Odak | Durum |
|---|---|---|---|
| 1-5 | Faz 0 | Öğrenme (JS, React, Supabase, Tailwind, Leaflet, Gemini) | ✅ |
| 6-8 | Faz 1 | Kurulum + Auth | ✅ |
| 9-10 | Faz 2 | Seyahat formu | ✅ |
| 11-13 | Faz 3 | Backend + Gemini entegrasyonu | ✅ |
| 14-15 | Faz 4 | Harita + hava durumu + sonuç gösterimi + tasarım sistemi | ✅ |
| 16 | Faz 5 | Favoriler + PDF | 🔄 |
| 17-18 | Faz 6 | Sorun giderme ve iyileştirme | ⏳ |
| 19-20 | Faz 7 | Son gözden geçirme ve yayın hazırlığı | ⏳ |

---

## ⚠️ Risk Yönetimi

| Risk | Önlem |
|---|---|
| Gemini'nin yanlış/uydurma bilgi üretmesi | Nominatim ile yer doğrulama, "doğrulanamadı" etiketi |
| Gemini API maliyetinin artması | Rate limiting + Supabase cache |
| Dış servislerin (Gemini model adları vb.) sık değişmesi | Faz 6'da bağımlılıkların gözden geçirilmesi, dokümante edilmesi |
| Kalan 4 günün yetmemesi | Faz 5 (favoriler/PDF) esnek tutuldu; Faz 6-7 zaman darlığında birleştirilebilir, ama Faz 7'nin (deploy + dokümantasyon) asla tamamen atlanmaması hedeflenir |
| Open-Meteo'nun uzak tarihli seyahatlerde veri dönmemesi | Kullanıcıya net bir bilgi mesajı gösterilir, uygulama kırılmaz |