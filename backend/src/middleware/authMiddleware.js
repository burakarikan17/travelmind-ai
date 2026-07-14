import { supabaseAdmin } from '../services/supabaseClient.js'

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token bulunamadı.' })
  }

  const token = authHeader.replace('Bearer ', '')

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Geçersiz veya süresi dolmuş token.' })
  }

  // Doğrulanan kullanıcıyı sonraki middleware/route'lara aktar
  req.user = data.user
  next()
}