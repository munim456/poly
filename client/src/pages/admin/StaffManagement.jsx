import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './StaffManagement.module.css'

function StaffManagement() {
  const { t } = useLanguage()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await api.get('/admin/staff')
      setStaff(res.data.staff)
    } catch (err) {
      setError(t('common.error'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/admin/staff', form)
      setForm({ name: '', email: '', password: '', role: 'sales' })
      setShowForm(false)
      fetchStaff()
    } catch (err) {
      setError(err.response?.data?.error || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/staff/${id}`, { role })
      fetchStaff()
    } catch (err) {
      console.error('Failed to update role:', err)
    }
  }

  const handleToggleActive = async (member) => {
    try {
      await api.put(`/admin/staff/${member.id}`, { is_active: !member.is_active })
      fetchStaff()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const roleLabel = (role) =>
    role === 'sales' ? t('staff.roleSales')
    : role === 'quality' ? t('staff.roleQuality')
    : t('staff.roleOwner')

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t('staff.title')}</h1>
          <button onClick={() => setShowForm(!showForm)} className={styles.toggleBtn}>
            {showForm ? t('common.cancel') : t('staff.add')}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {showForm && (
          <form onSubmit={handleCreate} className={styles.formPanel}>
            <h2 className={styles.panelTitle}>{t('staff.newTitle')}</h2>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>{t('staff.name')}</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{t('staff.email')}</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{t('staff.password')}</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength="6"
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{t('staff.role')}</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={styles.input}
                >
                  <option value="sales">{t('staff.roleSales')}</option>
                  <option value="quality">{t('staff.roleQuality')}</option>
                  <option value="owner">{t('staff.roleOwner')}</option>
                </select>
              </label>
            </div>
            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? t('staff.creating') : t('staff.create')}
            </button>
          </form>
        )}

        {loading ? (
          <p className={styles.loading}>{t('common.loading')}</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('staff.colName')}</th>
                  <th>{t('staff.colEmail')}</th>
                  <th>{t('staff.colRole')}</th>
                  <th>{t('staff.colStatus')}</th>
                  <th>{t('staff.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className={!member.is_active ? styles.inactiveRow : ''}>
                    <td className={styles.nameCell}>{member.name}</td>
                    <td className={styles.monoCell}>{member.email}</td>
                    <td>
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className={styles.roleSelect}
                      >
                        <option value="sales">{t('staff.roleSales')}</option>
                        <option value="quality">{t('staff.roleQuality')}</option>
                        <option value="owner">{t('staff.roleOwner')}</option>
                      </select>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${member.is_active ? styles.active : styles.inactive}`}>
                        {member.is_active ? t('staff.active') : t('staff.disabled')}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(member)}
                        className={member.is_active ? styles.disableBtn : styles.enableBtn}
                      >
                        {member.is_active ? t('staff.disable') : t('staff.enable')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link to="/admin/dashboard" className={styles.backLink}>
          {t('staff.back')}
        </Link>
      </div>
    </div>
  )
}

export default StaffManagement
