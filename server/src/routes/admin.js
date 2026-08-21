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

// GET /api/admin/analytics (owner analytics)
router.get('/analytics', async (req, res) => {
  try {
    const revenueStatuses = ['confirmed', 'in_production', 'ready', 'dispatched']

    const [
      revenueRow,
      statusBreakdown,
      topProducts,
      monthlyTrend,
      buyerStats,
    ] = await Promise.all([
      db('orders')
        .whereIn('status', revenueStatuses)
        .whereNotNull('final_agreed_price')
        .sum({ revenue: db.raw('final_agreed_price * quantity') })
        .avg({ avg_order_value: db.raw('final_agreed_price * quantity') })
        .count('id as count')
        .first(),
      db('orders').select('status').count('id as count').groupBy('status'),
      db('orders as o')
        .join('products as p', 'o.product_id', 'p.id')
        .select('p.name as product_name', 'p.category')
        .count('o.id as order_count')
        .sum('o.quantity as total_quantity')
        .groupBy('p.id', 'p.name', 'p.category')
        .orderBy('order_count', 'desc')
        .limit(5),
      db('orders')
        .select(db.raw("to_char(date_trunc('month', created_at), 'YYYY-MM') as month"))
        .count('id as order_count')
        .sum({
          revenue: db.raw(
            "CASE WHEN status IN ('confirmed', 'in_production', 'ready', 'dispatched') AND final_agreed_price IS NOT NULL THEN final_agreed_price * quantity ELSE 0 END"
          ),
        })
        .whereRaw("created_at >= date_trunc('month', now()) - interval '5 months'")
        .groupBy(db.raw("date_trunc('month', created_at)"))
        .orderBy(db.raw("date_trunc('month', created_at)")),
      db('buyer_accounts')
        .count('id as total_buyers')
        .count({
          verified: db.raw("CASE WHEN verification_status = 'verified' THEN 1 END"),
        })
        .first(),
    ])

    const totalOrders = statusBreakdown.reduce((sum, s) => sum + parseInt(s.count), 0)
    const confirmedOrders = statusBreakdown
      .filter((s) => revenueStatuses.includes(s.status))
      .reduce((sum, s) => sum + parseInt(s.count), 0)

    res.json({
      analytics: {
        kpis: {
          totalRevenue: parseFloat(revenueRow.revenue) || 0,
          avgOrderValue: Math.round(parseFloat(revenueRow.avg_order_value)) || 0,
          confirmedOrders,
          conversionRate: totalOrders ? Math.round((confirmedOrders / totalOrders) * 100) : 0,
          totalBuyers: parseInt(buyerStats.total_buyers),
          verifiedBuyers: parseInt(buyerStats.verified),
        },
        statusBreakdown: statusBreakdown.map((s) => ({
          status: s.status,
          count: parseInt(s.count),
        })),
        topProducts: topProducts.map((p) => ({
          productName: p.product_name,
          category: p.category,
          orderCount: parseInt(p.order_count),
          totalQuantity: parseInt(p.total_quantity) || 0,
        })),
        monthlyTrend: monthlyTrend.map((m) => ({
          month: m.month,
          orderCount: parseInt(m.order_count),
          revenue: parseFloat(m.revenue) || 0,
        })),
      },
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

export default router
