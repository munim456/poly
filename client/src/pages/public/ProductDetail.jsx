import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import styles from './ProductDetail.module.css'

function ProductDetail() {
  const { id } = useParams()
  const { t } = useLanguage()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`)
      setProduct(res.data.product)
    } catch (error) {
      console.error('Failed to fetch product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  if (!product) {
    return <div className={styles.error}>{t('common.error')}</div>
  }

  const formatSpecs = (specs) => {
    if (!specs || Object.keys(specs).length === 0) return null
    
    return Object.entries(specs).map(([key, value]) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value,
    }))
  }

  const specs = formatSpecs(product.base_specs)
  const tiers = product.wholesale_price_tiers || []

  return (
    <div className={styles.detail}>
      <div className="container">
        <Link to="/products" className={styles.backLink}>
          ← {t('common.back')} {t('nav.products')}
        </Link>

        <div className={styles.layout}>
          {/* Image Section */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              {product.images && product.images[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className={styles.placeholderImage}>📦</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, idx) => (
                  <div key={idx} className={styles.thumbnail}>
                    <img src={img} alt={`${product.name} ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className={styles.infoSection}>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.category}>{product.category.replace('_', ' ').toUpperCase()}</p>
            
            {product.description && (
              <p className={styles.description}>{product.description}</p>
            )}

            {/* Specs Table (Monospace) */}
            {specs && specs.length > 0 && (
              <div className={styles.specsSection}>
                <h2 className={styles.sectionTitle}>{t('product.specifications')}</h2>
                <table className={styles.specsTable}>
                  <tbody>
                    {specs.map(spec => (
                      <tr key={spec.label}>
                        <td className={styles.specLabel}>{spec.label}</td>
                        <td className={styles.specValue}>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pricing */}
            <div className={styles.pricingSection}>
              <h2 className={styles.sectionTitle}>{t('product.pricing')}</h2>
              
              <div className={styles.pricingGrid}>
                {/* Regular Pricing */}
                <div className={styles.pricingCard}>
                  <h3 className={styles.pricingTitle}>{t('product.regular')}</h3>
                  <div className={styles.priceMain}>
                    <span className={styles.currency}>৳</span>
                    <span className={styles.amount}>{product.regular_price}</span>
                    <span className={styles.unit}>/kg</span>
                  </div>
                  <p className={styles.moq}>{t('product.moq')}: {product.regular_moq} kg</p>
                </div>

                {/* Wholesale Pricing */}
                {tiers.length > 0 && (
                  <div className={`${styles.pricingCard} ${styles.pricingCardHighlighted}`}>
                    <h3 className={styles.pricingTitle}>{t('product.wholesale')}</h3>
                    <div className={styles.tiers}>
                      {tiers.map((tier, idx) => (
                        <div key={idx} className={styles.tier}>
                          <span className={styles.tierQty}>{tier.min_qty}+ kg</span>
                          <span className={styles.tierPrice}>৳{tier.price}/kg</span>
                        </div>
                      ))}
                    </div>
                    <p className={styles.moq}>{t('product.moq')}: {product.wholesale_moq} kg</p>
                  </div>
                )}
              </div>

              <p className={styles.bargainingInfo}>
                {product.is_bargaining_allowed 
                  ? t('product.bargaining') 
                  : t('product.noBargaining')}
              </p>
            </div>

            {/* Quality Batch */}
            {product.quality_batch && (
              <div className={styles.qualitySection}>
                <h2 className={styles.sectionTitle}>{t('product.quality')}</h2>
                <div className={styles.qualityCard}>
                  <div className={styles.qualityHeader}>
                    <span className={styles.batchDate}>
                      Batch: {new Date(product.quality_batch.batch_date).toLocaleDateString()}
                    </span>
                    <span className={styles.qualityBadge}>✓ Verified</span>
                  </div>
                  <div className={styles.qualitySpecs}>
                    {Object.entries(product.quality_batch.measured_values).map(([key, value]) => (
                      <div key={key} className={styles.qualitySpec}>
                        <span className={styles.qualitySpecLabel}>{key.replace(/_/g, ' ')}</span>
                        <span className={styles.qualitySpecValue}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className={styles.ctaSection}>
              {user ? (
                <Link to={`/buyer/rfq?product=${product.id}`} className={styles.btnPrimary}>
                  {t('product.placeOrder')}
                </Link>
              ) : (
                <Link to="/register" className={styles.btnPrimary}>
                  {t('product.requestQuote')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
