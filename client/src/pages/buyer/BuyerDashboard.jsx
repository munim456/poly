import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './BuyerDashboard.module.css'

function BuyerDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders')
      setOrders(res.data.orders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['quote_requested', 'negotiating'].includes(o.status)).length,
    confirmed: orders.filter(o => ['confirmed', 'in_production', 'ready'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'dispatched').length,
  }

  return (
    <div className={styles.dashboard}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>{t('dashboard.welcome')}, {user?.company_name}</h1>
          <Link to="/buyer/rfq" className={styles.newOrderBtn}>
            + {t('order.title')}
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>{t('dashboard.stats.totalOrders')}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>{t('dashboard.stats.pending')}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.confirmed}</span>
            <span className={styles.statLabel}>{t('dashboard.stats.confirmed')}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.delivered}</span>
            <span className={styles.statLabel}>{t('dashboard.stats.delivered')}</span>
          </div>
        </div>

        {/* Orders List */}
        <div className={styles.ordersSection}>
          <h2 className={styles.sectionTitle}>{t('dashboard.orders')}</h2>
          
          {loading ? (
            <div className={styles.loading}>{t('common.loading')}</div>
          ) : orders.length === 0 ? (
            <div className={styles.empty}>
              <p>No orders yet</p>
              <Link to="/products" className={styles.browseLink}>Browse Products</Link>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>#{order.id}</span>
                    <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                      {t(`order.status.${order.status}`)}
                    </span>
                  </div>
                  
                  <div className={styles.orderInfo}>
                    <p className={styles.productName}>{order.product_name}</p>
                    <p className={styles.orderDetails}>
                      Qty: {order.quantity} | Type: {order.purchase_type}
                    </p>
                    {order.current_offer_price && (
                      <p className={styles.price}>
                        Offer: ৳{order.current_offer_price}/kg
                      </p>
                    )}
                  </div>
                  
                  <div className={styles.orderFooter}>
                    <span className={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <Link to={`/buyer/orders/${order.id}`} className={styles.viewBtn}>
                      {t('common.view')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuyerDashboard
