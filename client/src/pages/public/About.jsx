import { useLanguage } from '../../context/LanguageContext'
import {
  ShieldCheckIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  WhatsAppIcon,
  ClockIcon,
} from '../../components/common/Icons'
import { CONTACT } from '../../config/contact'
import styles from './About.module.css'

function FacilityDrawing() {
  const { t } = useLanguage()
  return (
    <svg
      className={styles.drawing}
      viewBox="0 0 480 360"
      fill="none"
      role="img"
      aria-label={t('about.facilityDrawing')}
    >
      <g stroke="currentColor" strokeWidth="1.5">
        <path d="M60 300V160l90 56v-56l90 56v-56l90 56v84H60Z" />
        <path d="M330 216V96h90v204h-90" />
        <path d="M348 120h20M382 120h20M348 150h20M382 150h20M348 180h20M382 180h20" />
      </g>
      <g stroke="currentColor" strokeWidth="1" opacity="0.5">
        <path d="M100 300v-40h30v40M170 300v-40h30v40M240 300v-40h30v40" />
      </g>
      <g stroke="#2F86EB" strokeWidth="1" fill="none">
        <path d="M40 332h400" />
        <path d="M40 326v12M440 326v12" />
      </g>
      <text x="240" y="352" textAnchor="middle" className={styles.dimText}>
        {t('about.plantLabel')}
      </text>
    </svg>
  )
}

function About() {
  const { t } = useLanguage()

  const certifications = [
    { name: 'ISO 9001:2015', descKey: 'about.iso9001Desc' },
    { name: 'ISO 14001:2015', descKey: 'about.iso14001Desc' },
    { name: 'BSCI', descKey: 'about.bsciDesc' },
  ]

  const values = [
    { code: 'V-01', titleKey: 'about.v1Title', textKey: 'about.v1Text' },
    { code: 'V-02', titleKey: 'about.v2Title', textKey: 'about.v2Text' },
    { code: 'V-03', titleKey: 'about.v3Title', textKey: 'about.v3Text' },
  ]

  return (
    <div className={styles.about}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.kicker}>
            <span className={styles.kickerRule} aria-hidden="true"></span>
            {t('about.kicker').toUpperCase()}
          </p>
          <h1 className={styles.heroTitle}>{t('about.heroTitle')}</h1>
          <p className={styles.heroSubtitle}>{t('about.heroSubtitle')}</p>
        </div>
      </section>

      {/* Company Story */}
      <section className={styles.section}>
        <div className={`container ${styles.storyGrid}`}>
          <div className={styles.storyContent}>
            <h2 className={styles.sectionTitle}>{t('about.ourStory')}</h2>
            <p>{t('about.story1')}</p>
            <p>{t('about.story2')}</p>
          </div>
          <div className={styles.storyFigure}>
            <FacilityDrawing />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <span className={styles.sectionIndex}>01</span>
            <h2 className={styles.sectionTitle}>{t('about.certTitle')}</h2>
          </header>
          <div className={styles.certGrid}>
            {certifications.map((cert) => (
              <div key={cert.name} className={styles.certCard}>
                <ShieldCheckIcon size={26} className={styles.certIcon} />
                <div className={styles.certInfo}>
                  <h3 className={styles.certName}>{cert.name}</h3>
                  <p className={styles.certDesc}>{t(cert.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.section}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <span className={styles.sectionIndex}>02</span>
            <h2 className={styles.sectionTitle}>{t('about.valuesTitle')}</h2>
          </header>
          <div className={styles.valuesGrid}>
            {values.map((value) => (
              <div key={value.code} className={styles.valueCard}>
                <span className={styles.valueCode}>{value.code}</span>
                <h3 className={styles.valueTitle}>{t(value.titleKey)}</h3>
                <p className={styles.valueText}>{t(value.textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <span className={styles.sectionIndex}>03</span>
            <h2 className={styles.sectionTitle}>{t('about.contactTitle')}</h2>
          </header>
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>
                <MapPinIcon size={16} /> {t('about.address')}
              </h3>
              <p className={styles.contactValue}>
                Polynagar Industrial Area<br />
                Dhaka-1207, Bangladesh
              </p>
            </div>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>
                <PhoneIcon size={16} /> {t('about.phone')}
              </h3>
              <p className={styles.contactValue}>
                <a href={CONTACT.phoneTel} className={styles.contactLink}>{CONTACT.phoneDisplay}</a>
              </p>
            </div>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>
                <WhatsAppIcon size={16} /> {t('about.whatsapp')}
              </h3>
              <p className={styles.contactValue}>
                <a
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  {CONTACT.phoneDisplay}
                </a>
              </p>
            </div>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>
                <MailIcon size={16} /> {t('about.email')}
              </h3>
              <p className={styles.contactValue}>
                <a href={`mailto:${CONTACT.email}`} className={styles.contactLink}>{CONTACT.email}</a>
              </p>
            </div>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>
                <ClockIcon size={16} /> {t('about.businessHours')}
              </h3>
              <p className={styles.contactValue}>
                {t('about.hours1')}<br />
                {t('about.hours2')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
