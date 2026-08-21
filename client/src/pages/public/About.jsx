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
  return (
    <svg
      className={styles.drawing}
      viewBox="0 0 480 360"
      fill="none"
      role="img"
      aria-label="Technical drawing of the manufacturing facility"
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
      <text x="240" y="352" textAnchor="middle" className={styles.dimText}>POLYNAGAR PLANT — HALL A</text>
    </svg>
  )
}

function About() {
  const certifications = [
    { name: 'ISO 9001:2015', description: 'Quality Management System' },
    { name: 'ISO 14001:2015', description: 'Environmental Management System' },
    { name: 'BSCI', description: 'Business Social Compliance Initiative' },
  ]

  const values = [
    {
      code: 'V-01',
      title: 'Quality First',
      text: 'Every product undergoes rigorous quality testing. Our in-house QA lab ensures consistency and reliability in every batch.',
    },
    {
      code: 'V-02',
      title: 'Customer Focus',
      text: 'We understand the unique needs of the RMG industry and provide tailored solutions that meet specific requirements.',
    },
    {
      code: 'V-03',
      title: 'Sustainability',
      text: 'Committed to environmentally responsible manufacturing practices and sustainable packaging solutions.',
    },
  ]

  return (
    <div className={styles.about}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.kicker}>
            <span className={styles.kickerRule} aria-hidden="true"></span>
            ABOUT POLYCONNECT
          </p>
          <h1 className={styles.heroTitle}>About PolyConnect</h1>
          <p className={styles.heroSubtitle}>
            Leading manufacturer of poly packaging materials and textile raw materials in Bangladesh since 2008.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className={styles.section}>
        <div className={`container ${styles.storyGrid}`}>
          <div className={styles.storyContent}>
            <h2 className={styles.sectionTitle}>Our Story</h2>
            <p>
              PolyConnect started as a small manufacturing unit in Dhaka, Bangladesh, with a vision to provide
              high-quality poly packaging solutions to the Ready-Made Garment (RMG) industry. Over the years,
              we have grown into one of the most trusted names in poly packaging and textile raw materials.
            </p>
            <p>
              Our state-of-the-art manufacturing facility produces HDPE woven sacks, BOPP films, LDPE shrink
              films, and PP yarn that meet international quality standards. We serve RMG exporters, garment
              factories, and industrial clients across Bangladesh and beyond.
            </p>
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
            <h2 className={styles.sectionTitle}>Certifications &amp; Compliance</h2>
          </header>
          <div className={styles.certGrid}>
            {certifications.map((cert) => (
              <div key={cert.name} className={styles.certCard}>
                <ShieldCheckIcon size={26} className={styles.certIcon} />
                <div className={styles.certInfo}>
                  <h3 className={styles.certName}>{cert.name}</h3>
                  <p className={styles.certDesc}>{cert.description}</p>
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
            <h2 className={styles.sectionTitle}>Our Values</h2>
          </header>
          <div className={styles.valuesGrid}>
            {values.map((value) => (
              <div key={value.code} className={styles.valueCard}>
                <span className={styles.valueCode}>{value.code}</span>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueText}>{value.text}</p>
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
            <h2 className={styles.sectionTitle}>Contact Us</h2>
          </header>
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>
                <MapPinIcon size={16} /> Address
              </h3>
              <p className={styles.contactValue}>
                Polynagar Industrial Area<br />
                Dhaka-1207, Bangladesh
              </p>
            </div>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>
                <PhoneIcon size={16} /> Phone
              </h3>
              <p className={styles.contactValue}>
                <a href={CONTACT.phoneTel} className={styles.contactLink}>{CONTACT.phoneDisplay}</a>
              </p>
            </div>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>
                <WhatsAppIcon size={16} /> WhatsApp
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
                <MailIcon size={16} /> Email
              </h3>
              <p className={styles.contactValue}>
                <a href={`mailto:${CONTACT.email}`} className={styles.contactLink}>{CONTACT.email}</a>
              </p>
            </div>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>
                <ClockIcon size={16} /> Business Hours
              </h3>
              <p className={styles.contactValue}>
                Sunday - Thursday: 9:00 AM - 6:00 PM<br />
                Friday: Closed
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
