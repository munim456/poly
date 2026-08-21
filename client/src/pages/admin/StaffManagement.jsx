import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import styles from './StaffManagement.module.css'

function StaffManagement() {
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
      setError('Failed to load staff accounts')
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
      setError(err.response?.data?.error || 'Failed to create staff account')
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

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Staff Accounts</h1>
          <button onClick={() => setShowForm(!showForm)} className={styles.toggleBtn}>
            {showForm ? 'Cancel' : '+ Add Staff'}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {showForm && (
          <form onSubmit={handleCreate} className={styles.formPanel}>
            <h2 className={styles.panelTitle}>New Staff Account</h2>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Password</span>
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
                <span className={styles.label}>Role</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={styles.input}
                >
                  <option value="sales">Sales</option>
                  <option value="quality">Quality</option>
                  <option value="owner">Owner</option>
                </select>
              </label>
            </div>
            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? 'Creating…' : 'Create Account'}
            </button>
          </form>
        )}

        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                        <option value="sales">sales</option>
                        <option value="quality">quality</option>
                        <option value="owner">owner</option>
                      </select>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${member.is_active ? styles.active : styles.inactive}`}>
                        {member.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(member)}
                        className={member.is_active ? styles.disableBtn : styles.enableBtn}
                      >
                        {member.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link to="/admin/dashboard" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default StaffManagement
