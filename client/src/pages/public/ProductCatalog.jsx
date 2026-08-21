import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import {
  SearchIcon,
  BagIcon,
  FilmRollIcon,
  YarnIcon,
  LayersIcon,
  ArrowRightIcon,
} from '../../components/common/Icons'
import styles from './ProductCatalog.module.css'

const CATEGORY_ICONS = {
  hdpe_bags: BagIcon,
  bopp_film: FilmRollIcon,
  yarn: YarnIcon,
  ldpe_film: LayersIcon,
}

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <header className={styles.catalogHeader}>
          <h1 className={styles.title}>{t('products.title')}</h1>
          <p className={styles.subtitle}>{t('home.categories.subtitle')}</p>
        </header>

        {/* Filters */}
        <div className={styles.filters}>
          <form onSubmit={handleSearch} className={styles.searchForm} role="search">
            <label htmlFor="product-search" className="sr-only">
              {t('products.search')}
            </label>
            <div className={styles.searchField}>
              <SearchIcon size={18} className={styles.searchIcon} />
              <input
                id="product-search"
                type="search"
                placeholder={t('products.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button type="submit" className={`btn btnPrimary ${styles.searchBtn}`}>
              {t('common.search')}
            </button>
          </form>

          <div className={styles.categoryFilter} role="group" aria-label={t('products.filter')}>
            {categories.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryChange(cat.value)}
                aria-pressed={category === cat.value}
                className={`${styles.categoryBtn} ${category === cat.value ? styles.categoryBtnActive : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className={styles.grid} aria-busy="true" aria-live="polite">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className={`cardSkeleton ${styles.skeletonCard}`}>
                <div className={`${styles.skeleton} ${styles.skeletonImage}`} />
                <div className={styles.skeletonBody}>
                  <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                  <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonShort}`} />
                  <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonStrip}`} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.noData}>
            <BagIcon size={40} className={styles.noDataIcon} />
            <p>{t('common.noData')}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map(product => {
              const PlaceholderIcon = CATEGORY_ICONS[product.category] || BagIcon
              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className={styles.card}
                >
                  <div className={styles.cardImage}>
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} loading="lazy" />
                    ) : (
                      <PlaceholderIcon size={56} className={styles.placeholderImage} />
                    )}
                  </div>

                  <div className={styles.cardContent}>
                    <h2 className={styles.cardTitle}>{product.name}</h2>

                    {formatSpecs(product.base_specs) && (
                      <p className={styles.specStrip}>{formatSpecs(product.base_specs)}</p>
                    )}

                    <div className={styles.cardFooter}>
                      <div className={styles.priceInfo}>
                        <span className={styles.price}>৳{product.regular_price}</span>
                        <span className={styles.moq}>{t('products.moq')}: {product.regular_moq}</span>
                      </div>

                      {product.is_bargaining_allowed && (
                        <span className={styles.bargainingBadge}>{t('product.bargaining')}</span>
                      )}
                    </div>

                    <span className={styles.viewLink}>
                      {t('products.viewDetails')}
                      <ArrowRightIcon size={16} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCatalog
