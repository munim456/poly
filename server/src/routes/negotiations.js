import express from 'express'
import { body, validationResult } from 'express-validator'
import db from '../config/database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { sendNegotiationMessageNotification } from '../utils/mailer.js'

const router = express.Router()

// GET /api/negotiations/:orderId
router.get('/:orderId', authenticateToken, async (req, res) => {
  const { orderId } = req.params

  try {
    const thread = await db('negotiation_threads')
      .where({ order_id: orderId })
      .first()

    if (!thread) {
      return res.status(404).json({ error: 'Negotiation thread not found' })
    }

    // Verify access
    const order = await db('orders').where({ id: orderId }).first()
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (req.user.role === 'buyer' && order.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const messages = await db('negotiation_messages')
      .where({ thread_id: thread.id })
      .orderBy('created_at', 'asc')

    res.json({
      thread: {
        ...thread,
        messages,
      },
    })
  } catch (error) {
    console.error('Negotiation fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch negotiation' })
  }
})

// POST /api/negotiations/:orderId/messages
router.post('/:orderId/messages', authenticateToken, [
  body('offered_price').isFloat({ min: 0 }),
  body('note').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { orderId } = req.params
  const { offered_price, note } = req.body

  try {
    const thread = await db('negotiation_threads')
      .where({ order_id: orderId })
      .first()

    if (!thread) {
      return res.status(404).json({ error: 'Negotiation thread not found' })
    }

    if (thread.status !== 'open') {
      return res.status(400).json({ error: 'Negotiation is no longer open' })
    }

    // Verify access
    const order = await db('orders').where({ id: orderId }).first()
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (req.user.role === 'buyer' && order.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Create message
    const [message] = await db('negotiation_messages').insert({
      thread_id: thread.id,
      sender_role: req.user.role,
      sender_id: req.user.id,
      offered_price,
      note,
    }).returning('*')

    // Update thread and order
    await db('negotiation_threads')
      .where({ id: thread.id })
      .update({ status: 'countered', updated_at: new Date() })

    await db('orders')
      .where({ id: orderId })
      .update({ 
        current_offer_price: offered_price,
        status: 'negotiating',
        updated_at: new Date() 
      })

    // Notify the other party (non-blocking): buyer offers → staff; staff counters → buyer
    const product = await db('products').where({ id: order.product_id }).first()
    const buyerAccount = await db('buyer_accounts').where({ id: order.buyer_id }).first()
    let recipientEmail = process.env.ADMIN_NOTIFY_EMAIL
    let senderLabel = `${buyerAccount?.company_name || 'Buyer'} (Buyer)`
    if (req.user.role !== 'buyer') {
      recipientEmail = buyerAccount?.email
      senderLabel = 'PolyConnect Sales Team'
    }
    if (product && recipientEmail) {
      sendNegotiationMessageNotification({
        order,
        product,
        message,
        senderLabel,
        recipientEmail,
      }).catch((err) => console.error('Negotiation notification failed:', err.message))
    }

    res.status(201).json({ message })
  } catch (error) {
    console.error('Message create error:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// POST /api/negotiations/:orderId/accept
router.post('/:orderId/accept', authenticateToken, async (req, res) => {
  const { orderId } = req.params

  try {
    const thread = await db('negotiation_threads')
      .where({ order_id: orderId })
      .first()

    if (!thread) {
      return res.status(404).json({ error: 'Negotiation thread not found' })
    }

    if (thread.status !== 'countered') {
      return res.status(400).json({ error: 'No counter offer to accept' })
    }

    // Get latest message for the final price
    const latestMessage = await db('negotiation_messages')
      .where({ thread_id: thread.id })
      .orderBy('created_at', 'desc')
      .first()

    // Update thread
    await db('negotiation_threads')
      .where({ id: thread.id })
      .update({ status: 'accepted', updated_at: new Date() })

    // Update order with final price and confirm
    await db('orders')
      .where({ id: orderId })
      .update({
        final_agreed_price: latestMessage.offered_price,
        status: 'confirmed',
        updated_at: new Date(),
      })

    res.json({ message: 'Negotiation accepted, order confirmed' })
  } catch (error) {
    console.error('Accept error:', error)
    res.status(500).json({ error: 'Failed to accept negotiation' })
  }
})

// POST /api/negotiations/:orderId/reject
router.post('/:orderId/reject', authenticateToken, requireRole('sales', 'owner'), async (req, res) => {
  const { orderId } = req.params

  try {
    const thread = await db('negotiation_threads')
      .where({ order_id: orderId })
      .first()

    if (!thread) {
      return res.status(404).json({ error: 'Negotiation thread not found' })
    }

    // Update thread
    await db('negotiation_threads')
      .where({ id: thread.id })
      .update({ status: 'rejected', updated_at: new Date() })

    // Update order - keep as quote_requested or move to cancelled
    await db('orders')
      .where({ id: orderId })
      .update({
        status: 'quote_requested',
        current_offer_price: null,
        updated_at: new Date(),
      })

    res.json({ message: 'Negotiation rejected' })
  } catch (error) {
    console.error('Reject error:', error)
    res.status(500).json({ error: 'Failed to reject negotiation' })
  }
})

export default router
