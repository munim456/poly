import jwt from 'jsonwebtoken'
import { jwtConfig } from '../config/auth.js'
import db from '../config/database.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret)
    
    // Get user from appropriate table based on role
    let user = null
    if (decoded.role === 'buyer') {
      user = await db('buyer_accounts').where({ id: decoded.id, is_active: true }).first()
    } else {
      user = await db('staff_accounts').where({ id: decoded.id, is_active: true }).first()
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    req.user = { ...user, role: decoded.role }
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}
