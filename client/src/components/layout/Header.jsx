import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { MenuIcon, CloseIcon, PhoneIcon, MailIcon } from '../common/Icons'
import styles from './Header.module.css'

function LogoMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16v10H4z" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M4 11h16" />
    </svg>
  )
}

function Header() {
  const { user, logout } = useAuth()
  const { t, language, toggleLanguage } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    navigate('/')
  }

  const closeMenu = () => setMobileMenuOpen(false)

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'owner':
        return '/admin/dashboard'
      case 'sales':
        return '/sales/dashboard'
      case 'quality':
        return '/quality/dashboard'
      case 'buyer':
        return '/buyer/dashboard'
      default:
        return '/'
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.utilityBar}>
        <div className={`container ${styles.utilityInner}`}>
          <p className={styles.utilityItem}>
            POLYCONNECT INDUSTRIES LTD — DHAKA, BANGLADESH
          </p>
          <div className={styles.utilityRight}>
            <a href="tel:+8801XXXXXXXXX" className={styles.utilityLink}>
              <PhoneIcon size={13} />
              +880 1XXX-XXXXXX
            </a>
            <a href="mailto:info@polyconnect.com" className={styles.utilityLink}>
              <MailIcon size={13} />
              info@polyconnect.com
            </a>
          </div>
        </div>
      </div>

      <div className={styles.mainBar}>
        <div className={`container ${styles.mainInner}`}>
          <Link to="/" className={styles.logo} onClick={closeMenu}>
            <span className={styles.logoMark}><LogoMark /></span>
            <span className={styles.logoText}>PolyConnect</span>
          </Link>

          <nav
            id="main-nav"
            className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}
            aria-label="Main navigation"
          >
            <Link to="/" className={styles.navLink} onClick={closeMenu}>
              {t('nav.home')}
            </Link>
            <Link to="/products" className={styles.navLink} onClick={closeMenu}>
              {t('nav.products')}
            </Link>
            <Link to="/about" className={styles.navLink} onClick={closeMenu}>
              {t('nav.about')}
            </Link>

            <div className={styles.navRight}>
              <button
                type="button"
                className={styles.langToggle}
                onClick={toggleLanguage}
                aria-label={language === 'en' ? 'Switch to Bangla' : 'Switch to English'}
              >
                {language === 'en' ? 'বাং' : 'EN'}
              </button>

              {user ? (
                <>
                  <Link to={getDashboardLink()} className={styles.navLink} onClick={closeMenu}>
                    {t('nav.dashboard')}
                  </Link>
                  <button type="button" onClick={handleLogout} className={`btn btnSecondary ${styles.btnCompact}`}>
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={styles.navLink} onClick={closeMenu}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className={`btn btnPrimary ${styles.btnCompact}`} onClick={closeMenu}>
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </nav>

          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="main-nav"
          >
            {mobileMenuOpen ? <CloseIcon size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
