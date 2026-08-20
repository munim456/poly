import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './QualityDashboard.module.css'

function QualityDashboard() {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    product_id: '',
    batch_date: new Date().toISOString().split('T')[0],
    measured_values: {
      gsm: '',
      thickness: '',
      tensile_strength: '',
    },
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

  const handleSpecChange = (key, value) => {
    setFormData({
      ...formData,
      measured_values: {
        ...formData.measured_values,
        [key]: value,
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await api.post('/quality', {
        product_id: parseInt(formData.product_id),
        batch_date: formData.batch_date,
        measured_values: formData.measured_values,
      })
      // Reset form
      setFormData({
        product_id: '',
        batch_date: new Date().toISOString().split('T')[0],
        measured_values: {
          gsm: '',
          thickness: '',
          tensile_strength: '',
        },
      })
      alert('Quality batch submitted for approval')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quality batch')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.dashboard}>
      <div className="container">
        <h1 className={styles.title}>{t('admin.quality')}</h1>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Log New Quality Batch</h2>
          
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
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Date */}
            <div className={styles.field}>
              <label className={styles.label}>Batch Date *</label>
              <input
                type="date"
                name="batch_date"
                value={formData.batch_date}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            {/* Measured Values */}
            <div className={styles.field}>
              <label className={styles.label}>Measured Values *</label>
              <div className={styles.specsGrid}>
                <div className={styles.specField}>
                  <label>GSM</label>
                  <input
                    type="text"
                    value={formData.measured_values.gsm}
                    onChange={(e) => handleSpecChange('gsm', e.target.value)}
                    placeholder="e.g., 80"
                  />
                </div>
                <div className={styles.specField}>
                  <label>Thickness (micron)</label>
                  <input
                    type="text"
                    value={formData.measured_values.thickness}
                    onChange={(e) => handleSpecChange('thickness', e.target.value)}
                    placeholder="e.g., 25"
                  />
                </div>
                <div className={styles.specField}>
                  <label>Tensile Strength (MPa)</label>
                  <input
                    type="text"
                    value={formData.measured_values.tensile_strength}
                    onChange={(e) => handleSpecChange('tensile_strength', e.target.value)}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>
            </div>

            {/* Certification File */}
            <div className={styles.field}>
              <label className={styles.label}>Certification File (optional)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className={styles.fileInput}
              />
              <span className={styles.hint}>Upload test report or certification document</span>
            </div>

            {/* Submit */}
            <div className={styles.actions}>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? t('common.loading') : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>

        <div className={styles.infoCard}>
          <h3>How it works</h3>
          <ol>
            <li>Enter the batch details and measured values</li>
            <li>Submit for admin approval</li>
            <li>Once approved, data becomes visible on the product page</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default QualityDashboard
