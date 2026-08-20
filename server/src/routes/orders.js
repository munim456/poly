import express from 'express'
import { body, validationResult } from 'express-validator'
import db from '../config/database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// GET /api/orders (buyer sees own orders, staff sees all)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = db('orders')
      .join('products', 'orders.product_id', 'products.id')
      .select(
        'orders.*',
        'products.name as product_name',
        'products.category as product_category'
      )

    if (req.user.role === 'buyer') {
      query = query.where('orders.buyer_id', req.user.id)
    }

    const orders = await query.orderBy('orders.created_at', 'desc')
    res.json({ orders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// GET /api/orders/:id
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params

  try {
    let query = db('orders')
      .join('products', 'orders.product_id', 'products.id')
      .join('buyer_accounts', 'orders.buyer_id', 'buyer_accounts.id')
      .select(
        'orders.*',
        'products.name as product_name',
        'products.category as product_category',
        'products.images as product_images',
        'buyer_accounts.company_name',
        'buyer_accounts.contact_person',
        'buyer_accounts.phone'
      )
      .where('orders.id', id)

    if (req.user.role === 'buyer') {
      query = query.where('orders.buyer_id', req.user.id)
    }

    const order = await query.first()

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Get negotiation thread if exists
    const thread = await db('negotiation_threads')
      .where({ order_id: id })
      .first()

    let messages = []
    if (thread) {
      messages = await db('negotiation_messages')
        .where({ thread_id: thread.id })
        .orderBy('created_at', 'asc')
    }

    res.json({
      order: {
        ...order,
        product_images: JSON.parse(order.product_images || '[]'),
      },
      negotiation: thread ? { ...thread, messages } : null,
    })
  } catch (error) {
    console.error('Order fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// POST /api/orders (buyer creates order/RFQ)
router.post('/', authenticateToken, requireRole('buyer'), [
  body('product_id').isInt(),
  body('purchase_type').isIn(['regular', 'wholesale']),
  body('quantity').isInt({ min: 1 }),
  body('delivery_deadline').optional().isISO8601(),
  body('notes').optional().trim(),
  body('requested_price').optional().isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { product_id, purchase_type, quantity, delivery_deadline, notes, requested_price } = req.body

  try {
    // Verify product exists and is active
    const product = await db('products').where({ id: product_id, is_active: true }).first()
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check MOQ
    const moq = purchase_type === 'wholesale' ? product.wholesale_moq : product.regular_moq
    if (quantity < moq) {
      return res.status(400).json({ error: `Minimum quantity for ${purchase_type} is ${moq}` })
    }

    const status = requested_price ? 'negotiating' : 'quote_requested'

    const [order] = await db('orders').insert({
      buyer_id: req.user.id,
      product_id,
      purchase_type,
      quantity,
      status,
      requested_price: requested_price || null,
      current_offer_price: requested_price || null,
      delivery_deadline,
      notes,
    }).returning('*')

    // Create negotiation thread if bargaining
    if (requested_price && product.is_bargaining_allowed) {
      await db('negotiation_threads').insert({
        order_id: order.id,
        status: 'open',
      })
    }

    // TODO: Send email notification to admin

    res.status(201).json({ order })
  } catch (error) {
    console.error('Order create error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// PUT /api/orders/:id/status (staff updates status)
router.put('/:id/status', authenticateToken, requireRole('sales', 'owner'), [
  body('status').isIn(['confirmed', 'in_production', 'ready', 'dispatched', 'cancelled']),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { id } = req.params
  const { status } = req.body

  try {
    const [order] = await db('orders')
      .where({ id })
      .update({ status, updated_at: new Date() })
      .returning('*')

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // TODO: Send notification to buyer about status change

    res.json({ order })
  } catch (error) {
    console.error('Order status update error:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

export default router
