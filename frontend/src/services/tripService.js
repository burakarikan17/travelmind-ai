import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

const API_URL = import.meta.env.VITE_API_URL

export async function generateTripPlan(formData) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  if (!token) {
    throw new Error('Oturum bulunamadı, lütfen tekrar giriş yapın.')
  }

  const response = await axios.post(
    `${API_URL}/generate-plan`,
    formData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  return response.data
}

export async function getTripById(tripId) {
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (tripError) throw tripError

  const { data: days, error: daysError } = await supabase
    .from('trip_days')
    .select('*, trip_activities(*)')
    .eq('trip_id', tripId)
    .order('day_number', { ascending: true })

  if (daysError) throw daysError

  // Her günün aktivitelerini order_index'e göre sırala
  const sortedDays = days.map((day) => ({
    ...day,
    trip_activities: day.trip_activities.sort((a, b) => a.order_index - b.order_index),
  }))

  return { trip, days: sortedDays }
}