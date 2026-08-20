import express from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import db from '../config/database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// All admin routes require owner role
router.use(authenticateToken, requireRole('owner'))

// GET /api/admin/dashboard (stats)
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      pendingOrders,
      totalOrders,
      pendingQualityBatches,
      totalBuyers,
    ] = await Promise.all([
      db('products').count('id as count').first(),
      db('products').where('is_active', true).count('id as count').first(),
      db('orders').where('status', 'quote_requested').count('id as count').first(),
      db('orders').count('id as count').first(),
      db('quality_batches').where('approval_status', 'pending').count('id as count').first(),
      db('buyer_accounts').where('is_active', true).count('id as count').first(),
    ])

    res.json({
      stats: {
        totalProducts: parseInt(totalProducts.count),
        activeProducts: parseInt(activeProducts.count),
        pendingOrders: parseInt(pendingOrders.count),
        totalOrders: parseInt(totalOrders.count),
        pendingQualityBatches: parseInt(pendingQualityBatches.count),
        totalBuyers: parseInt(totalBuyers.count),
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

// GET /api/admin/staff
router.get('/staff', async (req, res) => {
  try {
    const staff = await db('staff_accounts')
      .select('id', 'name', 'email', 'role', 'is_active', 'created_at')
      .orderBy('created_at', 'desc')

    res.json({ staff })
  } catch (error) {
    console.error('Staff fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch staff' })
  }
})

// POST /api/admin/staff
router.post('/staff', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['sales', 'quality', 'owner']),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { name, email, password, role } = req.body

  try {
    const existingStaff = await db('staff_accounts').where({ email }).first()
    if (existingStaff) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const [staff] = await db('staff_accounts').insert({
      name,
      email,
      password_hash,
      role,
      is_active: true,
    }).returning('*')

    const { password_hash: _, ...staffWithoutPassword } = staff
    res.status(201).json({ staff: staffWithoutPassword })
  } catch (error) {
    console.error('Staff create error:', error)
    res.status(500).json({ error: 'Failed to create staff' })
  }
})

// PUT /api/admin/staff/:id
router.put('/staff/:id', [
  body('name').optional().trim(),
  body('role').optional().isIn(['sales', 'quality', 'owner']),
  body('is_active').optional().isBoolean(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { id } = req.params

  try {
    const [staff] = await db('staff_accounts')
      .where({ id })
      .update({
        ...req.body,
        updated_at: new Date(),
      })
      .returning('*')

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' })
    }

    const { password_hash, ...staffWithoutPassword } = staff
    res.json({ staff: staffWithoutPassword })
  } catch (error) {
    console.error('Staff update error:', error)
    res.status(500).json({ error: 'Failed to update staff' })
  }
})

// GET /api/admin/orders (all orders with details)
router.get('/orders', async (req, res) => {
  try {
    const orders = await db('orders')
      .join('products', 'orders.product_id', 'products.id')
      .join('buyer_accounts', 'orders.buyer_id', 'buyer_accounts.id')
      .select(
        'orders.*',
        'products.name as product_name',
        'buyer_accounts.company_name'
      )
      .orderBy('orders.created_at', 'desc')

    res.json({ orders })
  } catch (error) {
    console.error('Admin orders fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

export default router
