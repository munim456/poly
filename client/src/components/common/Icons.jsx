function Svg({ size = 24, className, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

export function BagIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 8V7a6 6 0 0 1 12 0v1" />
      <path d="M4 8h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9L4 8Z" />
      <path d="M9 12v3a3 3 0 0 0 6 0v-3" />
    </Svg>
  )
}

export function FilmRollIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="10" cy="12" r="7.5" />
      <circle cx="10" cy="12" r="2.5" />
      <path d="M17.5 6.5 21 8v8l-3.5 1.5" />
      <path d="M10 4.5v2M10 17.5v2M4.6 8.2l1.8 1M13.6 14.8l1.8 1M4.6 15.8l1.8-1M13.6 9.2l1.8-1" />
    </Svg>
  )
}

export function YarnIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M4.2 9.5c5-3.5 10.6-3.5 15.6 0" />
      <path d="M3.6 13.5c5.5 3.5 11.3 3.5 16.8 0" />
      <path d="M8 19.6c2.5-4.5 2.5-10.7 0-15.2" />
    </Svg>
  )
}

export function LayersIcon(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="16" height="4.5" rx="1" />
      <rect x="4" y="9.75" width="16" height="4.5" rx="1" opacity="0.62" />
      <rect x="4" y="15.5" width="16" height="4.5" rx="1" opacity="0.32" />
    </Svg>
  )
}

export function CheckCircleIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.2 2.4 2.4 4.6-5" />
    </Svg>
  )
}

export function ClockIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 1.8" />
    </Svg>
  )
}

export function ShieldCheckIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8L12 3Z" />
      <path d="m9 11.8 2.2 2.2 3.8-4.2" />
    </Svg>
  )
}

export function StarIcon(props) {
  return (
    <Svg {...props}>
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
    </Svg>
  )
}

export function SearchIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </Svg>
  )
}

export function ArrowRightIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 12h16" />
      <path d="m13 5 7 7-7 7" />
    </Svg>
  )
}

export function MenuIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </Svg>
  )
}

export function CloseIcon(props) {
  return (
    <Svg {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Svg>
  )
}

export function PhoneIcon(props) {
  return (
    <Svg {...props}>
      <path d="M5 4h4l1.5 4.5-2.2 1.6a12.5 12.5 0 0 0 5.6 5.6l1.6-2.2L20 15v4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
    </Svg>
  )
}

export function MailIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Svg>
  )
}

export function WhatsAppIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" />
      <path d="M8.8 7.8c.2-.5.4-.5.7-.5h.6c.2 0 .4 0 .6.5s.7 1.7.7 1.8c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 1.9 1.3 2.2 1.4.3.2.4.1.6-.1l.7-.8c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3a1.4 1.4 0 0 1-.1.8 2.3 2.3 0 0 1-1.5 1.4 3 3 0 0 1-1.5.1 12 12 0 0 1-5.9-3.7A8.4 8.4 0 0 1 7.5 10a3 3 0 0 1 .3-1.7Z" />
    </Svg>
  )
}

export function MapPinIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  )
}

export function FactoryIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 21V8.5l5.5 3.5v-3.5L14 12V8.5l5.5 3.5H21V21H3Z" />
      <path d="M6.5 17.5h2M11 17.5h2M15.5 17.5h2" />
    </Svg>
  )
}
