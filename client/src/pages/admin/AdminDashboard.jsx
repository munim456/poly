import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import { BagIcon, CheckCircleIcon, ShieldCheckIcon } from '../../components/common/Icons'
import styles from './AdminDashboard.module.css'

function AdminDashboard() {
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard')
      setStats(res.data.stats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  return (
    <div className={styles.dashboard}>
      <div className="container">
        <h1 className={styles.title}>{t('admin.dashboard')}</h1>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <Link to="/admin/products" className={styles.statCard}>
            <span className={styles.statValue}>{stats?.totalProducts || 0}</span>
            <span className={styles.statLabel}>{t('admin.stats.totalProducts')}</span>
          </Link>
          <Link to="/admin/orders" className={styles.statCard}>
            <span className={styles.statValue}>{stats?.pendingOrders || 0}</span>
            <span className={styles.statLabel}>{t('admin.stats.pendingOrders')}</span>
          </Link>
          <Link to="/admin/quality" className={styles.statCard}>
            <span className={styles.statValue}>{stats?.pendingQualityBatches || 0}</span>
            <span className={styles.statLabel}>{t('admin.stats.pendingQuality')}</span>
          </Link>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats?.totalBuyers || 0}</span>
            <span className={styles.statLabel}>{t('admin.stats.totalBuyers')}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>{t('admin.quickActions')}</h2>
          <div className={styles.actionsGrid}>
            <Link to="/admin/products" className={styles.actionCard}>
              <span className={styles.actionIcon}><BagIcon size={24} /></span>
              <span className={styles.actionTitle}>{t('nav.products')}</span>
            </Link>
            <Link to="/admin/quality" className={styles.actionCard}>
              <span className={styles.actionIcon}><CheckCircleIcon size={24} /></span>
              <span className={styles.actionTitle}>{t('admin.approveQuality')}</span>
            </Link>
            <Link to="/admin/staff" className={styles.actionCard}>
              <span className={styles.actionIcon}><ShieldCheckIcon size={24} /></span>
              <span className={styles.actionTitle}>{t('staff.title')}</span>
            </Link>
            <Link to="/admin/buyers" className={styles.actionCard}>
              <span className={styles.actionIcon}><BagIcon size={24} /></span>
              <span className={styles.actionTitle}>{t('buyerMgmt.title')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
