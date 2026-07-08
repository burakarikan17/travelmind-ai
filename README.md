# 🌍 TravelMind AI

> Yapay Zeka Destekli Akıllı Seyahat Planlama Platformu

Full Stack Developer stajı kapsamında geliştirilen, kullanıcıların birkaç bilgi girerek yapay zeka desteğiyle kişiselleştirilmiş seyahat planı oluşturmasını sağlayan web uygulaması.

---

## 📖 Proje Hakkında

TravelMind AI, kullanıcının;

- Gideceği şehir veya ülkeyi
- Seyahat tarihini
- Gün sayısını
- Bütçesini
- İlgi alanlarını
- Kişi sayısını

girmesinin ardından yapay zeka tarafından oluşturulan detaylı bir gezi planı sunar.

Oluşturulan plan;

- Günlük rota ve saatlik aktiviteler
- Gezilecek yerler
- Tahmini maliyet
- Harita üzerinde rota gösterimi

bilgilerini içerir.

> 📌 Bu proje bir **staj projesi** olarak, sınırlı süre (25 gün) ve öğrenme aşamasındaki JavaScript/React bilgisiyle geliştirilmektedir. Kapsam ve teknoloji seçimleri buna göre bilinçli olarak sadeleştirilmiştir. Detaylar için [DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md) dosyasına bakınız.

---

## 🎯 Projenin Amacı

- Modern React geliştirme süreçlerini öğrenmek
- Yapay zeka servisleriyle (Gemini API) çalışmak
- Gerçek hayat senaryosuna uygun bir frontend ağırlıklı full stack uygulama geliştirmek
- State management, API entegrasyonu, authentication ve responsive tasarım konularında deneyim kazanmak

---

## ✨ Temel Özellikler

### 🤖 Yapay Zeka Destekli Seyahat Planı
Gemini API kullanılarak günlük plan, saatlik rota, gezilecek yerler ve tahmini maliyet bilgisi otomatik oluşturulur. Üretilen yer isimleri, halüsinasyon riskini azaltmak için Nominatim (OSM) API ile doğrulanır.

### 🗺️ Harita Desteği
React Leaflet + OpenStreetMap ile marker ve günlük gezi noktaları harita üzerinde gösterilir. (Not: MVP kapsamında noktalar arası düz çizgi kullanılır, gerçek yol rotası v2 kapsamındadır.)

### ☀️ Hava Durumu
Open-Meteo API ile seyahat tarihine göre sıcaklık, yağış ve rüzgar bilgisi gösterilir. Tahmin aralığı dışındaki tarihler için uygun bir uyarı mesajı gösterilir.

### ❤️ Favoriler
Kullanıcı, gezilecek yerleri ve oluşturduğu planları favorilerine ekleyebilir.

### 📄 PDF Olarak İndir
Oluşturulan seyahat planı PDF formatında indirilebilir.

### 👤 Kullanıcı Sistemi
Kayıt ol, giriş yap, çıkış yap (Supabase Auth ile).

### 📱 Responsive Tasarım
Uygulama bilgisayar, tablet ve telefon cihazlarında sorunsuz çalışacak şekilde geliştirilmiştir.

---

## 🛠️ Kullanılan Teknolojiler

### Frontend
- React (Vite)
- JavaScript (ES6+)
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod
- Axios
- React Leaflet

### Backend
- Node.js + Express.js
- Yalnızca Gemini API proxy'si, güvenlik (JWT doğrulama, rate limiting) ve istek yönetimi için kullanılır

### Veritabanı & Auth
- Supabase (PostgreSQL + Auth)

### Yapay Zeka
- Google Gemini API

### Harita
- React Leaflet + OpenStreetMap
- Nominatim (yer doğrulama)

### Hava Durumu
- Open-Meteo API

---

## 🏗️ Sistem Mimarisi

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
  Open-Meteo API (frontend'den direkt)
```

---

## 📂 Proje Yapısı

```text
TravelMind-AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── lib/
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   └── .env.example
├── docs/
│   ├── DEVELOPMENT_PLAN.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── FEATURES.md
│   ├── AI_PROMPTS.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── CHANGELOG.md
└── README.md
```

---

## 🚀 Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/burakarikan17/travelmind-ai.git

# Frontend bağımlılıklarını yükleyin
cd frontend
npm install

# Backend bağımlılıklarını yükleyin
cd ../backend
npm install
```

### Çalıştırma

```bash
# Frontend'i başlatın
cd frontend
npm run dev

# Backend'i başlatın (ayrı terminalde)
cd backend
npm run dev
```

---

## 🔐 Ortam Değişkenleri

**frontend/.env**
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

**backend/.env**
```env
PORT=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

> ⚠️ `.env` dosyaları asla commit edilmemelidir. Her iki klasörde de örnek `.env.example` dosyaları bulunur.

---

## 📚 Dokümantasyon

Detaylı dokümanlar `/docs` klasöründe yer alır:

| Dosya | İçerik |
|---|---|
| [DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md) | 25 günlük detaylı geliştirme takvimi |
| [DATABASE.md](./docs/DATABASE.md) | Supabase tablo şemaları ve ilişkiler |
| [API.md](./docs/API.md) | Backend endpoint dokümantasyonu |
| [FEATURES.md](./docs/FEATURES.md) | Özelliklerin detaylı açıklaması ve kapsamı |
| [AI_PROMPTS.md](./docs/AI_PROMPTS.md) | Gemini prompt şablonları |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Sistem mimarisi detayları |
| [ROADMAP.md](./docs/ROADMAP.md) | Gelecek özellikler ve v2 planı |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Sürüm geçmişi |

---

## 🚀 Yayınlama

| Servis | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase |

---

## 📅 Geliştirme Süreci Özeti

- **5 gün** — Teknoloji öğrenimi (JavaScript, React, Supabase, Tailwind, Leaflet, Gemini API)
- **20 gün** — Geliştirme, test ve yayınlama

Detaylı plan için: [docs/DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md)

---

## 🔮 Gelecekte Eklenebilecek Özellikler (v2)

- Gerçek yol rotası (OSRM / leaflet-routing-machine)
- Google ile giriş
- Çoklu dil desteği
- Harcama takibi
- AI sohbet asistanı
- Takvim entegrasyonu
- Bildirim sistemi
- PWA desteği

---

## 👨‍💻 Geliştirici

Bu proje, frontend geliştirme becerilerini geliştirmek ve modern web teknolojilerini öğrenmek amacıyla Full Stack Developer staj projesi olarak geliştirilmektedir.