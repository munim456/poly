import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './QualityApproval.module.css'

function QualityApproval() {
  const { t } = useLanguage()
  const [pendingBatches, setPendingBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingBatches()
  }, [])

  const fetchPendingBatches = async () => {
    try {
      const res = await api.get('/quality/pending')
      setPendingBatches(res.data.batches)
    } catch (error) {
      console.error('Failed to fetch pending batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.put(`/quality/${id}/approve`)
      fetchPendingBatches()
    } catch (error) {
      console.error('Failed to approve:', error)
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection (optional):')
    try {
      await api.put(`/quality/${id}/reject`, { reason })
      fetchPendingBatches()
    } catch (error) {
      console.error('Failed to reject:', error)
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>{t('admin.quality')}</h1>

        {loading ? (
          <div className={styles.loading}>{t('common.loading')}</div>
        ) : pendingBatches.length === 0 ? (
          <div className={styles.empty}>No pending quality batches to approve</div>
        ) : (
          <div className={styles.batchesList}>
            {pendingBatches.map(batch => (
              <div key={batch.id} className={styles.batchCard}>
                <div className={styles.batchHeader}>
                  <div>
                    <h3 className={styles.productName}>{batch.product_name}</h3>
                    <p className={styles.batchInfo}>
                      Batch: {new Date(batch.batch_date).toLocaleDateString()} | 
                      Tested by: {batch.tested_by_name}
                    </p>
                  </div>
                  <span className={styles.pendingBadge}>Pending</span>
                </div>

                <div className={styles.specsGrid}>
                  {Object.entries(batch.measured_values).map(([key, value]) => (
                    <div key={key} className={styles.specItem}>
                      <span className={styles.specLabel}>{key.replace(/_/g, ' ')}</span>
                      <span className={styles.specValue}>{value}</span>
                    </div>
                  ))}
                </div>

                {batch.certification_file_url && (
                  <a 
                    href={batch.certification_file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.certLink}
                  >
                    View Certification File
                  </a>
                )}

                <div className={styles.actions}>
                  <button 
                    onClick={() => handleApprove(batch.id)}
                    className={styles.approveBtn}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(batch.id)}
                    className={styles.rejectBtn}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QualityApproval
