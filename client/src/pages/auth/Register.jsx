import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import styles from './Auth.module.css'

function Register() {
  const { t } = useLanguage()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    city: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(formData)
      navigate('/buyer/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>{t('auth.register.title')}</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>{t('auth.register.companyName')}</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.field}>
            <label className={styles.label}>{t('auth.register.contactPerson')}</label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{t('auth.register.phone')}</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            
            <div className={styles.field}>
              <label className={styles.label}>{t('auth.register.email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>
          
          <div className={styles.field}>
            <label className={styles.label}>{t('auth.register.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
              minLength={6}
            />
          </div>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{t('auth.register.address')}</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            
            <div className={styles.field}>
              <label className={styles.label}>{t('auth.register.city')}</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? t('common.loading') : t('auth.register.submit')}
          </button>
        </form>
        
        <p className={styles.switchText}>
          {t('auth.register.hasAccount')}{' '}
          <Link to="/login" className={styles.switchLink}>
            {t('auth.register.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
