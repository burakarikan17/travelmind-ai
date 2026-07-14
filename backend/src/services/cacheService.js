import { supabaseAdmin } from './supabaseClient.js'
import crypto from 'crypto'

export function buildCacheKey({ destination, startDate, durationDays, budget, interests }) {
  const raw = `${destination.toLowerCase().trim()}|${startDate}|${durationDays}|${budget}|${[...interests].sort().join(',')}`
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export async function getCachedPlan(cacheKey) {
  const { data, error } = await supabaseAdmin
    .from('ai_response_cache')
    .select('response_data')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error) {
    console.error('Cache okuma hatası:', error.message)
    return null
  }

  return data?.response_data ?? null
}

export async function setCachedPlan(cacheKey, responseData) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün

  const { error } = await supabaseAdmin
    .from('ai_response_cache')
    .upsert({ cache_key: cacheKey, response_data: responseData, expires_at: expiresAt.toISOString() })

  if (error) {
    console.error('Cache yazma hatası:', error.message)
  }
}