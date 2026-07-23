import { supabase } from '../lib/supabaseClient'

export async function addFavoriteTrip(userId, tripId) {
  const { data, error } = await supabase
    .from('favorite_trips')
    .insert({ user_id: userId, trip_id: tripId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFavoriteTrip(userId, tripId) {
  const { error } = await supabase
    .from('favorite_trips')
    .delete()
    .eq('user_id', userId)
    .eq('trip_id', tripId)

  if (error) throw error
}

export async function isTripFavorited(userId, tripId) {
  const { data, error } = await supabase
    .from('favorite_trips')
    .select('id')
    .eq('user_id', userId)
    .eq('trip_id', tripId)
    .maybeSingle()

  if (error) throw error
  return !!data
}

export async function getFavoriteTrips(userId) {
  const { data, error } = await supabase
    .from('favorite_trips')
    .select('id, created_at, trips(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}