# 🔮 ROADMAP.md

## TravelMind AI — Gelecek Planı

Bu doküman, MVP (staj kapsamındaki 20 günlük sürüm — bkz. [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)) tamamlandıktan sonra eklenebilecek özellikleri, bilinçli olarak MVP dışında bırakılan teknik kararları ve önceliklerini listeler.

> MVP'de nelerin kapsam dışı bırakıldığına dair gerekçeler için bkz. [ARCHITECTURE.md](./ARCHITECTURE.md) ve [FEATURES.md](./FEATURES.md).

---

## 🎯 v2 — Kısa Vadeli (staj sonrası ilk geliştirme dönemi)

### 1. Seyahat Simülasyonu ⭐ (öncelikli değerlendiriliyor)
- Plan oluşturulduktan sonra kullanıcının planını "yaşayarak" deneyimleyebileceği bir mod
- Amaç: statik bir liste yerine, günü/aktiviteyi sırayla ilerleten, seyahati daha gerçekçi hissettiren bir sunum katmanı
- Henüz kapsamı netleşmedi — olası yaklaşımlar: gün/saat bazlı bir "şu an buradasın" göstergesi, aktiviteler arası geçiş animasyonu, veya harita üzerinde rotayı adım adım oynatan bir görselleştirme
- Mevcut veri modeli (`trip_days` → `trip_activities`, koordinatlar dahil) bu özelliği desteklemeye uygun; ek bir backend değişikliği gerekmeyebilir, öncelikle frontend'de bir sunum/state katmanı olarak değerlendiriliyor
- Kapsam netleştikçe bu madde detaylandırılacak

### 2. Gerçek Yol Rotası
- `leaflet-routing-machine` + OSRM entegrasyonu
- Marker'lar arası düz çizgi yerine gerçek yürüyüş/araç rotası
- Tahmini yol süresi ve mesafe gösterimi
- Not: Seyahat Simülasyonu özelliği ile doğrudan ilişkili — gerçek rota verisi, simülasyonu daha inandırıcı kılar

### 3. Google ile Giriş
- Supabase Auth üzerinden OAuth (Google provider) entegrasyonu

### 4. Şifre Sıfırlama Akışı
- "Şifremi unuttum" — Supabase'in hazır e-posta akışıyla

### 5. Planı Sohbet Ederek Düzenleme
- Kullanıcının "bu günü daha ucuz yap" / "müzeleri çıkar" gibi doğal dil komutlarıyla mevcut planı güncelleyebilmesi
- Gemini'ye önceki plan + kullanıcı talebini birlikte gönderen bir "revize prompt" şablonu gerektirir

### 6. TypeScript'e Geçiş
- JS temelleri oturduktan sonra projeyi kademeli olarak TypeScript'e taşımak (öğrenme amaçlı, teknik borç azaltma amaçlı)

---

## 🌱 v3 — Orta Vadeli

### 1. Çoklu Dil Desteği
- `react-i18next` ile TR/EN dil seçeneği
- Gemini prompt'unun seçilen dile göre üretilmesi

### 2. Harcama Takibi
- Kullanıcının gerçekleşen harcamalarını plana göre işaretleyip karşılaştırabilmesi
- Bütçe aşımı uyarıları

### 3. Takvim Entegrasyonu
- Google Calendar'a planı aktarma (`.ics` export veya Calendar API)

### 4. Bildirim Sistemi
- Seyahat tarihi yaklaştığında e-posta/push hatırlatması
- Hava durumu değişikliği bildirimleri

### 5. PWA Desteği
- Ana ekrana ekleme
- Temel offline erişim (son görüntülenen planların cache'lenmesi)

### 6. Gerçek Zamanlı Mekan Verisi
- Google Places API veya benzeri ücretli bir servisle entegrasyon
- Gerçek puanlar, yorumlar, açık/kapalı bilgisi
- Bu, mevcut Nominatim tabanlı doğrulamanın yerini alabilir veya onu zenginleştirebilir

---

## 🏗️ Uzun Vadeli / Teknik Borç

| Konu | Açıklama |
|---|---|
| State management | Uygulama büyüdükçe TanStack Query yetersiz kalırsa Zustand/Redux değerlendirilebilir |
| Test coverage | MVP'de minimal test var; v2'de kritik akışlar için Vitest + React Testing Library ile kapsamlı test yazılabilir |
| E2E test | Playwright/Cypress ile kayıt→plan oluştur→favorile akışının otomasyonu |
| Backend ölçekleme | Trafik artarsa Redis tabanlı rate limiting, yatay ölçekleme |
| Cache stratejisi | `ai_response_cache` için otomatik temizlik (pg_cron) |
| Tasarım sistemi | Tailwind'den bir component kütüphanesine (örn. shadcn/ui) geçiş değerlendirilebilir |
| Monitoring | Sentry/LogRocket gibi bir hata izleme aracı entegrasyonu |
| Dış servis bağımlılıkları | Gemini model isimleri geliştirme sürecinde birkaç kez değişti (deprecated oldu); v2'de model adı bir ortam değişkenine taşınarak kod değişikliği gerekmeden güncellenebilir hale getirilebilir |

---

## ❌ Bilinçli Olarak Ertelenen / Reddedilen Fikirler

Bu bölüm, "neden yapmadık" sorusuna gelecekte cevap verebilmek için tutulur.

| Fikir | Neden ertelendi |
|---|---|
| Native mobil uygulama | Kapsam dışı, web responsive tasarım yeterli MVP hedefi için |
| Kullanıcılar arası plan paylaşımı/sosyal özellikler | Karmaşıklığı önemli ölçüde artırır, çekirdek değer önerisiyle doğrudan ilgili değil |
| Kendi geocoding servisimizi kurmak | Nominatim public API, MVP trafiği için yeterli; kendi altyapımızı kurmak erken optimizasyon olurdu |
| Framer Motion ile gelişmiş animasyonlar | Görsel bonus, öğrenme süresi kısıtlıyken önceliklendirilmedi |

---

## 📌 Önceliklendirme Notu

v2 ve sonrası özellikler, staj bitiminde projenin gerçek kullanıcı geri bildirimi alıp almadığına göre yeniden sıralanmalıdır. Yukarıdaki sıralama, staj sunumu sırasında "bir sonraki adım ne olurdu" sorusuna hazırlıklı olmak için mevcut mimariyle en uyumlu ve en düşük ek karmaşıklık getiren özelliklere göre yapılmıştır. Seyahat Simülasyonu fikri, mentöre proje tanıtımı sırasında paylaşılmış olup en yüksek öncelikli v2 adayı olarak işaretlenmiştir.