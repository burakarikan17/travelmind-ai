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