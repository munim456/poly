import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './BuyerProfile.module.css'

function BuyerProfile() {
  const { t } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/buyers/profile')
      setProfile(res.data.buyer)
      setForm({
        company_name: res.data.buyer.company_name || '',
        contact_person: res.data.buyer.contact_person || '',
        phone: res.data.buyer.phone || '',
        address: res.data.buyer.address || '',
        city: res.data.buyer.city || '',
      })
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await api.put('/buyers/profile', form)
      setProfile(res.data.buyer)
      setMessage({ type: 'success', text: t('profile.updateSuccess') })
    } catch (err) {
      setMessage({ type: 'error', text: t('profile.updateError') })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p className={styles.loading}>{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>{t('profile.title')}</h1>

        {message && (
          <p className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
            {message.text}
          </p>
        )}

        <div className={styles.layout}>
          {/* Editable form */}
          <form onSubmit={handleSave} className={styles.formPanel}>
            <h2 className={styles.panelTitle}>{t('profile.editableDetails')}</h2>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>{t('profile.companyName')}</span>
                <input
                  type="text"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{t('profile.contactPerson')}</span>
                <input
                  type="text"
                  name="contact_person"
                  value={form.contact_person}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{t('profile.phone')}</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{t('profile.city')}</span>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={styles.input}
                />
              </label>
            </div>
            <label className={styles.field}>
              <span className={styles.label}>{t('profile.address')}</span>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                className={styles.textarea}
              />
            </label>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving ? t('profile.saving') : t('profile.saveChanges')}
            </button>
          </form>

          {/* Read-only account info */}
          <aside className={styles.infoPanel}>
            <h2 className={styles.panelTitle}>{t('profile.accountInfo')}</h2>
            <dl className={styles.infoList}>
              <div className={styles.infoRow}>
                <dt>{t('profile.email')}</dt>
                <dd>{profile?.email}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>{t('profile.accountType')}</dt>
                <dd className={styles.mono}>{profile?.buyer_type}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>{t('profile.verification')}</dt>
                <dd>
                  <span className={`${styles.badge} ${styles[profile?.verification_status]}`}>
                    {profile?.verification_status}
                  </span>
                </dd>
              </div>
              <div className={styles.infoRow}>
                <dt>{t('profile.country')}</dt>
                <dd>{profile?.country}</dd>
              </div>
            </dl>
            <p className={styles.hint}>{t('profile.verificationHint')}</p>
          </aside>
        </div>

        <Link to="/buyer/dashboard" className={styles.backLink}>
          {t('profile.back')}
        </Link>
      </div>
    </div>
  )
}

export default BuyerProfile
