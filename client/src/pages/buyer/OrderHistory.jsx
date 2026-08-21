import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './OrderHistory.module.css'

function OrderHistory() {
  const { t } = useLanguage()
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [negotiation, setNegotiation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newPrice, setNewPrice] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`)
      setOrder(res.data.order)
      setNegotiation(res.data.negotiation)
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newPrice) return

    setSubmitting(true)
    try {
      await api.post(`/negotiations/${id}/messages`, {
        offered_price: parseFloat(newPrice),
        note: note || undefined,
      })
      setNewPrice('')
      setNote('')
      fetchOrder()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAccept = async () => {
    try {
      await api.post(`/negotiations/${id}/accept`)
      fetchOrder()
    } catch (error) {
      console.error('Failed to accept:', error)
    }
  }

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  if (!order) {
    return <div className={styles.error}>{t('common.error')}</div>
  }

  return (
    <div className={styles.orderPage}>
      <div className="container">
        <Link to="/buyer/dashboard" className={styles.backLink}>
          ← {t('common.back')}
        </Link>

        <div className={styles.orderHeader}>
          <h1 className={styles.title}>Order #{order.id}</h1>
          <span className={`${styles.statusBadge} ${styles[order.status]}`}>
            {t(`order.status.${order.status}`)}
          </span>
        </div>

        <div className={styles.layout}>
          {/* Order Details */}
          <div className={styles.detailsSection}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>{t('oh.productDetails')}</h2>
              <p className={styles.productName}>{order.product_name}</p>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('order.quantity')}</span>
                  <span className={styles.detailValue}>{order.quantity} kg</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('order.purchaseType')}</span>
                  <span className={styles.detailValue}>{order.purchase_type}</span>
                </div>
                {order.delivery_deadline && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>{t('order.deliveryDate')}</span>
                    <span className={styles.detailValue}>
                      {new Date(order.delivery_deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              {order.notes && (
                <div className={styles.notes}>
                  <span className={styles.notesLabel}>{t('order.notes')}:</span>
                  <p>{order.notes}</p>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>{t('oh.pricing')}</h2>
              <div className={styles.pricingGrid}>
                {order.requested_price && (
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>{t('oh.yourRequestedPrice')}</span>
                    <span className={styles.priceValue}>৳{order.requested_price}/kg</span>
                  </div>
                )}
                {order.current_offer_price && (
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>{t('oh.currentOffer')}</span>
                    <span className={styles.priceValue}>৳{order.current_offer_price}/kg</span>
                  </div>
                )}
                {order.final_agreed_price && (
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>{t('oh.finalPrice')}</span>
                    <span className={styles.priceValue}>৳{order.final_agreed_price}/kg</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Negotiation Thread */}
          <div className={styles.negotiationSection}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>{t('oh.negotiation')}</h2>
              
              {negotiation ? (
                <>
                  <div className={styles.messages}>
                    {negotiation.messages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`${styles.message} ${msg.sender_role === 'buyer' ? styles.messageBuyer : styles.messageStaff}`}
                      >
                        <div className={styles.messageHeader}>
                          <span className={styles.sender}>{msg.sender_role}</span>
                          <span className={styles.messagePrice}>৳{msg.offered_price}/kg</span>
                        </div>
                        {msg.note && <p className={styles.messageNote}>{msg.note}</p>}
                      </div>
                    ))}
                  </div>

                  {negotiation.status === 'open' || negotiation.status === 'countered' ? (
                    <form onSubmit={handleSendMessage} className={styles.negotiationForm}>
                      <div className={styles.priceInput}>
                        <label>Your Counter Offer (৳/kg)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          required
                        />
                      </div>
                      <div className={styles.noteInput}>
                        <label>Note (optional)</label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className={styles.formActions}>
                        <button type="submit" className={styles.submitBtn} disabled={submitting}>
                          {submitting ? 'Sending...' : 'Send Offer'}
                        </button>
                        {negotiation.status === 'countered' && (
                          <button type="button" onClick={handleAccept} className={styles.acceptBtn}>
                            Accept Offer
                          </button>
                        )}
                      </div>
                    </form>
                  ) : negotiation.status === 'accepted' ? (
                    <div className={styles.acceptedMessage}>
                      ✓ Negotiation completed. Order confirmed.
                    </div>
                  ) : (
                    <div className={styles.rejectedMessage}>
                      Negotiation ended.
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.noNegotiation}>
                  No negotiation thread for this order.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderHistory
