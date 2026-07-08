# 🤖 AI_PROMPTS.md

## TravelMind AI — Gemini Prompt Şablonları

Bu doküman, backend'in `/api/generate-plan` endpoint'inde Gemini API'ye gönderdiği prompt şablonlarını ve halüsinasyon azaltma stratejisini tanımlar.

---

## 🎯 Tasarım İlkeleri

1. **Her zaman yapılandırılmış JSON iste.** Serbest metin cevap asla parse edilmeye çalışılmaz.
2. **Şema, prompt içinde açıkça verilir.** Model, alan adlarını tahmin etmek zorunda bırakılmaz.
3. **Gemini'nin ürettiği yer isimleri "kesin doğru" kabul edilmez.** Backend tarafında Nominatim ile ayrıca doğrulanır (bkz. [API.md](./API.md)).
4. **Model belirsizse uydurmak yerine belirtsin diye yönlendirilir** — "emin değilsen genel bir aktivite öner, spesifik ama var olmayan bir mekan uydurma" gibi talimatlarla.
5. **Maliyet tahminleri "tahmini" olarak işaretlenir**, kesin fiyat gibi sunulmaz.

---

## 📋 Ana Prompt Şablonu (`generate-plan`)

```
Sen bir seyahat planlama asistanısın. Aşağıdaki bilgilere göre detaylı, gerçekçi bir seyahat planı oluştur.

SEYAHAT BİLGİLERİ:
- Şehir/Ülke: {{destination}}
- Başlangıç Tarihi: {{startDate}}
- Süre: {{durationDays}} gün
- Bütçe: {{budget}} {{currency}}
- Kişi Sayısı: {{peopleCount}}
- İlgi Alanları: {{interests}}

KURALLAR:
1. SADECE geçerli JSON formatında cevap ver. Açıklama, markdown, kod bloğu işareti (```), giriş/kapanış cümlesi EKLEME.
2. Önerdiğin her yer/mekan gerçekten var olmalı ve {{destination}} şehrinde/bölgesinde bulunmalıdır. Emin olmadığın, uydurma, hayali bir mekan adı ASLA verme. Emin değilsen, o zaman dilimi için mekan adı yerine genel bir aktivite kategorisi öner (örn. "Şehir merkezinde serbest zaman" gibi).
3. Her aktivite için tahmini maliyeti {{currency}} cinsinden ver; bu bir tahmindir, kesin fiyat olarak sunma.
4. Toplam plan, belirtilen bütçeyi ({{budget}} {{currency}}) aşmamaya çalışmalı.
5. İlgi alanlarına ({{interests}}) uygun aktiviteleri önceliklendir.
6. Her gün için 3-5 arası zaman dilimi (aktivite) öner, gerçekçi saatler kullan (çok sıkışık bir program yapma).

BEKLENEN JSON ŞEMASI:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "summary": "Günün kısa özeti (1 cümle)",
      "activities": [
        {
          "timeSlot": "09:00 - 11:00",
          "title": "Mekan/aktivite adı",
          "description": "1-2 cümlelik açıklama",
          "category": "gezi | yeme-icme | konaklama | ulasim | diger",
          "estimatedCost": 500
        }
      ]
    }
  ]
}

Şimdi yukarıdaki kurallara uyarak {{durationDays}} günlük planı oluştur.
```

---

## 🔍 Yer Doğrulama Akışı (Nominatim Entegrasyonu)

Gemini'den dönen her `activities[].title` alanı için backend şu adımları izler:

```
1. title + destination birleştirilerek Nominatim'e sorgu atılır:
   GET https://nominatim.openstreetmap.org/search?q={title},{destination}&format=json&limit=1

2. Sonuç varsa:
   - isPlaceVerified = true
   - latitude / longitude Nominatim sonucundan alınır

3. Sonuç yoksa:
   - isPlaceVerified = false
   - latitude / longitude null bırakılır (harita üzerinde gösterilmez
     veya şehir merkezine yakın genel bir nokta ile "yaklaşık konum" etiketiyle gösterilir)
   - Frontend bu aktiviteyi "AI önerisi, doğrulanamadı" rozetiyle gösterir
```

> ⚠️ Nominatim kullanım politikası gereği saniyede en fazla 1 istek atılmalıdır (`Usage Policy`). Çok günlü planlarda bu, sıralı (sequential) işlenmeli, paralel istek atılmamalıdır.

---

## 🧪 Örnek Girdi / Çıktı

**Girdi (form verisi):**
```json
{
  "destination": "Kapadokya, Türkiye",
  "startDate": "2026-09-15",
  "durationDays": 2,
  "budget": 8000,
  "currency": "TRY",
  "peopleCount": 2,
  "interests": ["doğa", "tarih", "fotoğrafçılık"]
}
```

**Beklenen çıktı (özet):**
```json
{
  "days": [
    {
      "dayNumber": 1,
      "date": "2026-09-15",
      "summary": "Vadi yürüyüşleri ve gün batımı",
      "activities": [
        {
          "timeSlot": "07:00 - 08:30",
          "title": "Kapadokya Sıcak Hava Balonu Turu",
          "description": "Gün doğumunda balon turuyla vadileri kuş bakışı görme fırsatı.",
          "category": "gezi",
          "estimatedCost": 2500
        }
      ]
    }
  ]
}
```

---

## 🛡️ Hata Toleransı

Gemini bazen şemaya tam uymayan veya markdown kod bloğu (` ```json `) ile sarılmış cevap dönebilir. Backend'de parse öncesi şu temizlik uygulanır:

```javascript
function cleanGeminiResponse(rawText) {
  return rawText
    .replace(/```json|```/g, "")
    .trim();
}

function parsePlanResponse(rawText) {
  const cleaned = cleanGeminiResponse(rawText);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Parse başarısızsa kullanıcıya "planınız oluşturulamadı,
    // lütfen tekrar deneyin" mesajı döndürülür (500/502 hatası).
    throw new Error("AI_RESPONSE_PARSE_ERROR");
  }
}
```

Parse hatası durumunda kullanıcıya teknik detay gösterilmez, genel bir hata mesajı ve "tekrar dene" butonu gösterilir (bkz. [FEATURES.md](./FEATURES.md) — hata state'leri).

---

## 💰 Maliyet Kontrolü Notu

- Her prompt çağrısı, cache mekanizmasından geçtikten sonra (bkz. [API.md](./API.md)) yapılır — aynı kombinasyon tekrar Gemini'ye gönderilmez.
- Prompt'ta `max_tokens` sınırı makul bir üst değere sabitlenir (örn. 30 günlük plan gibi aşırı büyük çıktılar önlenir; `durationDays` zaten form validasyonunda 1-30 ile sınırlıdır).