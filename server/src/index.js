import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import negotiationRoutes from './routes/negotiations.js'
import qualityRoutes from './routes/quality.js'
import buyerRoutes from './routes/buyers.js'
import adminRoutes from './routes/admin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/negotiations', negotiationRoutes)
app.use('/api/quality', qualityRoutes)
app.use('/api/buyers', buyerRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve built client (production single-service deployment)
const clientDist = path.join(__dirname, '../../client/dist')
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist))
  // SPA fallback for client-side routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next()
    }
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large (max 10MB)' })
  }
  if (err.message && err.name === 'Error') {
    console.error(err.stack)
    return res.status(400).json({ error: err.message })
  }
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
