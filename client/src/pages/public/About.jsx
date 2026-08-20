import { useLanguage } from '../../context/LanguageContext'
import styles from './About.module.css'

function About() {
  const { t } = useLanguage()

  const certifications = [
    { name: 'ISO 9001:2015', description: 'Quality Management System' },
    { name: 'ISO 14001:2015', description: 'Environmental Management System' },
    { name: 'BSCI', description: 'Business Social Compliance Initiative' },
  ]

  return (
    <div className={styles.about}>
      <div className="container">
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>About PolyConnect</h1>
          <p className={styles.heroSubtitle}>
            Leading manufacturer of poly packaging materials and textile raw materials in Bangladesh since 2008.
          </p>
        </section>

        {/* Company Story */}
        <section className={styles.story}>
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
          <div className={styles.storyImage}>
            <div className={styles.imagePlaceholder}>🏭</div>
          </div>
        </section>

        {/* Certifications */}
        <section className={styles.certifications}>
          <h2 className={styles.sectionTitle}>Certifications & Compliance</h2>
          <div className={styles.certGrid}>
            {certifications.map((cert, idx) => (
              <div key={idx} className={styles.certCard}>
                <span className={styles.certIcon}>✓</span>
                <div className={styles.certInfo}>
                  <h3 className={styles.certName}>{cert.name}</h3>
                  <p className={styles.certDesc}>{cert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className={styles.values}>
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h3 className={styles.valueTitle}>Quality First</h3>
              <p className={styles.valueText}>
                Every product undergoes rigorous quality testing. Our in-house QA lab ensures 
                consistency and reliability in every batch.
              </p>
            </div>
            <div className={styles.valueCard}>
              <h3 className={styles.valueTitle}>Customer Focus</h3>
              <p className={styles.valueText}>
                We understand the unique needs of the RMG industry and provide tailored solutions 
                that meet specific requirements.
              </p>
            </div>
            <div className={styles.valueCard}>
              <h3 className={styles.valueTitle}>Sustainability</h3>
              <p className={styles.valueText}>
                Committed to environmentally responsible manufacturing practices and 
                sustainable packaging solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className={styles.contact}>
          <h2 className={styles.sectionTitle}>Contact Us</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>Address</h3>
              <p className={styles.contactValue}>
                Polynagar Industrial Area<br />
                Dhaka-1207, Bangladesh
              </p>
            </div>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>Phone</h3>
              <p className={styles.contactValue}>+880 1XXXXXXXXX</p>
            </div>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>Email</h3>
              <p className={styles.contactValue}>info@polyconnect.com</p>
            </div>
            <div className={styles.contactItem}>
              <h3 className={styles.contactLabel}>Business Hours</h3>
              <p className={styles.contactValue}>
                Sunday - Thursday: 9:00 AM - 6:00 PM<br />
                Friday: Closed
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
