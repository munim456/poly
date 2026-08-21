import express from 'express'
import { body, query, validationResult } from 'express-validator'
import db from '../config/database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { parseMaybeJson } from '../utils/parse.js'

const router = express.Router()

// GET /api/products (public catalog)
router.get('/', [
  query('category').optional().isIn(['hdpe_bags', 'bopp_film', 'yarn', 'ldpe_film']),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { category, search, page = 1, limit = 12 } = req.query
  const offset = (page - 1) * limit

  try {
    let query = db('products').where('is_active', true)

    if (category) {
      query = query.where('category', category)
    }

    if (search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`)
      })
    }

    const [countResult] = await query.clone().count('id as count')
    const total = parseInt(countResult.count)

    const products = await query
      .select('id', 'name', 'name_bn', 'category', 'images', 'base_specs', 
              'regular_price', 'regular_moq', 'is_bargaining_allowed')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)

    // Parse JSON fields
    const parsedProducts = products.map(p => ({
      ...p,
      images: parseMaybeJson(p.images, []),
      base_specs: parseMaybeJson(p.base_specs, {}),
    }))

    res.json({
      products: parsedProducts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Products fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /api/products/:id (public product detail)
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const product = await db('products')
      .where({ id, is_active: true })
      .first()

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Get latest approved quality batch
    const latestQualityBatch = await db('quality_batches')
      .where({ 
        product_id: id, 
        approval_status: 'approved', 
        visible_to_public: true 
      })
      .orderBy('batch_date', 'desc')
      .first()

    const parsedProduct = {
      ...product,
      images: parseMaybeJson(product.images, []),
      base_specs: parseMaybeJson(product.base_specs, {}),
      wholesale_price_tiers: parseMaybeJson(product.wholesale_price_tiers, []),
      quality_batch: latestQualityBatch ? {
        ...latestQualityBatch,
        measured_values: parseMaybeJson(latestQualityBatch.measured_values, {}),
      } : null,
    }

    res.json({ product: parsedProduct })
  } catch (error) {
    console.error('Product fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST /api/products (admin only)
router.post('/', authenticateToken, requireRole('owner'), [
  body('name').notEmpty().trim(),
  body('category').isIn(['hdpe_bags', 'bopp_film', 'yarn', 'ldpe_film']),
  body('regular_price').isNumeric(),
  body('regular_moq').isInt({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const [product] = await db('products').insert({
      ...req.body,
      images: JSON.stringify(req.body.images || []),
      base_specs: JSON.stringify(req.body.base_specs || {}),
      wholesale_price_tiers: JSON.stringify(req.body.wholesale_price_tiers || []),
      is_active: true,
    }).returning('*')

    res.status(201).json({ product })
  } catch (error) {
    console.error('Product create error:', error)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// PUT /api/products/:id (admin only)
router.put('/:id', authenticateToken, requireRole('owner'), async (req, res) => {
  const { id } = req.params

  try {
    const updates = { ...req.body }
    if (updates.images) updates.images = JSON.stringify(updates.images)
    if (updates.base_specs) updates.base_specs = JSON.stringify(updates.base_specs)
    if (updates.wholesale_price_tiers) {
      updates.wholesale_price_tiers = JSON.stringify(updates.wholesale_price_tiers)
    }
    updates.updated_at = new Date()

    const [product] = await db('products')
      .where({ id })
      .update(updates)
      .returning('*')

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ product })
  } catch (error) {
    console.error('Product update error:', error)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE /api/products/:id (admin only - soft delete)
router.delete('/:id', authenticateToken, requireRole('owner'), async (req, res) => {
  const { id } = req.params

  try {
    const [product] = await db('products')
      .where({ id })
      .update({ is_active: false, updated_at: new Date() })
      .returning('*')

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ message: 'Product deactivated successfully' })
  } catch (error) {
    console.error('Product delete error:', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router
