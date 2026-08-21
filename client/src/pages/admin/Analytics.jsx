import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './Analytics.module.css'

function formatBDT(value) {
  return new Intl.NumberFormat('en-IN').format(Math.round(value))
}

function Analytics() {
  const { t, language } = useLanguage()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics')
      setData(res.data.analytics)
    } catch (err) {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  if (error || !data) {
    return <div className={styles.loading}>{error}</div>
  }

  const { kpis, statusBreakdown, topProducts, monthlyTrend } = data
  const maxMonthOrders = Math.max(...monthlyTrend.map((m) => m.orderCount), 1)
  const maxProductQty = Math.max(...topProducts.map((p) => p.totalQuantity), 1)

  const localeTag = language === 'bn' ? 'bn-BD' : 'en-GB'
  const monthLabel = (m) =>
    new Date(`${m.month}-01`).toLocaleDateString(localeTag, { month: 'short' })

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>{t('analytics.title')}</h1>

        {/* KPI band */}
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiPrimary}`}>
            <span className={styles.kpiLabel}>{t('analytics.totalRevenue')}</span>
            <span className={styles.kpiValue}>৳ {formatBDT(kpis.totalRevenue)}</span>
            <span className={styles.kpiSub}>{t('analytics.confirmedOnly')}</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{t('analytics.avgOrderValue')}</span>
            <span className={styles.kpiValue}>৳ {formatBDT(kpis.avgOrderValue)}</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{t('analytics.conversionRate')}</span>
            <span className={styles.kpiValue}>{kpis.conversionRate}%</span>
            <span className={styles.kpiSub}>
              {kpis.confirmedOrders} / {statusBreakdown.reduce((s, x) => s + x.count, 0)}{' '}
              {t('analytics.orders')}
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{t('analytics.buyers')}</span>
            <span className={styles.kpiValue}>{kpis.totalBuyers}</span>
            <span className={styles.kpiSub}>
              {kpis.verifiedBuyers} {t('analytics.verified')}
            </span>
          </div>
        </div>

        <div className={styles.gridTwo}>
          {/* Monthly trend */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{t('analytics.monthlyTrend')}</h2>
            {monthlyTrend.length === 0 ? (
              <p className={styles.empty}>{t('common.noData')}</p>
            ) : (
              <div className={styles.trendChart}>
                {monthlyTrend.map((m) => (
                  <div key={m.month} className={styles.trendCol}>
                    <span className={styles.trendValue}>{m.orderCount}</span>
                    <div className={styles.trendBarTrack}>
                      <div
                        className={styles.trendBar}
                        style={{ height: `${(m.orderCount / maxMonthOrders) * 100}%` }}
                      />
                    </div>
                    <span className={styles.trendMonth}>{monthLabel(m)}</span>
                    <span className={styles.trendRevenue}>৳{formatBDT(m.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Order status breakdown */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{t('analytics.statusBreakdown')}</h2>
            <ul className={styles.statusList}>
              {statusBreakdown.map((s) => (
                <li key={s.status} className={styles.statusRow}>
                  <span className={styles.statusName}>{t(`order.status.${s.status}`)}</span>
                  <span className={styles.statusBarTrack}>
                    <span
                      className={styles.statusBar}
                      style={{
                        width: `${(s.count / Math.max(...statusBreakdown.map((x) => x.count), 1)) * 100}%`,
                      }}
                    />
                  </span>
                  <span className={styles.statusCount}>{s.count}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Top products */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>{t('analytics.topProducts')}</h2>
          {topProducts.length === 0 ? (
            <p className={styles.empty}>{t('common.noData')}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('analytics.colProduct')}</th>
                  <th>{t('analytics.colCategory')}</th>
                  <th>{t('analytics.colOrders')}</th>
                  <th>{t('analytics.colQuantity')}</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.productName}>
                    <td>{p.productName}</td>
                    <td className={styles.monoCell}>{p.category}</td>
                    <td className={styles.monoCell}>{p.orderCount}</td>
                    <td>
                      <div className={styles.qtyCell}>
                        <span className={styles.qtyBarTrack}>
                          <span
                            className={styles.qtyBar}
                            style={{ width: `${(p.totalQuantity / maxProductQty) * 100}%` }}
                          />
                        </span>
                        <span className={styles.monoCell}>{formatBDT(p.totalQuantity)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <Link to="/admin/dashboard" className={styles.backLink}>
          {t('analytics.back')}
        </Link>
      </div>
    </div>
  )
}

export default Analytics
