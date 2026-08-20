import express from 'express'
import { body, validationResult } from 'express-validator'
import db from '../config/database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// GET /api/buyers (admin only)
router.get('/', authenticateToken, requireRole('owner'), async (req, res) => {
  try {
    const buyers = await db('buyer_accounts')
      .select('id', 'company_name', 'contact_person', 'phone', 'email', 
              'buyer_type', 'verification_status', 'is_active', 'created_at')
      .orderBy('created_at', 'desc')

    res.json({ buyers })
  } catch (error) {
    console.error('Buyers fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch buyers' })
  }
})

// GET /api/buyers/profile (buyer gets own profile)
router.get('/profile', authenticateToken, requireRole('buyer'), async (req, res) => {
  try {
    const buyer = await db('buyer_accounts')
      .where({ id: req.user.id })
      .select('id', 'company_name', 'contact_person', 'phone', 'email',
              'address', 'city', 'country', 'buyer_type', 'verification_status')
      .first()

    res.json({ buyer })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// PUT /api/buyers/profile (buyer updates own profile)
router.put('/profile', authenticateToken, requireRole('buyer'), [
  body('company_name').optional().trim(),
  body('contact_person').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const [buyer] = await db('buyer_accounts')
      .where({ id: req.user.id })
      .update({
        ...req.body,
        updated_at: new Date(),
      })
      .returning('*')

    const { password_hash, ...buyerWithoutPassword } = buyer
    res.json({ buyer: buyerWithoutPassword })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// PUT /api/buyers/:id/verify (admin only)
router.put('/:id/verify', authenticateToken, requireRole('owner'), [
  body('verification_status').isIn(['unverified', 'pending', 'verified']),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { id } = req.params
  const { verification_status } = req.body

  try {
    const [buyer] = await db('buyer_accounts')
      .where({ id })
      .update({
        verification_status,
        updated_at: new Date(),
      })
      .returning('*')

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' })
    }

    res.json({ buyer })
  } catch (error) {
    console.error('Buyer verify error:', error)
    res.status(500).json({ error: 'Failed to verify buyer' })
  }
})

// PUT /api/buyers/:id/status (admin only - activate/deactivate)
router.put('/:id/status', authenticateToken, requireRole('owner'), [
  body('is_active').isBoolean(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { id } = req.params
  const { is_active } = req.body

  try {
    const [buyer] = await db('buyer_accounts')
      .where({ id })
      .update({
        is_active,
        updated_at: new Date(),
      })
      .returning('*')

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' })
    }

    res.json({ buyer })
  } catch (error) {
    console.error('Buyer status error:', error)
    res.status(500).json({ error: 'Failed to update buyer status' })
  }
})

export default router
