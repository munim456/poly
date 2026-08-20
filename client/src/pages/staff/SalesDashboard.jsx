import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './StaffDashboard.module.css'

function SalesDashboard() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

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

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status })
      fetchOrders()
      setSelectedOrder(null)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const pendingOrders = orders.filter(o => ['quote_requested', 'negotiating'].includes(o.status))
  const activeOrders = orders.filter(o => ['confirmed', 'in_production', 'ready'].includes(o.status))

  return (
    <div className={styles.dashboard}>
      <div className="container">
        <h1 className={styles.title}>{t('admin.dashboard')}</h1>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{pendingOrders.length}</span>
            <span className={styles.statLabel}>Pending Orders</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{activeOrders.length}</span>
            <span className={styles.statLabel}>Active Orders</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{orders.length}</span>
            <span className={styles.statLabel}>Total Orders</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Pending Orders</h2>
          {pendingOrders.length === 0 ? (
            <p className={styles.empty}>No pending orders</p>
          ) : (
            <div className={styles.ordersList}>
              {pendingOrders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>#{order.id}</span>
                    <span className={styles.company}>{order.company_name}</span>
                  </div>
                  <p className={styles.product}>{order.product_name}</p>
                  <p className={styles.details}>
                    Qty: {order.quantity} kg | {order.purchase_type}
                  </p>
                  {order.requested_price && (
                    <p className={styles.price}>Offered: ৳{order.requested_price}/kg</p>
                  )}
                  <div className={styles.actions}>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className={styles.viewBtn}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Orders */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Active Orders</h2>
          {activeOrders.length === 0 ? (
            <p className={styles.empty}>No active orders</p>
          ) : (
            <div className={styles.ordersList}>
              {activeOrders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>#{order.id}</span>
                    <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className={styles.product}>{order.product_name}</p>
                  <p className={styles.details}>
                    Qty: {order.quantity} kg | {order.company_name}
                  </p>
                  <div className={styles.actions}>
                    {order.status === 'confirmed' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'in_production')}
                        className={styles.updateBtn}
                      >
                        Mark In Production
                      </button>
                    )}
                    {order.status === 'in_production' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                        className={styles.updateBtn}
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'dispatched')}
                        className={styles.updateBtn}
                      >
                        Mark Dispatched
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>Order #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className={styles.closeBtn}>×</button>
              </div>
              <div className={styles.modalBody}>
                <p><strong>Company:</strong> {selectedOrder.company_name}</p>
                <p><strong>Product:</strong> {selectedOrder.product_name}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity} kg</p>
                <p><strong>Type:</strong> {selectedOrder.purchase_type}</p>
                {selectedOrder.requested_price && (
                  <p><strong>Offered Price:</strong> ৳{selectedOrder.requested_price}/kg</p>
                )}
                {selectedOrder.notes && (
                  <p><strong>Notes:</strong> {selectedOrder.notes}</p>
                )}
              </div>
              <div className={styles.modalActions}>
                <button 
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                  className={styles.confirmBtn}
                >
                  Confirm Order
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className={styles.cancelBtn}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesDashboard
