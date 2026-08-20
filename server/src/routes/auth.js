import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import db from '../config/database.js'
import { jwtConfig } from '../config/auth.js'

const router = express.Router()

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
