import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import styles from './Header.module.css'

function Header() {
  const { user, logout } = useAuth()
  const { t, language, toggleLanguage } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
      <div className={`container ${styles.headerContainer}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>PC</span>
          <span className={styles.logoText}>PolyConnect</span>
        </Link>

        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
          <Link to="/" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            {t('nav.home')}
          </Link>
          <Link to="/products" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            {t('nav.products')}
          </Link>
          <Link to="/about" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            {t('nav.about')}
          </Link>

          <div className={styles.navRight}>
            <button 
              className={styles.langToggle}
              onClick={toggleLanguage}
              aria-label="Toggle language"
            >
              {language === 'en' ? 'বাং' : 'EN'}
            </button>

            {user ? (
              <>
                <Link to={getDashboardLink()} className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.dashboard')}
                </Link>
                <button onClick={handleLogout} className={styles.btnOutline}>
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" className={styles.btnPrimary} onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </nav>

        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`}></span>
        </button>
      </div>
    </header>
  )
}

export default Header
