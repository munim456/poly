import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import styles from './Home.module.css'

function Home() {
  const { t } = useLanguage()

  const categories = [
    { id: 'hdpe_bags', name: t('home.categories.hdpe_bags'), icon: '📦' },
    { id: 'bopp_film', name: t('home.categories.bopp_film'), icon: '📽️' },
    { id: 'yarn', name: t('home.categories.yarn'), icon: '🧵' },
    { id: 'ldpe_film', name: t('home.categories.ldpe_film'), icon: '📋' },
  ]

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('home.hero.title')}</h1>
          <p className={styles.heroSubtitle}>{t('home.hero.subtitle')}</p>
          <div className={styles.heroCta}>
            <Link to="/products" className={styles.btnPrimary}>{t('home.hero.cta')}</Link>
            <Link to="/register" className={styles.btnSecondary}>{t('home.hero.ctaSecondary')}</Link>
          </div>
          
          {/* Spec readout overlay */}
          <div className={styles.specReadout}>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>GSM</span>
              <span className={styles.specValue}>80-300</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>MOQ</span>
              <span className={styles.specValue}>500+</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Lead</span>
              <span className={styles.specValue}>5-7d</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categories}>
        <div className="container">
          <h2 className={styles.sectionTitle}>{t('home.categories.title')}</h2>
          <div className={styles.categoryGrid}>
            {categories.map(category => (
              <Link 
                key={category.id} 
                to={`/products?category=${category.id}`}
                className={styles.categoryCard}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryName}>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className={styles.trust}>
        <div className="container">
          <h2 className={styles.sectionTitle}>{t('home.trust.title')}</h2>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✓</span>
              <span className={styles.trustText}>{t('home.trust.certified')}</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>⏱</span>
              <span className={styles.trustText}>{t('home.trust.experience')}</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>★</span>
              <span className={styles.trustText}>{t('home.trust.quality')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
