import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import styles from './Auth.module.css'

function Login() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
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
      const user = await login(formData.email, formData.password)
      // Redirect based on role
      switch (user.role) {
        case 'owner':
          navigate('/admin/dashboard')
          break
        case 'sales':
          navigate('/sales/dashboard')
          break
        case 'quality':
          navigate('/quality/dashboard')
          break
        default:
          navigate('/buyer/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>{t('auth.login.title')}</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">{t('auth.login.email')}</label>
            <input
              type="email"
              id="login-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-password">{t('auth.login.password')}</label>
            <input
              type="password"
              id="login-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? t('common.loading') : t('auth.login.submit')}
          </button>
          <Link to="/forgot-password" className={styles.switchLink}>
            {t('auth.forgot.title')}
          </Link>
        </form>
        
        <p className={styles.switchText}>
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className={styles.switchLink}>
            {t('auth.login.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
