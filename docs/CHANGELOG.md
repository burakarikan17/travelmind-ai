# 📝 CHANGELOG.md

## TravelMind AI — Sürüm Geçmişi

Bu proje [Keep a Changelog](https://keepachangelog.com/) formatını temel alır. Sürüm numaralandırması staj sürecine göre basitleştirilmiştir (gün bazlı milestone'lar).

---

## [Unreleased]

### Planlanan
- Bkz. [ROADMAP.md](./ROADMAP.md) — v2 ve sonrası özellikler

---

## [0.1.0] — Öğrenme Dönemi (Gün 1-5)

### Added
- JavaScript (ES6+) temellerinin pekiştirilmesi
- React temel kavramları ile mini to-do list uygulaması
- React Router, React Hook Form + Zod ile form denemesi
- Supabase Auth ile deneme kayıt/giriş akışı
- Tailwind, React Leaflet ve Gemini API ile uçtan uca mini prototip

---

## [0.2.0] — Temel Kurulum (Gün 6-8)

### Added
- Vite tabanlı frontend proje iskeleti
- Express tabanlı backend proje iskeleti
- Supabase projesi ve ilk tablo şemaları (`profiles`, `trips`)
- Kayıt / giriş / çıkış akışı
- Korumalı route yapısı (`ProtectedRoute`)
- Temel layout (navbar, sayfa iskeletleri, 404 sayfası)

---

## [0.3.0] — Seyahat Formu (Gün 9-10)

### Added
- Seyahat formu (şehir, tarih, gün sayısı, bütçe, ilgi alanları, kişi sayısı)
- Zod validasyon şeması
- Form gönderim servis fonksiyonu (Axios + TanStack Query mutation)

---

## [0.4.0] — Gemini Entegrasyonu (Gün 11-14)

### Added
- `POST /api/generate-plan` endpoint'i
- Supabase JWT doğrulama middleware'i
- Rate limiting (`express-rate-limit`)
- Gemini prompt şablonu ve JSON parse mantığı (bkz. [AI_PROMPTS.md](./AI_PROMPTS.md))
- Nominatim ile yer doğrulama akışı
- `ai_response_cache` tablosu ve cache mantığı

### Milestone
- 🎯 **MVP çekirdek akışı tamamlandı:** form → Gemini → yapılandırılmış plan çıktısı

---

## [0.5.0] — Sonuç Gösterimi (Gün 15-17)

### Added
- Günlük plan kartları (saat, aktivite, açıklama, tahmini maliyet)
- React Leaflet harita entegrasyonu (marker + polyline)
- Open-Meteo hava durumu entegrasyonu
- 16 gün üzeri tarihler için hava durumu bilgilendirme mesajı

---

## [0.6.0] — Favoriler ve PDF (Gün 18-19)

### Added
- Plan favorileme / favoriden çıkarma
- Bağımsız mekan favorileme
- `jsPDF` ile sade PDF export

---

## [0.7.0] — Responsive ve Cilalama (Gün 20-21)

### Added
- Mobil/tablet breakpoint düzenlemeleri
- Loading skeleton bileşenleri
- API hatası, boş sonuç, timeout için error state'leri

### Changed
- Navbar mobilde hamburger menüye dönüştürüldü

---

## [0.8.0] — Test (Gün 22-23)

### Added
- Kritik akışlar için manuel test senaryoları
- (Varsa) Vitest ile form validasyon testleri

### Fixed
- Test sırasında tespit edilen hatalar burada listelenecek

---

## [1.0.0] — Yayın (Gün 24-25)

### Added
- Production deploy: Frontend → Vercel, Backend → Render
- `.env.example` dosyaları
- Demo video/GIF ve final README güncellemesi

### Milestone
- 🚀 **Staj projesi teslim edildi**

---

## Sürüm Notları Hakkında

Her milestone tamamlandığında bu dosya güncellenmeli, gerçekleşen değişiklikler `Added` / `Changed` / `Fixed` / `Removed` başlıkları altında kaydedilmelidir. Planlanandan sapmalar (örn. bir özelliğin ertelenmesi) da not düşülmelidir — bu, staj sunumunda süreç şeffaflığı göstermek açısından faydalıdır.