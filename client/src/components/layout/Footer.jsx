import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { PhoneIcon, MailIcon, MapPinIcon, WhatsAppIcon } from '../common/Icons'
import { CONTACT } from '../../config/contact'
import styles from './Footer.module.css'

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.footerSection}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogoMark} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16v10H4z" />
                <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
                <path d="M4 11h16" />
              </svg>
            </span>
            <span className={styles.footerLogoText}>PolyConnect</span>
          </div>
          <p className={styles.footerText}>{t('footer.aboutText')}</p>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{t('footer.quickLinks')}</h3>
          <nav className={styles.footerNav} aria-label="Footer navigation">
            <Link to="/products" className={styles.footerLink}>{t('nav.products')}</Link>
            <Link to="/about" className={styles.footerLink}>{t('nav.about')}</Link>
            <Link to="/login" className={styles.footerLink}>{t('nav.login')}</Link>
          </nav>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>{t('footer.contact')}</h3>
          <address className={styles.footerAddress}>
            <p className={styles.contactLine}>
              <MapPinIcon size={18} className={styles.contactIcon} />
              <span>{t('footer.address')}</span>
            </p>
            <a href={CONTACT.phoneTel} className={styles.contactLine}>
              <PhoneIcon size={18} className={styles.contactIcon} />
              <span>{CONTACT.phoneDisplay}</span>
            </a>
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLine}
            >
              <WhatsAppIcon size={18} className={styles.contactIcon} />
              <span>WhatsApp: {CONTACT.phoneDisplay}</span>
            </a>
            <a href={`mailto:${CONTACT.email}`} className={styles.contactLine}>
              <MailIcon size={18} className={styles.contactIcon} />
              <span>{CONTACT.email}</span>
            </a>
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
