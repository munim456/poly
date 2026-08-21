import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import {
  BagIcon,
  FilmRollIcon,
  YarnIcon,
  LayersIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
} from '../../components/common/Icons'
import styles from './Home.module.css'

function RollDrawing() {
  return (
    <svg
      className={styles.drawing}
      viewBox="0 0 520 430"
      fill="none"
      role="img"
      aria-label="Technical drawing of poly film rolls with dimensions"
    >
      {/* film rolls */}
      <g stroke="currentColor" strokeWidth="1.5">
        <circle cx="150" cy="270" r="82" />
        <circle cx="150" cy="270" r="20" />
        <circle cx="330" cy="270" r="82" />
        <circle cx="330" cy="270" r="20" />
        <circle cx="240" cy="128" r="82" />
        <circle cx="240" cy="128" r="20" />
      </g>
      {/* crosshairs */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.55">
        <path d="M150 178v-16M150 362v16M58 270h-16M242 270h16" />
        <path d="M330 178v-16M330 362v16M238 270h16M422 270h16" />
        <path d="M240 36v-16M240 220v16M148 128h-16M332 128h16" />
      </g>
      <g fill="currentColor">
        <circle cx="150" cy="270" r="2.5" />
        <circle cx="330" cy="270" r="2.5" />
        <circle cx="240" cy="128" r="2.5" />
      </g>
      {/* width dimension */}
      <g className={styles.dim} strokeWidth="1">
        <path d="M68 396h324" />
        <path d="M68 390v12M392 390v12" />
        <path d="M76 392l-8 4 8 4M384 392l8 4-8 4" />
      </g>
      <text x="230" y="386" textAnchor="middle" className={styles.dimText}>W 1200 mm</text>
      {/* diameter dimension */}
      <g className={styles.dim} strokeWidth="1">
        <path d="M452 188v164" />
        <path d="M446 188h12M446 352h12" />
        <path d="M448 196l4-8 4 8M448 344l4 8 4-8" />
      </g>
      <text x="466" y="274" textAnchor="middle" className={styles.dimText} transform="rotate(90 466 274)">Ø 800 mm</text>
      {/* callout */}
      <g className={styles.dim} strokeWidth="1">
        <path d="M262 74 L330 34 h96" />
      </g>
      <text x="356" y="28" className={styles.dimText}>BOPP-5L / 30 µm</text>
    </svg>
  )
}

function Home() {
  const { t } = useLanguage()

  const categories = [
    { id: 'hdpe_bags', code: 'CAT-01', name: t('home.categories.hdpe_bags'), Icon: BagIcon },
    { id: 'bopp_film', code: 'CAT-02', name: t('home.categories.bopp_film'), Icon: FilmRollIcon },
    { id: 'yarn', code: 'CAT-03', name: t('home.categories.yarn'), Icon: YarnIcon },
    { id: 'ldpe_film', code: 'CAT-04', name: t('home.categories.ldpe_film'), Icon: LayersIcon },
  ]

  const stats = [
    { value: '15+', label: t('home.proof.years') },
    { value: '12,000', label: t('home.proof.capacity') },
    { value: '350+', label: t('home.proof.buyers') },
    { value: '98%', label: t('home.proof.ontime') },
  ]

  const trustItems = [
    { Icon: ShieldCheckIcon, text: t('home.trust.certified') },
    { Icon: ClockIcon, text: t('home.trust.experience') },
    { Icon: StarIcon, text: t('home.trust.quality') },
  ]

  return (
    <div className={styles.home}>
      {/* Hero — engineering document */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              <span className={styles.kickerRule} aria-hidden="true"></span>
              {t('home.hero.badge')}
            </p>
            <h1 className={styles.heroTitle}>{t('home.hero.title')}</h1>
            <p className={styles.heroSubtitle}>{t('home.hero.subtitle')}</p>
            <div className={styles.heroCta}>
              <Link to="/products" className="btn btnPrimary">
                {t('home.hero.cta')}
                <ArrowRightIcon size={16} />
              </Link>
              <Link to="/register" className={`btn btnSecondary ${styles.btnOnLight}`}>
                {t('home.hero.ctaSecondary')}
              </Link>
            </div>

            <dl className={styles.specReadout} aria-label="Production capabilities at a glance">
              {[
                ['GSM', '80–300'],
                ['MOQ', '500+'],
                ['LEAD TIME', '5–7d'],
                ['MAX WIDTH', '1200mm'],
              ].map(([label, value]) => (
                <div key={label} className={styles.specCell}>
                  <dt className={styles.specLabel}>{label}</dt>
                  <dd className={styles.specValue}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.heroFigure}>
            <RollDrawing />
          </div>
        </div>
      </section>

      {/* Proof band */}
      <section className={styles.proof} aria-label="Company track record">
        <div className={`container ${styles.proofGrid}`}>
          {stats.map(stat => (
            <div key={stat.label} className={styles.proofCell}>
              <span className={styles.proofValue}>{stat.value}</span>
              <span className={styles.proofLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <span className={styles.sectionIndex}>01</span>
            <div>
              <h2 className={styles.sectionTitle}>{t('home.categories.title')}</h2>
              <p className={styles.sectionSubtitle}>{t('home.categories.subtitle')}</p>
            </div>
          </header>

          <div className={styles.categoryGrid}>
            {categories.map(({ id, code, name, Icon }) => (
              <Link key={id} to={`/products?category=${id}`} className={styles.categoryCard}>
                <div className={styles.categoryTop}>
                  <span className={styles.categoryCode}>{code}</span>
                  <Icon size={30} className={styles.categoryIcon} />
                </div>
                <span className={styles.categoryName}>{name}</span>
                <span className={styles.categoryLink}>
                  {t('products.viewDetails')}
                  <ArrowRightIcon size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <span className={styles.sectionIndex}>02</span>
            <h2 className={styles.sectionTitle}>{t('home.trust.title')}</h2>
          </header>

          <div className={styles.trustGrid}>
            {trustItems.map(({ Icon, text }) => (
              <div key={text} className={styles.trustItem}>
                <Icon size={22} className={styles.trustIcon} />
                <span className={styles.trustText}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className={styles.ctaBand}>
        <div className={`container ${styles.ctaBandInner}`}>
          <div>
            <h2 className={styles.ctaBandTitle}>{t('home.ctaBand.title')}</h2>
            <p className={styles.ctaBandText}>{t('home.ctaBand.text')}</p>
          </div>
          <Link to="/register" className={`btn btnPrimary ${styles.ctaBandBtn}`}>
            {t('home.ctaBand.button')}
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
