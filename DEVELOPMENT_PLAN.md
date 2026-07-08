# 📅 DEVELOPMENT_PLAN.md

## TravelMind AI — 25 Günlük Geliştirme Planı

Bu doküman, stajyer geliştiricinin mevcut teknik seviyesine göre hazırlanmıştır.

**Mevcut seviye:** Python/C#/Java/PHP/SQL orta, HTML/CSS iyi, JavaScript ve React başlangıç seviyesi.

**Toplam süre:** 25 gün (5 gün öğrenme + 20 gün geliştirme)

---

## 🧭 Genel Strateji

- İlk 5 gün, projede kullanılacak teknolojilere odaklanan yoğun bir öğrenme kampı.
- Kalan 20 gün, MVP'yi (çalışan çekirdek akış) mümkün olduğunca erken bitirmeye odaklanan aşamalı bir geliştirme süreci.
- **Gün 14 kontrol noktası:** Bu tarihte formdan Gemini'ye, oradan sonuç ekranına kadar uçtan uca çalışan bir akış hedeflenir. Bu noktaya kadar gecikme varsa favoriler/PDF gibi ikincil özellikler kapsam dışına alınabilir.
- Kapsam bilinçli olarak sadeleştirilmiştir: TypeScript, Zustand, Framer Motion ve gerçek yol routing'i gibi ek öğrenme yükü getiren teknolojiler MVP dışında tutulmuştur (bkz. [ROADMAP.md](./ROADMAP.md)).

---

## 📘 Faz 0 — Öğrenme Dönemi (Gün 1-5)

### Gün 1 — Modern JavaScript
- `let/const`, arrow function, template literal
- Destructuring, spread/rest operator
- Array metodları: `map`, `filter`, `find`, `reduce`
- `async/await`, `fetch` ile API çağrısı, Promise mantığı
- Modül sistemi (`import`/`export`)

**Çıktı:** Basit bir konsol uygulaması (örn. bir dizi üzerinde filtreleme/dönüştürme yapan küçük script).

### Gün 2 — React Temelleri
- Component mantığı, JSX
- `props` ile veri geçişi
- `useState` ile state yönetimi
- `useEffect` ile yan etkiler (API çağrısı, mount/unmount)

**Çıktı:** Mini bir "to-do list" uygulaması.

### Gün 3 — Routing, Form, HTTP
- React Router ile sayfa geçişleri
- React Hook Form + Zod ile form ve validasyon
- Axios ile GET/POST istekleri
- TanStack Query temel kullanımı (`useQuery`, `useMutation`)

**Çıktı:** Validasyonlu basit bir kayıt formu + sahte bir API'den veri çeken sayfa.

### Gün 4 — Supabase
- Proje oluşturma, tablo tasarımı
- Supabase Auth (kayıt/giriş) entegrasyonu
- Supabase JS client ile CRUD işlemleri
- Row Level Security (RLS) kavramı

**Çıktı:** Kayıt/giriş yapılabilen, bir tabloya veri yazıp okuyan mini deneme projesi.

### Gün 5 — Tailwind + Leaflet + Gemini
- Tailwind ile hızlı stil yazma pratiği
- React Leaflet ile harita gösterme, marker ekleme
- Gemini API'ye basit istek atıp JSON formatında cevap alma denemesi
- Express ile minimal bir proxy endpoint yazma denemesi

**Çıktı:** Sahte veriyle harita + kart gösteren uçtan uca mini prototip.

---

## 🏗️ Faz 1 — Temel Kurulum (Gün 6-8)

- Vite ile proje iskeleti (frontend + backend ayrı klasörler)
- Klasör yapısı: `components`, `pages`, `hooks`, `services`, `lib`
- Supabase projesi kurulumu, tablo şemaları (`users`, `trips`, `favorites`)
- Supabase Auth entegrasyonu: kayıt, giriş, çıkış, korumalı route'lar (`ProtectedRoute` component)
- Temel layout: navbar, sayfa iskeletleri, 404 sayfası

**Kontrol noktası:** Kullanıcı kayıt olabiliyor, giriş yapabiliyor, korumalı sayfaya erişebiliyor.

---

## 📝 Faz 2 — Seyahat Formu (Gün 9-10)

- React Hook Form + Zod ile form: şehir, tarih, gün sayısı, bütçe, ilgi alanları (multi-select), kişi sayısı
- Form validasyonu ve UX (hata mesajları, submit sırasında loading state)
- Form verisini backend'e gönderecek servis fonksiyonu (Axios + TanStack Query mutation)

**Kontrol noktası:** Form dolduruluyor, validasyon çalışıyor, veri konsola/network sekmesine doğru gidiyor.

---

## 🤖 Faz 3 — Backend + Gemini Entegrasyonu (Gün 11-14)

