# ✨ FEATURES.md

## TravelMind AI — Özellik Detayları ve Kapsam

Bu doküman, her özelliğin MVP kapsamında ne içerdiğini, neyi içermediğini ve hangi fazda geliştirileceğini netleştirir. Amaç, geliştirme sırasında kapsam kaymasını (scope creep) önlemektir.

---

## 1. 👤 Kullanıcı Sistemi

**Faz:** 1 (Gün 6-8)

**MVP kapsamında:**
- E-posta/şifre ile kayıt ve giriş (Supabase Auth)
- Çıkış yapma
- Korumalı sayfalar (giriş yapmadan seyahat planı oluşturulamaz)
- Basit profil sayfası (ad soyad görüntüleme/düzenleme)

**MVP kapsamı dışında:**
- Google/sosyal medya ile giriş → [ROADMAP.md](./ROADMAP.md)
- Şifre sıfırlama akışı (zaman kalırsa Faz 6'da eklenebilir)
- E-posta doğrulama zorunluluğu (Supabase varsayılanı kullanılır, özelleştirilmez)

---

## 2. 📝 Seyahat Formu

**Faz:** 2 (Gün 9-10)

**MVP kapsamında:**
- Alanlar: şehir/ülke, başlangıç tarihi, gün sayısı, bütçe, kişi sayısı, ilgi alanları (çoklu seçim)
- Zod ile validasyon: zorunlu alanlar, tarih geçmişte olamaz, gün sayısı 1-30 arası, bütçe > 0
- Form gönderiminde loading state ve hata mesajı gösterimi

**MVP kapsamı dışında:**
- Adım adım (multi-step wizard) form deneyimi — tek sayfalık form yeterli
- Otomatik tamamlama (autocomplete) ile şehir önerisi — zaman kalırsa eklenebilir

---

## 3. 🤖 Yapay Zeka Destekli Seyahat Planı

**Faz:** 3 (Gün 11-14) — **kritik özellik**

**MVP kapsamında:**
- Gemini API'den yapılandırılmış (JSON) plan üretimi
- Günlük plan + saatlik aktivite kırılımı
- Tahmini maliyet bilgisi
- Üretilen yer isimlerinin Nominatim ile doğrulanması, doğrulanamayanların etiketlenmesi
- Aynı sorgu kombinasyonu için cache mekanizması

**MVP kapsamı dışında:**
- Kullanıcının planı sohbet ederek (chat) düzenlemesi → [ROADMAP.md](./ROADMAP.md)
- Restoran/mekan için gerçek zamanlı puan/yorum gösterimi (Google Places gibi ücretli bir API gerektirir)
- Planın AI tarafından otomatik yeniden optimize edilmesi (örn. "daha ucuz yap" butonu)

---

## 4. 🗺️ Harita Desteği

**Faz:** 4 (Gün 15-17)

**MVP kapsamında:**
- React Leaflet + OpenStreetMap ile harita gösterimi
- Her aktivite için marker
- Marker'lar arası düz çizgi (polyline) ile günlük rota gösterimi
- Marker'a tıklayınca aktivite detay popup'ı

**MVP kapsamı dışında:**
- Gerçek yol/yürüyüş rotası (OSRM / `leaflet-routing-machine`) → [ROADMAP.md](./ROADMAP.md), teknik karmaşıklığı nedeniyle v2'ye ertelendi
- Toplu taşıma rotası önerisi
- Offline harita desteği

---

## 5. ☀️ Hava Durumu

**Faz:** 4 (Gün 15-17)

**MVP kapsamında:**
- Open-Meteo API ile sıcaklık, yağış, rüzgar bilgisi
- Seyahat tarihine göre günlük hava durumu kartı
- Tahmin aralığı (~16 gün) dışındaki tarihler için bilgilendirme mesajı: *"Bu tarih için hava durumu tahmini henüz mevcut değil."*

**MVP kapsamı dışında:**
- Geçmiş yıllara ait iklim ortalaması gösterimi (fallback olarak düşünülebilir, ama MVP'de yok)
- Saatlik hava durumu detayı — sadece günlük özet yeterli

---

## 6. ❤️ Favoriler

**Faz:** 5 (Gün 18-19)

**MVP kapsamında:**
- Tüm bir seyahat planını favorileme/favoriden çıkarma
- Bağımsız mekanları favorileme (plana bağlı olmadan)
- Favoriler sayfasında listeleme

**MVP kapsamı dışında:**
- Favori planları kategorilere ayırma/etiketleme
- Favorileri arkadaşlarla paylaşma

**Not:** Zaman darlığı durumunda bu özellik ilk kısaltılacak/ertelenecek özelliktir (bkz. [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) risk yönetimi).

---

## 7. 📄 PDF Olarak İndir

**Faz:** 5 (Gün 18-19)

**MVP kapsamında:**
- `jsPDF` ile tek sayfalık, sade (liste formatında) plan çıktısı
- Gün, saat, aktivite, tahmini maliyet bilgilerini içerir

**MVP kapsamı dışında:**
- Görsel açıdan zengin, çok sayfalı, harita görselli PDF tasarımı
- PDF'i e-posta ile gönderme

---

## 8. 📱 Responsive Tasarım

**Faz:** 6 (Gün 20-21)

**MVP kapsamında:**
- Tailwind breakpoint'leri (`sm`, `md`, `lg`) ile mobil, tablet, masaüstü uyumluluğu
- Navbar'ın mobilde hamburger menüye dönüşmesi
- Form ve kartların küçük ekranda okunabilir kalması

**MVP kapsamı dışında:**
- PWA desteği (ana ekrana ekleme, offline çalışma) → [ROADMAP.md](./ROADMAP.md)
- Native mobil uygulama

---

## 📊 Öncelik Matrisi

| Özellik | Öncelik | Kesilirse ne olur? |
|---|---|---|
| Kullanıcı sistemi | 🔴 Zorunlu | Proje çalışmaz |
| Seyahat formu | 🔴 Zorunlu | Proje çalışmaz |
| AI plan üretimi | 🔴 Zorunlu | Projenin ana değeri kaybolur |
| Harita | 🟡 Önemli | Plan yine de kart listesi olarak gösterilebilir |
| Hava durumu | 🟢 İyi olur | Gösterilmeden de plan işlevini korur |
| Favoriler | 🟢 İyi olur | İlk ertelenecek özellik |
| PDF export | 🟢 İyi olur | İkinci ertelenecek özellik |
| Responsive | 🟡 Önemli | Sunum/değerlendirme için önemli, minimumda tutulmalı |

🔴 Zorunlu · 🟡 Önemli ama esnek · 🟢 Zaman kalırsa