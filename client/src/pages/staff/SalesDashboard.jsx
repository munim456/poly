import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './StaffDashboard.module.css'

function SalesDashboard() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [thread, setThread] = useState(null)
  const [counterPrice, setCounterPrice] = useState('')
  const [counterNote, setCounterNote] = useState('')
  const [sending, setSending] = useState(false)

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

  const fetchThread = async (orderId) => {
    try {
      const res = await api.get(`/negotiations/${orderId}`)
      setThread(res.data.thread)
    } catch {
      setThread(null)
    }
  }

  const openOrder = (order) => {
    setSelectedOrder(order)
    setThread(null)
    setCounterPrice('')
    setCounterNote('')
    fetchThread(order.id)
  }

  const closeModal = () => {
    setSelectedOrder(null)
    setThread(null)
    setCounterPrice('')
    setCounterNote('')
  }

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status })
      fetchOrders()
      closeModal()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleCounter = async (e) => {
    e.preventDefault()
    if (!counterPrice || Number(counterPrice) <= 0) return
    setSending(true)
    try {
      await api.post(`/negotiations/${selectedOrder.id}/messages`, {
        offered_price: Number(counterPrice),
        note: counterNote || undefined,
      })
      await fetchThread(selectedOrder.id)
      setCounterPrice('')
      setCounterNote('')
      fetchOrders()
    } catch (error) {
      console.error('Failed to send counter offer:', error)
    } finally {
      setSending(false)
    }
  }

  const handleAccept = async () => {
    setSending(true)
    try {
      await api.post(`/negotiations/${selectedOrder.id}/accept`)
      fetchOrders()
      closeModal()
    } catch (error) {
      console.error('Failed to accept offer:', error)
    } finally {
      setSending(false)
    }
  }

  const handleReject = async () => {
    setSending(true)
    try {
      await api.post(`/negotiations/${selectedOrder.id}/reject`)
      fetchOrders()
      closeModal()
    } catch (error) {
      console.error('Failed to reject offer:', error)
    } finally {
      setSending(false)
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
                    <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className={styles.product}>{order.product_name}</p>
                  <p className={styles.details}>
                    Qty: {order.quantity} kg | {order.company_name}
                  </p>
                  {order.current_offer_price && (
                    <p className={styles.price}>Current offer: ৳{order.current_offer_price}/kg</p>
                  )}
                  <div className={styles.actions}>
                    <button 
                      onClick={() => openOrder(order)}
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
                <button onClick={closeModal} className={styles.closeBtn}>×</button>
              </div>
              <div className={styles.modalBody}>
                <p><strong>Company:</strong> {selectedOrder.company_name}</p>
                <p><strong>Product:</strong> {selectedOrder.product_name}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity} kg</p>
                <p><strong>Type:</strong> {selectedOrder.purchase_type}</p>
                {selectedOrder.requested_price && (
                  <p><strong>Buyer Offered:</strong> ৳{selectedOrder.requested_price}/kg</p>
                )}
                {selectedOrder.notes && (
                  <p><strong>Notes:</strong> {selectedOrder.notes}</p>
                )}

                {/* Negotiation Thread */}
                {thread && (
                  <div className={styles.negoSection}>
                    <h4 className={styles.negoTitle}>
                      Negotiation — {thread.status}
                    </h4>
                    <div className={styles.messageList}>
                      {thread.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`${styles.message} ${msg.sender_role === 'buyer' ? styles.theirs : styles.mine}`}
                        >
                          <span className={styles.msgPrice}>৳{msg.offered_price}/kg</span>
                          {msg.note && <span className={styles.msgNote}>{msg.note}</span>}
                          <span className={styles.msgMeta}>
                            {msg.sender_role} · {new Date(msg.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {(thread.status === 'open' || thread.status === 'countered') && (
                      <>
                        <form onSubmit={handleCounter} className={styles.counterForm}>
                          <label className={styles.counterLabel} htmlFor="counter-price">
                            Counter Offer (৳/kg)
                          </label>
                          <div className={styles.inputRow}>
                            <input
                              id="counter-price"
                              type="number"
                              min="0"
                              step="0.01"
                              value={counterPrice}
                              onChange={(e) => setCounterPrice(e.target.value)}
                              placeholder="0.00"
                              className={styles.priceInput}
                              required
                            />
                            <input
                              type="text"
                              value={counterNote}
                              onChange={(e) => setCounterNote(e.target.value)}
                              placeholder="Note (optional)"
                              className={styles.noteInput}
                            />
                            <button type="submit" disabled={sending} className={styles.sendBtn}>
                              Send
                            </button>
                          </div>
                        </form>
                        <div className={styles.negoActions}>
                          <button
                            onClick={handleAccept}
                            disabled={sending || thread.status !== 'countered'}
                            className={styles.acceptBtn}
                          >
                            Accept Buyer Offer
                          </button>
                          <button
                            onClick={handleReject}
                            disabled={sending}
                            className={styles.rejectBtn}
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    )}

                    {thread.status === 'accepted' && (
                      <p className={styles.negoClosed}>Offer accepted — order confirmed.</p>
                    )}
                    {thread.status === 'rejected' && (
                      <p className={styles.negoClosed}>Negotiation rejected.</p>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.modalActions}>
                {!thread && selectedOrder.status === 'quote_requested' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                    className={styles.confirmBtn}
                  >
                    Confirm Order
                  </button>
                )}
                <button 
                  onClick={closeModal}
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
