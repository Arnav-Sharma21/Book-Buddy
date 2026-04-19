import { motion } from 'framer-motion'

/* ── page-level animation variants ───────────────────────────── */
const pageVariants = {
  initial:  { opacity: 0, y: 16, rotate: 0.4, scale: 0.98 },
  animate:  { opacity: 1, y: 0,  rotate: 0,   scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:     { opacity: 0, y: -12, scale: 0.97,
    transition: { duration: 0.25, ease: 'easeIn' } },
}

/* Stagger container for children */
export const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

/* Individual child fade-up */
export const fadeUp = {
  initial:  { opacity: 0, y: 18 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

/* Small hand-drawn corner bracket */
function CornerBracket({ position = 'tl' }) {
  const transforms = {
    tl: 'rotate(0deg)',
    tr: 'rotate(90deg)',
    br: 'rotate(180deg)',
    bl: 'rotate(270deg)',
  }
  const positions = {
    tl: { top: 8,  left: 8 },
    tr: { top: 8,  right: 8 },
    br: { bottom: 8, right: 8 },
    bl: { bottom: 8, left: 8 },
  }
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
      style={{ position:'absolute', ...positions[position],
        transform: transforms[position], opacity: 0.12, pointerEvents:'none' }}
      aria-hidden="true"
    >
      <path d="M2,20 L2,2 L20,2" stroke="var(--color-ink)"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

/* Tiny floating doodle star */
function FloatingStar({ x, y, size = 10, delay = 0 }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ position:'absolute', left: x, top: y, opacity: 0.1, pointerEvents:'none' }}
      animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease:'easeInOut', delay }}
      aria-hidden="true"
    >
      <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"
        stroke="var(--color-ink)" strokeWidth="1.8" strokeLinejoin="round"/>
    </motion.svg>
  )
}

export default function PageWrapper({ children }) {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        maxWidth: '1060px',
        marginInline: 'auto',
        padding: '2.5rem 2rem',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Corner bracket decorations */}
      <CornerBracket position="tl" />
      <CornerBracket position="tr" />
      <CornerBracket position="br" />
      <CornerBracket position="bl" />

      {/* Subtle floating doodles */}
      <FloatingStar x="5%"  y="8%"  size={12} delay={0}   />
      <FloatingStar x="92%" y="12%" size={9}  delay={1.2} />
      <FloatingStar x="88%" y="75%" size={11} delay={2.1} />
      <FloatingStar x="3%"  y="80%" size={8}  delay={0.7} />

      {children}
    </motion.main>
  )
}
