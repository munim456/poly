import express from 'express'
import db from '../config/database.js'

const router = express.Router()

// GET /api/uploads/:id — public, serves image bytes from the database
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid image id' })
    }

    const row = await db('uploads')
      .select('mime_type', 'data')
      .where({ id })
      .first()

    if (!row) {
      return res.status(404).json({ error: 'Image not found' })
    }

    res.set({
      'Content-Type': row.mime_type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    })
    res.end(Buffer.from(row.data))
  } catch (error) {
    console.error('Upload fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch image' })
  }
})

export default router
