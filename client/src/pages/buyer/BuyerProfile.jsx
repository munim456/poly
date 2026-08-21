import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import styles from './BuyerProfile.module.css'

function BuyerProfile() {
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
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p className={styles.loading}>Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Company Profile</h1>

        {message && (
          <p className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
            {message.text}
          </p>
        )}

        <div className={styles.layout}>
          {/* Editable form */}
          <form onSubmit={handleSave} className={styles.formPanel}>
            <h2 className={styles.panelTitle}>Editable Details</h2>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Company Name</span>
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
                <span className={styles.label}>Contact Person</span>
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
                <span className={styles.label}>Phone</span>
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
                <span className={styles.label}>City</span>
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
              <span className={styles.label}>Address</span>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                className={styles.textarea}
              />
            </label>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>

          {/* Read-only account info */}
          <aside className={styles.infoPanel}>
            <h2 className={styles.panelTitle}>Account Info</h2>
            <dl className={styles.infoList}>
              <div className={styles.infoRow}>
                <dt>Email</dt>
                <dd>{profile?.email}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Account Type</dt>
                <dd className={styles.mono}>{profile?.buyer_type}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Verification</dt>
                <dd>
                  <span className={`${styles.badge} ${styles[profile?.verification_status]}`}>
                    {profile?.verification_status}
                  </span>
                </dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Country</dt>
                <dd>{profile?.country}</dd>
              </div>
            </dl>
            <p className={styles.hint}>
              Verification is reviewed by our sales team after your first order.
            </p>
          </aside>
        </div>

        <Link to="/buyer/dashboard" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default BuyerProfile
