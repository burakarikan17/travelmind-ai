import dotenv from 'dotenv'
dotenv.config()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`

function buildPrompt({ destination, startDate, durationDays, budget, currency, peopleCount, interests }) {
  return `Sen bir seyahat planlama asistanısın. Aşağıdaki bilgilere göre detaylı, gerçekçi bir seyahat planı oluştur.

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

BEKLENEN JSON ŞEMASI:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "summary": "Günün kısa özeti",
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

Şimdi yukarıdaki kurallara uyarak ${durationDays} günlük planı oluştur.`
}

function cleanGeminiResponse(rawText) {
  return rawText.replace(/```json|```/g, '').trim()
}

export async function generateTripPlan(formData) {
  const prompt = buildPrompt(formData)

  const response = await fetch(GEMINI_URL, {
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