> Projenin en kritik ve en riskli fazı. Zaman planlamasında buraya pay bırakılmıştır.

- Express server kurulumu, `POST /api/generate-plan` endpoint'i
- Supabase JWT doğrulama middleware'i (istek doğrulanmadan Gemini'ye geçirilmez)
- Rate limiting (`express-rate-limit`) — kullanıcı başına saatlik istek sınırı
- Gemini prompt tasarımı: yapılandırılmış JSON formatında cevap (gün, saat, aktivite, tahmini maliyet alanlarıyla) — detaylar [AI_PROMPTS.md](./AI_PROMPTS.md)
- Yer doğrulama: Gemini'nin ürettiği yer isimleri Nominatim (OSM Geocoding) API ile kontrol edilir; bulunamayan yerler "AI önerisi, doğrulanamadı" etiketiyle gösterilir
- Basit cache: aynı şehir + tarih + bütçe + ilgi alanı kombinasyonu Supabase'de saklanır, tekrar istekte Gemini'ye gidilmeden oradan döner

**Kontrol noktası (Gün 14 — MVP hedefi):** Form → Gemini → yapılandırılmış plan çıktısı uçtan uca çalışıyor.

---

## 🗺️ Faz 4 — Sonuç Gösterimi (Gün 15-17)

- Günlük plan kartları (saat, aktivite, açıklama, tahmini maliyet)
- React Leaflet ile harita: marker'lar + noktalar arası düz polyline
- Open-Meteo entegrasyonu (forecast API ~16 gün öncesine kadar çalışır; bu aralık dışında uygun bir bilgi mesajı gösterilir)

**Kontrol noktası:** Plan; kart listesi, harita ve hava durumu ile birlikte görüntüleniyor.

---

## ❤️ Faz 5 — Favoriler + PDF (Gün 18-19)

- Favorilere ekleme/çıkarma (Supabase tablo + TanStack Query mutation)
- PDF export: `jsPDF` ile sade, tek sayfalık plan çıktısı

**Not:** Zaman darsa bu faz kısaltılabilir; temel akış (Faz 1-4) her zaman önceliklidir.

---

## 📱 Faz 6 — Responsive + Cilalama (Gün 20-21)

- Mobil/tablet breakpoint kontrolleri (Tailwind `sm:`, `md:`, `lg:`)
- Loading skeleton'ları
- Error state'leri (API hatası, boş sonuç, timeout, ağ hatası)

---

## 🧪 Faz 7 — Test ve Hata Ayıklama (Gün 22-23)

- Kritik akışların manuel testi: kayıt → giriş → plan oluştur → favorile → PDF indir
- Zaman kalırsa temel Vitest testleri (örn. form validasyonu)
- Console hataları ve network sekmesi kontrolü
- Farklı ekran boyutlarında manuel responsive test

---

## 🚀 Faz 8 — Deploy (Gün 24-25)

- Frontend → Vercel, Backend → Render
- Ortam değişkenlerinin production'da doğru ayarlanması
- `.env.example` dosyalarının eklenmesi (gerçek key'ler commit edilmez)
- README güncellemesi, kısa bir demo video/GIF hazırlığı (staj sunumu için)

---

## ⏱️ Özet Takvim

| Gün | Faz | Odak |
|---|---|---|
| 1-5 | Öğrenme | JS, React, Supabase, Tailwind, Leaflet, Gemini |
| 6-8 | Faz 1 | Kurulum + Auth |
| 9-10 | Faz 2 | Seyahat formu |
| 11-14 | Faz 3 | Backend + Gemini entegrasyonu (kritik faz) |
| 15-17 | Faz 4 | Harita + hava durumu + sonuç gösterimi |
| 18-19 | Faz 5 | Favoriler + PDF |
| 20-21 | Faz 6 | Responsive + cilalama |
| 22-23 | Faz 7 | Test |
| 24-25 | Faz 8 | Deploy + sunum hazırlığı |

---

## ⚠️ Risk Yönetimi

| Risk | Önlem |
|---|---|
| Gemini'nin yanlış/uydurma bilgi üretmesi | Nominatim ile yer doğrulama, "doğrulanamadı" etiketi |
| Gemini API maliyetinin artması | Rate limiting + Supabase cache |
| JS/React öğreniminin 5 günde yetersiz kalması | Faz 1'de basit örneklerle tekrar pekiştirme payı bırakılmıştır |
| 20 günün yetmemesi | Gün 14 MVP kontrol noktası; yetmezse Faz 5 kısaltılır, Faz 6-7 sadeleştirilir |
| Open-Meteo'nun uzak tarihli seyahatlerde veri dönmemesi | Kullanıcıya net bir bilgi mesajı gösterilir, uygulama kırılmaz |