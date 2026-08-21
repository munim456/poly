import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { body, validationResult } from 'express-validator'
import db from '../config/database.js'
import { jwtConfig } from '../config/auth.js'
import { sendBuyerResetEmail } from '../utils/mailer.js'

const router = express.Router()

const RESET_TOKEN_MINUTES = 60

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

// POST /api/auth/forgot-password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email } = req.body

  try {
    const buyer = await db('buyer_accounts').where({ email }).first()

    // Always respond the same way — never reveal whether the email exists
    const genericResponse = {
      message: 'If that email is registered, a reset link has been sent.',
    }

    if (!buyer || !buyer.is_active) {
      return res.json(genericResponse)
    }

    // Invalidate any previous unused tokens for this buyer
    await db('password_reset_tokens')
      .where({ buyer_id: buyer.id })
      .whereNull('used_at')
      .update({ used_at: new Date() })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000)

    await db('password_reset_tokens').insert({
      buyer_id: buyer.id,
      token_hash: sha256(token),
      expires_at: expiresAt,
    })

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const resetUrl = `${clientUrl}/reset-password?token=${token}`

    const sent = await sendBuyerResetEmail({
      email,
      contactName: buyer.contact_person,
      resetUrl,
      expiryMinutes: RESET_TOKEN_MINUTES,
    })

    // Dev fallback so the flow is testable without SMTP credentials
    if (!sent) {
      console.warn(`[auth] SMTP not configured — password reset link for ${email}: ${resetUrl}`)
    }

    res.json(genericResponse)
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', [
  body('token').notEmpty().isLength({ min: 32 }),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid request. Password must be at least 6 characters.' })
  }

  const { token, password } = req.body
  const tokenHash = sha256(token)

  try {
    const record = await db('password_reset_tokens')
      .where({ token_hash: tokenHash })
      .whereNull('used_at')
      .where('expires_at', '>', new Date())
      .first()

    if (!record) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' })
    }

    const buyer = await db('buyer_accounts').where({ id: record.buyer_id }).first()
    if (!buyer || !buyer.is_active) {
      return res.status(400).json({ error: 'This account is no longer active.' })
    }

    const password_hash = await bcrypt.hash(password, 10)

    await db('buyer_accounts')
      .where({ id: buyer.id })
      .update({ password_hash, updated_at: new Date() })

    // Single use — burn the token and any other pending ones
    await db('password_reset_tokens')
      .where({ buyer_id: buyer.id })
      .whereNull('used_at')
      .update({ used_at: new Date() })

    res.json({ message: 'Password updated. You can now log in with your new password.' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body

  try {
    // Check buyer accounts first
    let user = await db('buyer_accounts').where({ email }).first()
    let role = 'buyer'

    // If not found, check staff accounts
    if (!user) {
      user = await db('staff_accounts').where({ email }).first()
      if (user) {
        role = user.role
      }
    }

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    )

    // Don't send password hash
    const { password_hash, ...userWithoutPassword } = user

    res.json({
      token,
      user: { ...userWithoutPassword, role },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// POST /api/auth/register (buyer registration)
router.post('/register', [
  body('company_name').notEmpty().trim(),
  body('contact_person').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('address').optional().trim(),
  body('city').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { company_name, contact_person, phone, email, password, address, city } = req.body

  try {
    // Check if email already exists
    const existingBuyer = await db('buyer_accounts').where({ email }).first()
    if (existingBuyer) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const [buyer] = await db('buyer_accounts').insert({
      company_name,
      contact_person,
      phone,
      email,
      password_hash,
      address,
      city,
      country: 'Bangladesh',
      buyer_type: 'regular',
      verification_status: 'unverified',
      is_active: true,
    }).returning('*')

    const token = jwt.sign(
      { id: buyer.id, email: buyer.email, role: 'buyer' },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    )

    const { password_hash: _, ...buyerWithoutPassword } = buyer

    res.status(201).json({
      token,
      user: { ...buyerWithoutPassword, role: 'buyer' },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// GET /api/auth/me (get current user)
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret)
    
    let user = null
    if (decoded.role === 'buyer') {
      user = await db('buyer_accounts').where({ id: decoded.id }).first()
    } else {
      user = await db('staff_accounts').where({ id: decoded.id }).first()
    }

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found' })
    }

    const { password_hash, ...userWithoutPassword } = user
    res.json({ user: { ...userWithoutPassword, role: decoded.role } })
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' })
  }
})

export default router
