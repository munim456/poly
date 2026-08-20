import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './RFQForm.module.css'

function RFQForm() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    product_id: searchParams.get('product') || '',
    purchase_type: 'regular',
    quantity: '',
    delivery_deadline: '',
    notes: '',
    requested_price: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await api.post('/orders', {
        ...formData,
        quantity: parseInt(formData.quantity),
        requested_price: formData.requested_price ? parseFloat(formData.requested_price) : undefined,
        delivery_deadline: formData.delivery_deadline || undefined,
      })
      navigate('/buyer/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit order')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedProduct = products.find(p => p.id === parseInt(formData.product_id))

  return (
    <div className={styles.rfqPage}>
      <div className="container">
        <h1 className={styles.title}>{t('order.title')}</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Product Selection */}
          <div className={styles.field}>
            <label className={styles.label}>Product *</label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (MOQ: {product.regular_moq} kg)
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Type */}
          <div className={styles.field}>
            <label className={styles.label}>{t('order.purchaseType')} *</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="purchase_type"
                  value="regular"
                  checked={formData.purchase_type === 'regular'}
                  onChange={handleChange}
                />
                <span>{t('product.regular')}</span>
                {selectedProduct && (
                  <span className={styles.radioPrice}>৳{selectedProduct.regular_price}/kg</span>
                )}
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="purchase_type"
                  value="wholesale"
                  checked={formData.purchase_type === 'wholesale'}
                  onChange={handleChange}
                />
                <span>{t('product.wholesale')}</span>
                {selectedProduct && selectedProduct.wholesale_price_tiers?.[0] && (
                  <span className={styles.radioPrice}>From ৳{selectedProduct.wholesale_price_tiers[0].price}/kg</span>
                )}
              </label>
            </div>
          </div>

          {/* Quantity */}
          <div className={styles.field}>
            <label className={styles.label}>{t('order.quantity')} (kg) *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={styles.input}
              min={selectedProduct ? (formData.purchase_type === 'wholesale' ? selectedProduct.wholesale_moq : selectedProduct.regular_moq) : 1}
              required
            />
            {selectedProduct && (
              <span className={styles.hint}>
                MOQ: {formData.purchase_type === 'wholesale' ? selectedProduct.wholesale_moq : selectedProduct.regular_moq} kg
              </span>
            )}
          </div>

          {/* Delivery Date */}
          <div className={styles.field}>
            <label className={styles.label}>{t('order.deliveryDate')}</label>
            <input
              type="date"
              name="delivery_deadline"
              value={formData.delivery_deadline}
              onChange={handleChange}
              className={styles.input}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Price Proposal */}
          <div className={styles.field}>
            <label className={styles.label}>{t('order.proposePrice')}</label>
            <div className={styles.priceInputWrapper}>
              <span className={styles.currency}>৳</span>
              <input
                type="number"
                name="requested_price"
                value={formData.requested_price}
                onChange={handleChange}
                className={styles.priceInput}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              <span className={styles.unit}>/kg</span>
            </div>
            <span className={styles.hint}>{t('order.priceNote')}</span>
          </div>

          {/* Notes */}
          <div className={styles.field}>
            <label className={styles.label}>{t('order.notes')}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className={styles.textarea}
              rows={4}
              placeholder="Any special requirements or notes..."
            />
          </div>

          {/* Submit */}
          <div className={styles.actions}>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className={styles.cancelBtn}
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? t('common.loading') : t('order.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RFQForm
