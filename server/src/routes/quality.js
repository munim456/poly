import express from 'express'
import { body, validationResult } from 'express-validator'
import db from '../config/database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { parseMaybeJson } from '../utils/parse.js'

const router = express.Router()

// GET /api/quality/product/:productId (public - approved batches only)
router.get('/product/:productId', async (req, res) => {
  const { productId } = req.params

  try {
    const batches = await db('quality_batches')
      .where({ 
        product_id: productId, 
        approval_status: 'approved', 
        visible_to_public: true 
      })
      .join('staff_accounts', 'quality_batches.tested_by', 'staff_accounts.id')
      .select(
        'quality_batches.*',
        'staff_accounts.name as tested_by_name'
      )
      .orderBy('batch_date', 'desc')
      .limit(10)

    const parsedBatches = batches.map(b => ({
      ...b,
      measured_values: parseMaybeJson(b.measured_values, {}),
    }))

    res.json({ batches: parsedBatches })
  } catch (error) {
    console.error('Quality batches fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch quality batches' })
  }
})

// GET /api/quality/pending (admin only)
router.get('/pending', authenticateToken, requireRole('owner'), async (req, res) => {
  try {
    const batches = await db('quality_batches')
      .where({ approval_status: 'pending' })
      .join('products', 'quality_batches.product_id', 'products.id')
      .join('staff_accounts', 'quality_batches.tested_by', 'staff_accounts.id')
      .select(
        'quality_batches.*',
        'products.name as product_name',
        'staff_accounts.name as tested_by_name'
      )
      .orderBy('quality_batches.created_at', 'desc')

    const parsedBatches = batches.map(b => ({
      ...b,
      measured_values: parseMaybeJson(b.measured_values, {}),
    }))

    res.json({ batches: parsedBatches })
  } catch (error) {
    console.error('Pending batches fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch pending batches' })
  }
})

// POST /api/quality (quality staff creates batch)
router.post('/', authenticateToken, requireRole('quality', 'owner'),
  upload.single('certification_file'),
  [
    body('product_id').isInt(),
    body('batch_date').isISO8601(),
    body('measured_values').custom((value) => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      } catch {
        return false
      }
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { product_id, batch_date, measured_values: rawMeasured } = req.body
    const measured_values = typeof rawMeasured === 'string' ? JSON.parse(rawMeasured) : rawMeasured
    const certification_file_url = req.file ? `/uploads/${req.file.filename}` : null

  try {
    const [batch] = await db('quality_batches').insert({
      product_id,
      batch_date,
      tested_by: req.user.id,
      measured_values: JSON.stringify(measured_values),
      certification_file_url,
      approval_status: 'pending',
      visible_to_public: false,
    }).returning('*')

    // TODO: Send notification to admin for approval

    res.status(201).json({ batch })
  } catch (error) {
    console.error('Quality batch create error:', error)
    res.status(500).json({ error: 'Failed to create quality batch' })
  }
})

// PUT /api/quality/:id/approve (admin only)
router.put('/:id/approve', authenticateToken, requireRole('owner'), async (req, res) => {
  const { id } = req.params

  try {
    const [batch] = await db('quality_batches')
      .where({ id, approval_status: 'pending' })
      .update({
        approval_status: 'approved',
        visible_to_public: true,
        updated_at: new Date(),
      })
      .returning('*')

    if (!batch) {
      return res.status(404).json({ error: 'Pending batch not found' })
    }

    res.json({ batch })
  } catch (error) {
    console.error('Quality batch approve error:', error)
    res.status(500).json({ error: 'Failed to approve quality batch' })
  }
})

// PUT /api/quality/:id/reject (admin only)
router.put('/:id/reject', authenticateToken, requireRole('owner'), [
  body('reason').optional().trim(),
], async (req, res) => {
  const { id } = req.params
  const { reason } = req.body

  try {
    const [batch] = await db('quality_batches')
      .where({ id, approval_status: 'pending' })
      .update({
        approval_status: 'rejected',
        updated_at: new Date(),
      })
      .returning('*')

    if (!batch) {
      return res.status(404).json({ error: 'Pending batch not found' })
    }

    // TODO: Send notification to quality staff with reason

    res.json({ batch, reason })
  } catch (error) {
    console.error('Quality batch reject error:', error)
    res.status(500).json({ error: 'Failed to reject quality batch' })
  }
})

export default router
