/**
 * DoodleIcons — hand-drawn SVG icons that replace emoji characters.
 * All icons use stroke-only (no fill) with slightly wobbly paths to feel sketched.
 * Usage: <BookIcon size={24} /> — pass size and optional style/className props.
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// ── shared wrapper ──────────────────────────────────────────────────
function Icon({ size = 24, strokeWidth = 2, style = {}, children, title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...base}
      strokeWidth={strokeWidth}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  )
}

// ── icons ────────────────────────────────────────────────────────────

/** 📖  open book */
export function BookOpenIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M2 4.5C2 4.5 7 3 12 5c5-2 10-.5 10-.5V20s-5-1.5-10 .5C7 18.5 2 20 2 20V4.5z" />
      <line x1="12" y1="5" x2="12" y2="20.5" />
    </Icon>
  )
}

/** 📚  stacked books */
export function BooksIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <rect x="3" y="14" width="5" height="8" rx="0.5" />
      <rect x="9.5" y="10" width="5" height="12" rx="0.5" />
      <rect x="16" y="6" width="5" height="16" rx="0.5" />
      <line x1="2" y1="22" x2="22" y2="22" />
    </Icon>
  )
}

/** ✅  checkmark circle */
export function CheckCircleIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <circle cx="12" cy="12" r="9.5" />
      <polyline points="7.5,12 10.5,15 16.5,9" />
    </Icon>
  )
}

/** 📋  clipboard / want-to-read */
export function ClipboardIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M6 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-2" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="14" y2="15" />
    </Icon>
  )
}

/** 🗑️  trash can / dropped */
export function TrashIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </Icon>
  )
}

/** ✏️  pencil */
export function PencilIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M12 20H21" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </Icon>
  )
}

/** ⭐  star */
export function StarFilledIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
    </Icon>
  )
}

/** 🔍  magnifying glass */
export function SearchIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <circle cx="11" cy="11" r="7.5" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </Icon>
  )
}

/** 📍  map pin */
export function MapPinIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </Icon>
  )
}

/** 📓  notebook */
export function NotebookIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <rect x="5" y="2" width="14" height="20" rx="1" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
      <line x1="5" y1="6" x2="3" y2="6" />
      <line x1="5" y1="10" x2="3" y2="10" />
      <line x1="5" y1="14" x2="3" y2="14" />
      <line x1="5" y1="18" x2="3" y2="18" />
    </Icon>
  )
}

/** 🔤  text / words (Aa style) */
export function TextIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <polyline points="4,20 8,4 12,20" />
      <line x1="5.5" y1="14" x2="10.5" y2="14" />
      <path d="M15 10c2.5-2.5 7 0 7 4v6" />
      <path d="M15 14c0 2 1.5 4 4 4 2 0 3-1 3-2.5" />
      <line x1="15" y1="14" x2="22" y2="14" />
    </Icon>
  )
}

/** 🎭  masks / preferences */
export function TheatreIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M2 10c0-4 3-7 7-7s8 3 8 7" />
      <path d="M9 3c0 4-3 7-7 7" />
      <path d="M9 3c0 4 3 7 7 7" />
      <path d="M7 12c.5 1.5 1.5 3 3 3s2.5-1.5 3-3" />
      <path d="M14 10c0 4 3 7 7 7s3-3 3-7" />
      <path d="M14 10c2 0 4 1 5 3" />
      <path d="M21 17c-.5 1.5-1.5 3-3 3s-2.5-1.5-3-3" />
    </Icon>
  )
}

/** 💡  lightbulb */
export function LightbulbIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M9 21h6" />
      <path d="M10 17h4" />
      <path d="M12 2a7 7 0 0 1 5 12c-.5.7-1 1.3-1 3H8c0-1.7-.5-2.3-1-3a7 7 0 0 1 5-12z" />
    </Icon>
  )
}

/** 📊  bar chart / progress */
export function BarChartIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <rect x="2" y="14" width="4" height="8" />
      <rect x="9" y="9" width="4" height="13" />
      <rect x="16" y="4" width="4" height="18" />
      <line x1="1" y1="22" x2="23" y2="22" />
    </Icon>
  )
}

/** 📌  thumbtack */
export function PinIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-2l-2-6V5h1V3H6v2h1v4l-2 6v2z" />
    </Icon>
  )
}

