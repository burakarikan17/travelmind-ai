import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { generatePlanLimiter } from "../middleware/rateLimitMiddleware.js";
import { tripFormSchema } from "../validation/tripSchema.js";
import { generateTripPlan } from "../services/geminiService.js";
import { verifyPlanPlaces } from "../services/nominatimService.js";
import {
  buildCacheKey,
  getCachedPlan,
  setCachedPlan,
} from "../services/cacheService.js";
import { supabaseAdmin } from "../services/supabaseClient.js";

const router = express.Router();

router.post('/generate-plan', requireAuth, generatePlanLimiter, async (req, res) => {
  const parseResult = tripFormSchema.safeParse(req.body)

  if (!parseResult.success) {
    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'Form verisi geçersiz.',
      details: parseResult.error.flatten(),
    })
  }

  const formData = parseResult.data
  const cacheKey = buildCacheKey(formData)

  try {
    let verifiedPlan
    let cacheHit = false

    // 1. Cache kontrolü — sadece PLAN İÇERİĞİNİ hızlandırır
    const cached = await getCachedPlan(cacheKey)
    if (cached) {
      verifiedPlan = cached
      cacheHit = true
    } else {
      // 2. Gemini'den plan üret
      const planData = await generateTripPlan(formData)
      // 3. Yer doğrulama (Nominatim)
      verifiedPlan = await verifyPlanPlaces(planData, formData.destination)
      // 5. Cache'e yaz (sadece yeni üretildiyse)
      await setCachedPlan(cacheKey, verifiedPlan)
    }

    // 4. Supabase'e kaydet — cache'den gelse bile HER ZAMAN yeni bir trip kaydı oluştur
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .insert({
        user_id: req.user.id,
        destination: formData.destination,
        start_date: formData.startDate,
        duration_days: formData.durationDays,
        budget: formData.budget,
        currency: formData.currency,
        people_count: formData.peopleCount,
        interests: formData.interests,
        destination_currency: verifiedPlan.destinationCurrency || null,
        ai_raw_response: verifiedPlan,
        status: 'completed',
      })
      .select()
      .single()

    if (tripError) throw tripError

    for (const day of verifiedPlan.days) {
      const { data: tripDay, error: dayError } = await supabaseAdmin
        .from('trip_days')
        .insert({
          trip_id: trip.id,
          day_number: day.dayNumber,
          date: day.date,
          summary: day.summary,
        })
        .select()
        .single()

      if (dayError) throw dayError

      const activitiesToInsert = day.activities.map((act, index) => ({
        trip_day_id: tripDay.id,
        time_slot: act.timeSlot,
        title: act.title,
        description: act.description,
        category: act.category,
        latitude: act.latitude,
        longitude: act.longitude,
        estimated_cost: act.estimatedCost,
        is_place_verified: act.isPlaceVerified,
        order_index: index,
      }))

      const { error: activitiesError } = await supabaseAdmin
        .from('trip_activities')
        .insert(activitiesToInsert)

      if (activitiesError) throw activitiesError
    }

    return res.json({ tripId: trip.id, cached: cacheHit, ...verifiedPlan })
  } catch (err) {
    console.error('Plan oluşturma hatası:', err.message)

    if (err.message === 'GEMINI_API_ERROR' || err.message === 'GEMINI_EMPTY_RESPONSE') {
      return res.status(502).json({ error: 'GEMINI_API_ERROR', message: 'Yapay zeka servisine ulaşılamadı.' })
    }
    if (err.message === 'AI_RESPONSE_PARSE_ERROR') {
      return res.status(502).json({ error: 'AI_RESPONSE_PARSE_ERROR', message: 'Plan oluşturulamadı, lütfen tekrar deneyin.' })
    }

    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Beklenmeyen bir hata oluştu.' })
  }
})

export default router;
