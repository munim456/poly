import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './Auth.module.css'

function ResetPassword() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const missingToken = !token

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError(t('auth.reset.mismatch'))
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.error || t('auth.reset.failed'))
    } finally {
      setLoading(false)
    }
  }

  if (missingToken) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>{t('auth.reset.title')}</h1>
          <p className={styles.helpText}>{t('auth.reset.missingToken')}</p>
          <Link to="/forgot-password" className={styles.backToLogin}>
            {t('auth.forgot.title')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>{t('auth.reset.title')}</h1>

        {done ? (
          <p className={styles.successText}>{t('auth.reset.done')}</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reset-password">{t('auth.reset.newPassword')}</label>
              <input
                type="password"
                id="reset-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                minLength="6"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reset-confirm">{t('auth.reset.confirmPassword')}</label>
              <input
                type="password"
                id="reset-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={styles.input}
                minLength="6"
                required
              />
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? t('common.loading') : t('auth.reset.update')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
