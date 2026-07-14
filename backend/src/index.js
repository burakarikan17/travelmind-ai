import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { generalLimiter } from './middleware/rateLimitMiddleware.js'
import tripRoutes from './routes/tripRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use(generalLimiter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', tripRoutes)

app.listen(PORT, () => {
  console.log(`Backend ${PORT} portunda çalışıyor.`)
})  