/** 🥇  first place medal */
export function MedalIcon({ size = 24, strokeWidth = 2, style, number = 1 }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <circle cx="12" cy="15" r="7" />
      <path d="M8.5 5L12 2l3.5 3" />
      <line x1="12" y1="2" x2="12" y2="8" />
      <text
        x="12" y="19"
        textAnchor="middle"
        fontSize="8"
        fill="currentColor"
        stroke="none"
        fontWeight="bold"
        fontFamily="monospace"
      >
        {number}
      </text>
    </Icon>
  )
}

/** 📧  envelope / email */
export function MailIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <rect x="2" y="4" width="20" height="16" rx="1" />
      <polyline points="2,4 12,13 22,4" />
    </Icon>
  )
}

/** ⚠️  warning triangle */
export function WarningIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M10.3 3.5L2 20h20L13.7 3.5a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <circle cx="12" cy="17.5" r="0.5" strokeWidth="2.5" />
    </Icon>
  )
}

/** 👋  wave hand */
export function WaveIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M9 2l-.5 3" />
      <path d="M11 2l-.5 3" />
      <path d="M7.5 3.5C7 3 6 3 6 4.5L5.5 12c-.5 3 2 8 6 8s7-4 7-8V8c0-1.5-1-2-2-1l-1 1" />
      <path d="M10.5 5.5L9 11" />
      <path d="M12.5 5L11 11" />
      <path d="M14.5 6.5L13 12" />
    </Icon>
  )
}

/** ☕  coffee cup */
export function CoffeeIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </Icon>
  )
}

/** ✨  sparkles */
export function SparkleIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <path d="M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  )
}

/** 📡  antenna / signal */
export function AntennaIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <line x1="12" y1="22" x2="12" y2="10" />
      <path d="M8 14a6 6 0 0 0 0-4" />
      <path d="M16 14a6 6 0 0 1 0-4" />
      <path d="M5 17a10 10 0 0 1 0-10" />
      <path d="M19 17a10 10 0 0 0 0-10" />
      <circle cx="12" cy="10" r="1.5" />
    </Icon>
  )
}

/** 📏  ruler */
export function RulerIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <rect x="2" y="8" width="20" height="8" rx="1" transform="rotate(-45 12 12)" />
      <line x1="9" y1="9" x2="9" y2="12" />
      <line x1="12" y1="6" x2="12" y2="8" />
      <line x1="15" y1="9" x2="15" y2="12" />
    </Icon>
  )
}

/** 🔄  refresh arrows */
export function RefreshIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <polyline points="23,4 23,10 17,10" />
      <polyline points="1,20 1,14 7,14" />
      <path d="M3.5 9a9 9 0 0 1 14.8-3.3L23 10M1 14l4.7 4.3A9 9 0 0 0 20.5 15" />
    </Icon>
  )
}

/** ✓  simple check */
export function CheckIcon({ size = 24, strokeWidth = 2.5, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <polyline points="4,12 9,17 20,6" />
    </Icon>
  )
}

/** + add symbol */
export function PlusIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Icon>
  )
}

/** → right arrow */
export function ArrowRightIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="14,6 20,12 14,18" />
    </Icon>
  )
}

/** ✕ close / X */
export function CloseIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Icon>
  )
}

/** 📄  page / pages */
export function PageIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </Icon>
  )
}

/** 🏷️  tag / label */
export function TagIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M20.6 10.6l-9.2-9.2A2 2 0 0 0 10 1H4a3 3 0 0 0-3 3v6a2 2 0 0 0 .6 1.4l9.2 9.2a2 2 0 0 0 2.8 0l7-7a2 2 0 0 0 0-2.8z" />
      <circle cx="6.5" cy="6.5" r="1" />
    </Icon>
  )
}

/** 📭  mailbox empty */
export function MailboxIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M22 17H2a3 3 0 0 0 3-3V9a3 3 0 0 1 6 0v5h2V9a3 3 0 1 1 6 0v5a3 3 0 0 0 3 3z" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </Icon>
  )
}

/** 🔖  save / bookmark */
export function BookmarkIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Icon>
  )
}

/** 💾  floppy / save */
export function SaveIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </Icon>
  )
}

/**  ✦ genre match sparkle (small diamond) */
export function DiamondIcon({ size = 14, strokeWidth = 2, style }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} style={style}>
      <polygon points="12,2 22,12 12,22 2,12" />
    </Icon>
  )
}
