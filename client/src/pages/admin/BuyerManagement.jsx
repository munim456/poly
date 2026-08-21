import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './BuyerManagement.module.css'

function BuyerManagement() {
  const { t } = useLanguage()
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
      setError(t('common.error'))
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
          <h1 className={styles.title}>{t('buyerMgmt.title')}</h1>
          <div className={styles.filters}>
            {['all', 'unverified', 'pending', 'verified'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              >
                {f === 'all' ? t('buyerMgmt.filterAll') : f}
              </button>
            ))}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p className={styles.loading}>{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>{t('buyerMgmt.empty')}</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('buyerMgmt.colCompany')}</th>
                  <th>{t('buyerMgmt.colContact')}</th>
                  <th>{t('buyerMgmt.colType')}</th>
                  <th>{t('buyerMgmt.colVerification')}</th>
                  <th>{t('buyerMgmt.colStatus')}</th>
                  <th>{t('buyerMgmt.colActions')}</th>
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
                        {buyer.is_active ? t('buyerMgmt.active') : t('buyerMgmt.inactive')}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        {buyer.verification_status !== 'verified' && (
                          <button
                            onClick={() => handleVerify(buyer.id, 'verified')}
                            className={styles.verifyBtn}
                          >
                            {t('buyerMgmt.verify')}
                          </button>
                        )}
                        {buyer.verification_status === 'verified' && (
                          <button
                            onClick={() => handleVerify(buyer.id, 'unverified')}
                            className={styles.unverifyBtn}
                          >
                            {t('buyerMgmt.unverify')}
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(buyer)}
                          className={buyer.is_active ? styles.disableBtn : styles.enableBtn}
                        >
                          {buyer.is_active ? t('buyerMgmt.disable') : t('buyerMgmt.enable')}
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
          {t('buyerMgmt.back')}
        </Link>
      </div>
    </div>
  )
}

export default BuyerManagement
