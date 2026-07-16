import dotenv from 'dotenv'
dotenv.config()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`

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
  return `Sen bir seyahat planlama asistanısın. Aşağıdaki bilgilere göre detaylı, gerçekçi bir GÜNLÜK GEZİ planı oluştur.

SEYAHAT BİLGİLERİ:
- Şehir/Ülke: ${destination}
- Başlangıç Tarihi: ${startDate}
- Süre: ${durationDays} gün
- Bütçe: ${budget} ${currency}
- Kişi Sayısı: ${peopleCount}
- İlgi Alanları: ${interests.join(', ')}

KURALLAR:
1. SADECE geçerli JSON formatında cevap ver. Açıklama, markdown, kod bloğu işareti, giriş/kapanış cümlesi EKLEME.
2. Önerdiğin her yer/mekan gerçekten var olmalı ve ${destination} şehrinde/bölgesinde bulunmalıdır. Emin olmadığın, uydurma bir mekan adı ASLA verme. Emin değilsen, mekan adı yerine genel bir aktivite kategorisi öner.
3. Her aktivite için tahmini maliyeti ${currency} cinsinden ver; bu bir tahmindir.
4. Toplam plan, belirtilen bütçeyi (${budget} ${currency}) aşmamaya çalışmalı.
5. İlgi alanlarına (${interests.join(', ')}) uygun aktiviteleri önceliklendir.
6. Her gün için 3-5 arası zaman dilimi öner, gerçekçi saatler kullan.
7. "placeName" alanına SADECE mekanın gerçek, resmi adını yaz — "Giriş", "Alışverişi", "Akşam Yemeği", "'da" gibi ek kelimeler veya hal ekleri EKLEME. Örnek: title "Gino Sorbillo'da Akşam Yemeği" ise placeName "Gino Sorbillo" olmalı.
8. KONAKLAMA/OTEL/HOSTEL ÖNERME. Kullanıcı kalacağı yeri kendisi ayarlıyor, plana otel check-in, hostel yerleşme gibi konaklama aktiviteleri EKLEME. Sadece gezi, yeme-içme, eğlence, ulaşım gibi günlük aktivitelere odaklan.
9. En üst seviyede (days dizisinin yanında, aynı JSON objesinin içinde) "destinationCurrency" alanına, ${destination}'ın bulunduğu ülkede resmi olarak kullanılan para biriminin ISO 4217 kodunu yaz (örn. İtalya için "EUR", Japonya için "JPY", ABD için "USD").

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
          "title": "Kullanıcıya gösterilecek başlık",
          "placeName": "Mekanın sade, resmi adı (yoksa boş string)",
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