import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY .env dosyasında eksik.')
}

// Backend'de her zaman service_role key kullanılır — RLS'i bypass eder,
// bu yüzden bu client ASLA frontend'e gönderilmemelidir.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)