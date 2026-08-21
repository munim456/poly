import { WhatsAppIcon } from './Icons'
import { CONTACT } from '../../config/contact'
import styles from './WhatsAppFloat.module.css'

function WhatsAppFloat() {
  return (
    <a
      href={CONTACT.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.float}
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon size={26} className={styles.icon} />
    </a>
  )
}

export default WhatsAppFloat
