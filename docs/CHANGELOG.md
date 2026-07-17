# 📝 CHANGELOG.md

## TravelMind AI — Sürüm Geçmişi

Bu proje [Keep a Changelog](https://keepachangelog.com/) formatını temel alır. Sürüm numaralandırması staj sürecine göre basitleştirilmiştir (gün bazlı milestone'lar). Plan başlangıçta 25 gün olarak tasarlanmış, gerçek geliştirme hızına göre **20 güne** revize edilmiş ve iki yeni faz (sorun giderme + son gözden geçirme) eklenmiştir — detay için [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md).

---

## [Unreleased]

### Planlanan
- Bkz. [ROADMAP.md](./ROADMAP.md) — v2 ve sonrası özellikler
- Seyahat planı oluşturulduktan sonra planı "simüle eden" bir deneyim özelliği değerlendiriliyor (kapsam netleşince ROADMAP'e eklenecek)

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

### Fixed
- `supabaseClient.js` dosyasında encoding hatası (binary dosya olarak algılanma sorunu)
- `.env` dosyasında yanlış Supabase URL formatı (`/rest/v1` fazlalığı)
- Supabase e-posta doğrulama rate limitine takılma sorunu ("Confirm email" ayarı kapatılarak aşıldı, geliştirme ortamına özel)
- `profiles` tablosunda eksik olan INSERT RLS policy'si eklendi

---

## [0.3.0] — Seyahat Formu (Gün 9-10)

### Added
- Seyahat formu (şehir, tarih, gün sayısı, bütçe, ilgi alanları, kişi sayısı)
- Zod validasyon şeması
- Form gönderim servis fonksiyonu (Axios + TanStack Query mutation)

---

## [0.4.0] — Gemini Entegrasyonu (Gün 11-13)

### Added
- `POST /api/generate-plan` endpoint'i
- Supabase JWT doğrulama middleware'i
- Rate limiting (`express-rate-limit`)
- Gemini prompt şablonu ve JSON parse mantığı (bkz. [AI_PROMPTS.md](./AI_PROMPTS.md))
- Nominatim ile yer doğrulama akışı (sıralı istek, rate-limit uyumlu)
- `ai_response_cache` tablosu ve cache mantığı
- Gemini 503/429 hataları için otomatik retry mekanizması (artan bekleme süreleriyle, en fazla 3 deneme)

### Changed
- Gemini model adı `gemini-2.0-flash` → `gemini-2.5-flash` → `gemini-3.5-flash` olarak güncellendi (önceki ikisi kullanım sırasında deprecated/erişilemez hale geldi)
- Nominatim'e gönderilen arama terimi, kullanıcıya gösterilen `title` yerine ayrı bir `placeName` alanına taşındı — doğrulama isabet oranını belirgin şekilde artırdı
- Gemini prompt'una konaklama/otel/hostel önerisi üretmeme kuralı eklendi
- Gemini'den `destinationCurrency` (hedef ülkenin resmi para birimi) alanı da istenmeye başlandı

### Fixed
- `express-rate-limit` paketinin IPv6 `keyGenerator` uyumluluk uyarısı (`ipKeyGenerator` helper'ı doğru kullanılarak giderildi)
- **Kritik:** Cache isabet edildiğinde plan Supabase'e hiç kaydedilmiyordu, bu yüzden `tripId` dönmüyor ve kullanıcı `/planlar/undefined` adresine yönleniyordu. Cache artık yalnızca Gemini çağrısını atlıyor, trip kaydı her istekte oluşturuluyor.
- Zod 4'e geçişle `invalid_type_error` sözdiziminin sessizce yok sayılması (İngilizce varsayılan hata mesajları görünüyordu) — `error` sözdizimine güncellendi, Türkçe mesajlar doğrulandı

### Milestone
- 🎯 **MVP çekirdek akışı tamamlandı:** form → Gemini → Nominatim doğrulama → Supabase kaydı, uçtan uca test edildi (cache'li ve cache'siz senaryolar dahil)

---

## [0.5.0] — Sonuç Gösterimi (Gün 14-15)

### Added
- Günlük plan kartları (saat, aktivite, açıklama, tahmini maliyet)
- React Leaflet harita entegrasyonu (marker + polyline), CartoDB Positron tile katmanı ile minimal görünüm
- Open-Meteo hava durumu entegrasyonu, 16 gün üzeri tarihler için bilgilendirme mesajı
- Frankfurter API ile canlı döviz kuru çevirme (bütçe ve aktivite maliyetleri hem seçilen hem hedef ülke para biriminde gösteriliyor)
- Frontend tasarım sistemi: Tailwind v4 `@theme` bloğunda marka/nötr/durum renk tokenları, Manrope font, tutarlı bileşen kütüphanesi (input, kart, buton stilleri)

### Fixed
- Leaflet + Vite marker ikon uyumsuzluğu (bilinen bir workaround ile giderildi)
- Harita `z-index` değeri navbar'ın üzerine biniyordu — navbar'a yüksek z-index, harita sarmalayıcısına `isolate` stacking context eklendi
- `/planlar/:tripId` route'u Layout dışındaydı, sonuç sayfasında navbar görünmüyordu — nested route yapısına alındı

---

## [Unreleased — 0.6.0] — Favoriler ve PDF (Gün 16)

### Planlanan
- Plan favorileme / favoriden çıkarma (`favorite_trips` tablosu hazır, arayüz entegrasyonu sürüyor)
- Bağımsız mekan favorileme
- `jsPDF` ile sade PDF export

---

## [Unreleased — 0.7.0] — Sorun Giderme ve İyileştirme (Gün 17-18)

### Planlanan
- Bilinen teknik borçların gözden geçirilmesi ve dokümantasyonun kodla senkronize edilmesi
- Responsive tasarım son kontrolleri (mobil/tablet breakpoint'leri)
- Loading skeleton ve error state'lerin gözden geçirilmesi
- Kod tekrarlarının küçük refactor'larla sadeleştirilmesi

---

## [Unreleased — 0.8.0] — Son Gözden Geçirme ve Yayın Hazırlığı (Gün 19-20)

### Planlanan
- Kritik akışların uçtan uca manuel testi
- Frontend → Vercel, Backend → Render deploy
- Production ortam değişkenlerinin ayarlanması
- Demo video/GIF ve final dokümantasyon kontrolü

### Milestone (hedef)
- 🚀 **Staj projesi teslimi**

---

## Sürüm Notları Hakkında

Her milestone tamamlandığında bu dosya güncellenmeli, gerçekleşen değişiklikler `Added` / `Changed` / `Fixed` / `Removed` başlıkları altında kaydedilmelidir. Planlanandan sapmalar (örn. bir özelliğin ertelenmesi, bir hatanın düzeltilmesi, bir bağımlılığın değişmesi) da not düşülmelidir — bu, staj sunumunda süreç şeffaflığı göstermek açısından faydalıdır. Bu revizyonda özellikle **gerçek hata kayıtları** (Fixed bölümleri) eklendi; bunlar geliştirme sürecinin sadece plana uygun gitmediğini değil, karşılaşılan sorunların nasıl tespit edilip çözüldüğünü de gösteriyor.