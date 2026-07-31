import dotenv from 'dotenv'
dotenv.config()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`

async function callGeminiWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options)

    if (response.ok) return response

    if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
      const waitTime = (attempt + 1) * 3000
      console.log(`Gemini API meşgul (${response.status}), ${waitTime / 1000}sn sonra tekrar denenecek... (deneme ${attempt + 1}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      continue
    }

    return response
  }
}

function buildPrompt({ destination, startDate, durationDays, budget, currency, peopleCount, interests }) {
  const isAutoInterests = interests.length === 1 && interests[0] === 'otomatik'

  const interestsInstruction = isAutoInterests
    ? `Kullanıcı belirli bir ilgi alanı seçmedi. Bu görevi SEN üstleneceksin: "${destination}" hangi konuda daha çok öne çıkıyor, oraya göre plan ağırlığını sen belirle. Örneğin: mutfağıyla ünlü bir yerse yeme-içme aktivitelerine, tarihi dokusuyla ünlüyse müze/tarihi mekanlara, doğasıyla ünlüyse doğa aktivitelerine, gece hayatıyla ünlüyse eğlence mekanlarına ağırlık ver. Kararını gerekçelendirmene gerek yok, sadece plana yansıt.`
    : `İlgi Alanları: ${interests.join(', ')} — plandaki aktiviteleri bu ilgi alanlarına göre önceliklendir.`

  return `Sen bir seyahat planlama asistanısın. Aşağıdaki bilgilere göre detaylı, gerçekçi bir GÜNLÜK GEZİ planı oluştur.

SEYAHAT BİLGİLERİ:
- Şehir/Ülke: ${destination}
- Başlangıç Tarihi: ${startDate}
- Süre: ${durationDays} gün
- Bütçe: ${budget} ${currency}
- Kişi Sayısı: ${peopleCount}
- ${interestsInstruction}

KURALLAR:
1. SADECE geçerli JSON formatında cevap ver. Açıklama, markdown, kod bloğu işareti, giriş/kapanış cümlesi EKLEME.
2. Önerdiğin her yer/mekan gerçekten var olmalı ve ${destination} şehrinde/bölgesinde bulunmalıdır. Emin olmadığın, uydurma bir mekan adı ASLA verme.
3. Her aktivite için tahmini maliyeti ${currency} cinsinden ver; bu bir tahmindir.
4. Toplam plan, belirtilen bütçeyi (${budget} ${currency}) aşmamaya çalışmalı.
5. Her gün için 3-5 arası zaman dilimi öner, gerçekçi saatler kullan.
6. HER AKTİVİTE İÇİN SOMUT BİR MEKAN ADI VER — yemek, müze, park, gezinti yeri fark etmeksizin. Genel bir aktivite tanımıyla (örn. sadece "ramen yemek", "müze gezmek") yetinme.
   - Aktivite belirli bir yemek/lezzet türüyse: o bölgede bu lezzetle en çok özdeşleşmiş, EN POPÜLER (en pahalı değil, en çok tercih edilen/bilinen) mekanı bul.
   - Aktivite bir müze, park, tarihi/doğal mekansa: o mekanın RESMİ adını kullan.
   - "title" alanını şu formatta yaz: "<Aktivitenin kullanıcıya yönelik Türkçe açıklayıcı adı> (<Mekanın Türkçe bilinen adı>)". Örnek: "Yuzu Aromalı Hafif Ramen (Fuunji)" veya "Sahil Yürüyüşü (Gülpınar Sahili)".
   - Gerçekten hiçbir spesifik mekan bulamıyorsan (çok nadir bir durum olmalı), parantez kısmını boş bırak, ama bunu mümkün olduğunca az yap.
7. "placeName" alanına, mekanın ULUSLARARASI/İNGİLİZCE bilinen adını veya o ülkenin resmi dilindeki adını yaz — Türkçe çeviri KULLANMA. Bu alan haritalama servisinde arama yapmak için kullanılacak, bu yüzden mekanın dünya genelinde tanındığı isim olmalı. Örnek: title'da "Tokyo Ulusal Müzesi" yazsa bile, placeName "Tokyo National Museum" olmalı. Parantez boşsa placeName de boş string olsun.
8. KONAKLAMA/OTEL/HOSTEL ÖNERME. Kullanıcı kalacağı yeri kendisi ayarlıyor.
9. En üst seviyede "destinationCurrency" alanına, ${destination}'ın bulunduğu ülkede resmi olarak kullanılan para biriminin ISO 4217 kodunu yaz.

BEKLENEN JSON ŞEMASI:
{
  "destinationCurrency": "EUR",
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "summary": "Günün kısa özeti",
      "activities": [
        {
          "timeSlot": "09:00 - 11:00",
          "title": "Türkçe açıklama (Türkçe mekan adı)",
          "placeName": "İngilizce/yerel dilde mekan adı",
          "description": "1-2 cümlelik açıklama",
          "category": "gezi | yeme-icme | eglence | ulasim | diger",
          "estimatedCost": 500
        }
      ]
    }
  ]
}

Şimdi yukarıdaki kurallara uyarak ${durationDays} günlük planı oluştur.`
}

function cleanGeminiResponse(rawText) {
  return rawText.replace(/```json|```/g, '').trim()
}

export async function generateTripPlan(formData) {
  const prompt = buildPrompt(formData)

  const response = await callGeminiWithRetry(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) {
  const errText = await response.text()
  console.error('Gemini API hatası:', errText)
  if (response.status === 429) {
    throw new Error('GEMINI_QUOTA_EXCEEDED')
  }
  throw new Error('GEMINI_API_ERROR')
}

  const data = await response.json()
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    throw new Error('GEMINI_EMPTY_RESPONSE')
  }

  const cleaned = cleanGeminiResponse(rawText)

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    console.error('Gemini cevabı parse edilemedi:', cleaned)
    throw new Error('AI_RESPONSE_PARSE_ERROR')
  }
}