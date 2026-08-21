import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import styles from './BuyerManagement.module.css'

function BuyerManagement() {
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchBuyers()
  }, [])

  const fetchBuyers = async () => {
    try {
      const res = await api.get('/buyers')
      setBuyers(res.data.buyers)
    } catch (err) {
      setError('Failed to load buyer accounts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id, verification_status) => {
    try {
      await api.put(`/buyers/${id}/verify`, { verification_status })
      fetchBuyers()
    } catch (err) {
      console.error('Failed to update verification:', err)
    }
  }

  const handleToggleActive = async (buyer) => {
    try {
      await api.put(`/buyers/${buyer.id}/status`, { is_active: !buyer.is_active })
      fetchBuyers()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const filtered =
    filter === 'all'
      ? buyers
      : buyers.filter((b) => b.verification_status === filter)

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Buyer Accounts</h1>
          <div className={styles.filters}>
            {['all', 'unverified', 'pending', 'verified'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>No buyer accounts</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Verification</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((buyer) => (
                  <tr key={buyer.id} className={!buyer.is_active ? styles.inactiveRow : ''}>
                    <td>
                      <span className={styles.company}>{buyer.company_name}</span>
                      <span className={styles.email}>{buyer.email}</span>
                    </td>
                    <td className={styles.monoCell}>
                      {buyer.contact_person}
                      <span className={styles.subCell}>{buyer.phone}</span>
                    </td>
                    <td className={styles.monoCell}>{buyer.buyer_type}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[buyer.verification_status]}`}>
                        {buyer.verification_status}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${buyer.is_active ? styles.active : styles.inactive}`}>
                        {buyer.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        {buyer.verification_status !== 'verified' && (
                          <button
                            onClick={() => handleVerify(buyer.id, 'verified')}
                            className={styles.verifyBtn}
                          >
                            Verify
                          </button>
                        )}
                        {buyer.verification_status === 'verified' && (
                          <button
                            onClick={() => handleVerify(buyer.id, 'unverified')}
                            className={styles.unverifyBtn}
                          >
                            Unverify
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(buyer)}
                          className={buyer.is_active ? styles.disableBtn : styles.enableBtn}
                        >
                          {buyer.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
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

export default BuyerManagement
