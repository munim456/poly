import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import styles from './Footer.module.css'

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{t('footer.about')}</h3>
          <p className={styles.footerText}>{t('footer.aboutText')}</p>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{t('footer.quickLinks')}</h3>
          <nav className={styles.footerNav}>
            <Link to="/products" className={styles.footerLink}>{t('nav.products')}</Link>
            <Link to="/about" className={styles.footerLink}>{t('nav.about')}</Link>
            <Link to="/login" className={styles.footerLink}>{t('nav.login')}</Link>
          </nav>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{t('footer.contact')}</h3>
          <address className={styles.footerAddress}>
            <p>{t('footer.address')}</p>
            <p>{t('footer.phone')}</p>
            <p>{t('footer.email')}</p>
          </address>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
