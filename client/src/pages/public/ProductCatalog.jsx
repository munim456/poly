import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './ProductCatalog.module.css'

function ProductCatalog() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [search, setSearch] = useState('')

  const categories = [
    { value: '', label: t('products.all') },
    { value: 'hdpe_bags', label: 'HDPE Woven Sacks' },
    { value: 'bopp_film', label: 'BOPP Film' },
    { value: 'yarn', label: 'PP Yarn' },
    { value: 'ldpe_film', label: 'LDPE Shrink Film' },
  ]

  useEffect(() => {
    fetchProducts()
  }, [category])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (search) params.append('search', search)
      
      const res = await api.get(`/products?${params.toString()}`)
      setProducts(res.data.products)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (value) => {
    setCategory(value)
    if (value) {
      setSearchParams({ category: value })
    } else {
      setSearchParams({})
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  const formatSpecs = (specs) => {
    if (!specs || Object.keys(specs).length === 0) return null
    
    const specEntries = Object.entries(specs).slice(0, 3)
    return specEntries.map(([key, value]) => {
      const label = key.replace(/_/g, ' ').toUpperCase().slice(0, 4)
      return `${label}: ${value}`
    }).join(' | ')
  }

  return (
    <div className={styles.catalog}>
      <div className="container">
        <h1 className={styles.title}>{t('products.title')}</h1>

        {/* Filters */}
        <div className={styles.filters}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder={t('products.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>
              {t('common.search')}
            </button>
          </form>

          <div className={styles.categoryFilter}>
            <label className={styles.filterLabel}>{t('products.filter')}</label>
            <div className={styles.categoryButtons}>
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`${styles.categoryBtn} ${category === cat.value ? styles.categoryBtnActive : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className={styles.loading}>{t('common.loading')}</div>
        ) : products.length === 0 ? (
          <div className={styles.noData}>{t('common.noData')}</div>
        ) : (
          <div className={styles.grid}>
            {products.map(product => (
              <Link 
                key={product.id} 
                to={`/products/${product.id}`}
                className={styles.card}
              >
                <div className={styles.cardImage}>
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className={styles.placeholderImage}>📦</div>
                  )}
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{product.name}</h3>
                  
                  {/* Monospace spec strip */}
                  <div className={styles.specStrip}>
                    {formatSpecs(product.base_specs)}
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <div className={styles.priceInfo}>
                      <span className={styles.price}>৳{product.regular_price}</span>
                      <span className={styles.moq}>{t('products.moq')}: {product.regular_moq}</span>
                    </div>
                    
                    {product.is_bargaining_allowed && (
                      <span className={styles.bargainingBadge}>{t('product.bargaining')}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCatalog
