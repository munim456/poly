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
      alert(t('qd.submittedMsg'))
    } catch (err) {
      setError(err.response?.data?.error || t('qd.failedMsg'))
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
          <h2 className={styles.formTitle}>{t('qd.logBatch')}</h2>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Product Selection */}
            <div className={styles.field}>
              <label className={styles.label}>{t('form.product')}</label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">{t('form.selectProduct')}</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Date */}
            <div className={styles.field}>
              <label className={styles.label}>{t('qd.batchDate')}</label>
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
              <label className={styles.label}>{t('qd.measuredValues')}</label>
              <div className={styles.specsGrid}>
                <div className={styles.specField}>
                  <label>{t('qd.gsm')}</label>
                  <input
                    type="text"
                    value={formData.measured_values.gsm}
                    onChange={(e) => handleSpecChange('gsm', e.target.value)}
                    placeholder="e.g., 80"
                  />
                </div>
                <div className={styles.specField}>
                  <label>{t('qd.thickness')}</label>
                  <input
                    type="text"
                    value={formData.measured_values.thickness}
                    onChange={(e) => handleSpecChange('thickness', e.target.value)}
                    placeholder="e.g., 25"
                  />
                </div>
                <div className={styles.specField}>
                  <label>{t('qd.tensile')}</label>
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
              <label className={styles.label}>{t('qd.certFile')}</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className={styles.fileInput}
              />
              <span className={styles.hint}>{t('qd.uploadHint')}</span>
            </div>

            {/* Submit */}
            <div className={styles.actions}>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? t('common.loading') : t('qd.submitForApproval')}
              </button>
            </div>
          </form>
        </div>

        <div className={styles.infoCard}>
          <h3>{t('qd.howItWorks')}</h3>
          <ol>
            <li>{t('qd.step1')}</li>
            <li>{t('qd.step2')}</li>
            <li>{t('qd.step3')}</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default QualityDashboard
