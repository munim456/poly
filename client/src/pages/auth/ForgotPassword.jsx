import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './Auth.module.css'

function ForgotPassword() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
    } catch {
      // Same response regardless — never leak whether the account exists
    } finally {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>{t('auth.forgot.title')}</h1>

        {sent ? (
          <div>
            <p className={styles.successText}>{t('auth.forgot.sentMessage')}</p>
            <Link to="/login" className={styles.backToLogin}>{t('auth.forgot.backToLogin')}</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <p className={styles.helpText}>{t('auth.forgot.helpText')}</p>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="forgot-email">{t('auth.login.email')}</label>
              <input
                type="email"
                id="forgot-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? t('common.loading') : t('auth.forgot.send')}
            </button>
            <Link to="/login" className={styles.backToLogin}>{t('auth.forgot.backToLogin')}</Link>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
