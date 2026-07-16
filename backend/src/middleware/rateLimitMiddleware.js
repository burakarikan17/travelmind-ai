import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

// Kullanıcı başına saatte 10 istek (generate-plan endpoint'i için)
export const generatePlanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Saatlik istek limitine ulaştınız. Lütfen daha sonra tekrar deneyin.',
    })
  },
})

// Genel IP bazlı koruma (tüm endpoint'ler için)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100,
})