import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DoodleBackground from '../components/ui/DoodleBackground'
import EdgeMarginDoodles from '../components/ui/EdgeMarginDoodles'
import {
  BooksIcon, PencilIcon, SearchIcon, MapPinIcon,
  NotebookIcon, BookOpenIcon, TextIcon, CoffeeIcon, SparkleIcon
} from '../components/ui/DoodleIcons'

// ─────────────────────────────────────────────────────────────
//  LOADING SCREEN  (inlined — no separate file needed)
// ─────────────────────────────────────────────────────────────
const mkDraw = (delay, duration = 0.45) => ({
  initial:    { pathLength: 0, opacity: 0 },
  animate:    { pathLength: 1, opacity: 1 },
  transition: { delay, duration, ease: 'easeInOut' },
})

function LoadingScreen({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2700)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--color-paper)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1.6rem',
      }}
    >
      {/* ── Book sketch ── */}
      <svg width="160" height="130" viewBox="0 0 120 105"
        fill="none" stroke="var(--color-ink)" strokeLinecap="round" strokeLinejoin="round">

        <motion.path d="M 60,16 L 10,30 L 10,90 L 60,78 Z"
          strokeWidth="2.5" {...mkDraw(0, 0.55)} />
        <motion.path d="M 60,16 L 110,30 L 110,90 L 60,78 Z"
          strokeWidth="2.5" {...mkDraw(0.3, 0.55)} />
        <motion.path d="M 60,16 L 60,78"
          strokeWidth="3"   {...mkDraw(0.58, 0.22)} />

        <motion.path d="M 20,50 L 53,44" strokeWidth="1.7" {...mkDraw(0.78, 0.28)} />
        <motion.path d="M 20,60 L 53,54" strokeWidth="1.7" {...mkDraw(0.88, 0.28)} />
        <motion.path d="M 20,70 L 43,65" strokeWidth="1.7" {...mkDraw(0.98, 0.22)} />
        <motion.path d="M 67,44 L 100,50" strokeWidth="1.7" {...mkDraw(0.78, 0.28)} />
        <motion.path d="M 67,54 L 100,60" strokeWidth="1.7" {...mkDraw(0.88, 0.28)} />
        <motion.path d="M 67,65 L 90,70"  strokeWidth="1.7" {...mkDraw(0.98, 0.22)} />

        <motion.path d="M 10,90 Q 7,96 13,92" strokeWidth="1.5" {...mkDraw(1.15, 0.18)} />

        <motion.polygon
          points="60,4 61.8,9 67,9 62.9,12 64.5,17 60,14 55.5,17 57.1,12 53,9 58.2,9"
          strokeWidth="1.2" fill="var(--color-ink)" stroke="var(--color-ink)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7, scale: 1 }}
          style={{ transformOrigin: '60px 10px' }}
          transition={{ delay: 1.25, duration: 0.25, type: 'spring', stiffness: 300 }}
        />
      </svg>

      {/* ── Title ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.4 }}
        style={{ fontFamily: 'var(--font-sketch)', fontSize: '2.8rem', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.01em', lineHeight: 1 }}
      >
        BookBuddy
      </motion.div>

      {/* ── Subtitle ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.38, duration: 0.35 }}
        style={{ fontFamily: 'var(--font-study)', fontSize: '1rem', color: 'var(--color-pencil)', letterSpacing: '0.06em', marginTop: '-0.5rem' }}
      >
        opening your notebook…
      </motion.div>

      {/* ── Sketchy progress bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        style={{ width: 220, marginTop: '0.2rem' }}
      >
        <svg width="220" height="18" viewBox="0 0 220 18" fill="none" style={{ display: 'block', overflow: 'visible' }}>
          <path d="M 4,9 Q 110,7 216,9" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" opacity={0.12} />
          <motion.path
            d="M 4,9 Q 110,7 216,9"
            stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.5, duration: 1.0, ease: 'easeInOut' }}
          />
          <motion.circle cx="216" cy="9" r="3.5" fill="var(--color-ink)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: '216px 9px' }}
            transition={{ delay: 2.5, duration: 0.18, type: 'spring', stiffness: 400 }}
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
//  DECORATION HELPERS
// ─────────────────────────────────────────────────────────────
const Star = ({ size = 20, opacity = 0.55 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" style={{ display: 'inline-block', opacity }}>
    <polygon points="12,2 14.5,9 22,9 16,13.5 18.5,20.5 12,16 5.5,20.5 8,13.5 2,9 9.5,9" />
  </svg>
)

const Arrow = ({ rotate = 0, size = 44, opacity = 0.5 }) => (
  <svg width={size} height={size / 2.5} viewBox="0 0 64 26" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'inline-block', transform: `rotate(${rotate}deg)`, opacity }}>
    <path d="M4 13 Q28 8 56 13" /><polyline points="46,6 56,13 46,20" />
  </svg>
)

const Zigzag = ({ width = 200, opacity = 0.35 }) => (
  <svg viewBox={`0 0 ${width} 12`} fill="none" style={{ width: '100%', maxWidth: width, display: 'block', opacity }}>
    <path d={`M0,6 ${Array.from({ length: Math.floor(width / 20) }, (_, i) => `L${i * 20 + 10},${i % 2 === 0 ? 2 : 10} L${(i + 1) * 20},6`).join(' ')}`}
      stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const Scribble = ({ children, style = {} }) => (
  <span style={{ position: 'relative', display: 'inline-block', ...style }}>
    {children}
    <svg viewBox="0 0 100 10" preserveAspectRatio="none"
      style={{ position: 'absolute', bottom: -4, left: 0, width: '100%', height: 10, overflow: 'visible' }}>
      <path d="M0,7 Q25,2 50,6 Q75,10 100,5" stroke="var(--color-ink)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    </svg>
  </span>
)

// ─────────────────────────────────────────────────────────────
const LANDING_TITLE_DELAY_S = 0.2
const LANDING_TITLE_DURATION_S = 0.55

// ─────────────────────────────────────────────────────────────
//  PAGE DATA
// ─────────────────────────────────────────────────────────────
const FEATURES = [
  { emoji: <BooksIcon size={44} strokeWidth={1.6} />,  title: 'Reading Lists',  desc: 'Track your novels, textbooks and manga — progress, ratings, status.', r: -2,   delay: 0.6 },
  { emoji: <PencilIcon size={44} strokeWidth={1.6} />, title: 'Quote Journals', desc: 'Save favourite passages. Flip through them like a real scrapbook.',   r: 1.5, delay: 0.7 },
  { emoji: <TextIcon size={44} strokeWidth={1.6} />,   title: 'Word Notebooks', desc: 'Look up words, save definitions and build your own vocab notes.',      r: -1,  delay: 0.8 },
  { emoji: <MapPinIcon size={44} strokeWidth={1.6} />, title: 'Find Libraries', desc: 'Discover bookshops and libraries near you on the map.',               r: 2,   delay: 0.9 },
]

const HOW = [
  { n: '01', text: 'Create your notebook',     icon: <NotebookIcon size={26} strokeWidth={1.8} /> },
  { n: '02', text: "Add books you're reading", icon: <BookOpenIcon  size={26} strokeWidth={1.8} /> },
  { n: '03', text: 'Track progress & quotes',  icon: <PencilIcon   size={26} strokeWidth={1.8} /> },
  { n: '04', text: 'Discover new favourites',  icon: <SearchIcon   size={26} strokeWidth={1.8} /> },
]

// ─────────────────────────────────────────────────────────────
//  STAGGER VARIANTS — each section fades in from below in sequence
// ─────────────────────────────────────────────────────────────
const sectionVariants = {
  hidden: { opacity: 0, y: 36, filter: 'blur(4px)' },
  visible: (custom) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: custom * 0.16, duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  }),
}

// ─────────────────────────────────────────────────────────────
//  LANDING PAGE
// ─────────────────────────────────────────────────────────────
export default function Landing() {
  const [isLoading,   setIsLoading]   = useState(true)
  const [showContent, setShowContent] = useState(false)

  const handleLoaderComplete = () => {
    setIsLoading(false)
    // Let the loader fade out before mounting the page so the landing doesn’t pop in
    window.setTimeout(() => setShowContent(true), 440)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>

      {/* Loader — fixed overlay, exits with AnimatePresence */}
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen key="loader" onComplete={handleLoaderComplete} />
        )}
      </AnimatePresence>

      {/* Page — only mounts after loader is done so all entrance
          animations play fresh from their initial states          */}
      {showContent && (
        <div style={{ position: 'relative', minHeight: '100dvh' }}>
          <DoodleBackground />
          <EdgeMarginDoodles />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, marginInline: 'auto', padding: '3.5rem 2rem 6rem' }}>

            {/* ── NAVBAR ── */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}
            >
              <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <NotebookIcon size={28} strokeWidth={1.8} /> BookBuddy
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/login">
                  <button className="btn-scribble" style={{ fontSize: '1rem', padding: '0.3rem 1.2rem' }}>Log in</button>
                </Link>
                <Link to="/register">
                  <button className="btn-scribble btn-scribble-primary" style={{ fontSize: '1rem', padding: '0.3rem 1.2rem' }}>Sign up →</button>
                </Link>
              </div>
            </motion.div>

            {/* ── HERO ── */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              style={{ position: 'relative', marginBottom: '1rem' }}
            >

              <motion.div initial={{ opacity: 0, rotate: -10 }} animate={{ opacity: 1, rotate: -6 }}
                transition={{ delay: 0.35 }}
                style={{ position: 'absolute', top: -24, right: 20, pointerEvents: 'none' }}>
                <Star size={32} opacity={0.6} />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                style={{ position: 'absolute', top: 10, right: 70, pointerEvents: 'none' }}>
                <Arrow rotate={-25} size={52} opacity={0.45} />
              </motion.div>

              {/* Pre-label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.45 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Star size={18} opacity={0.7} />
                <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.05rem', color: 'var(--color-pencil)', letterSpacing: '0.08em' }}>
                  YOUR PERSONAL READING COMPANION
                </span>
                <Star size={18} opacity={0.7} />
              </motion.div>

              {/* ── MAIN HEADING ── */}
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.38,
                  duration: LANDING_TITLE_DURATION_S,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  fontFamily: 'var(--font-sketch)',
                  fontSize: 'clamp(4rem, 11vw, 8rem)',
                  fontWeight: 700, lineHeight: 0.95, color: 'var(--color-ink)',
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.02em',
                  overflow: 'visible',
                  paddingBottom: '0.45em',
                }}
              >
                <Scribble>Book</Scribble>
                {' '}
                <Scribble>Buddy</Scribble>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{
                  fontFamily: 'var(--font-study)', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                  color: 'var(--color-pencil)', maxWidth: '52ch', lineHeight: 1.7, marginBottom: '2.5rem',
                }}>
                Track every book you read, save quotes, discover your taste,
                and find libraries near you —{' '}
                <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.2em', fontWeight: 700, color: 'var(--color-ink)' }}>all in one living notebook.</span>
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.78, duration: 0.45 }}
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button className="btn-scribble btn-scribble-primary" style={{ fontSize: '1.3rem', padding: '0.65rem 2.2rem' }}>
                    Start your notebook →
                  </button>
                </Link>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button className="btn-scribble" style={{ fontSize: '1.1rem', padding: '0.55rem 1.5rem' }}>
                    Log in
                  </button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.95, duration: 0.45 }}
                style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {[
                  [<BooksIcon key="b" size={22} strokeWidth={1.8} />, '500+ books',  'in our database'],
                  [<PencilIcon key="p" size={22} strokeWidth={1.8} />, 'Quotes',     'saved forever'],
                  [<SearchIcon key="s" size={22} strokeWidth={1.8} />, 'Smart',      'recommendations'],
                ].map(([e, big, small]) => (
                  <div key={big} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ink)' }}>{e} {big}</div>
                    <div style={{ fontFamily: 'var(--font-study)', fontSize: '0.9rem', color: 'var(--color-pencil)' }}>{small}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── ZIGZAG ── */}
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              style={{ margin: '3.5rem 0 2.5rem', transformOrigin: 'center' }}
            >
              <Zigzag width={800} opacity={0.3} />
            </motion.div>

            {/* ── FEATURES ── */}
            <motion.section
              custom={3}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              style={{ marginBottom: '4rem' }}>
              <motion.div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
                initial={false}
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <motion.span whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.45 }}>
                  <Star size={24} opacity={0.7} />
                </motion.span>
                <h2 style={{ fontFamily: 'var(--font-sketch)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--color-ink)' }}>What's inside?</h2>
                <motion.span whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 260 }}>
                  <Arrow rotate={0} size={52} opacity={0.45} />
                </motion.span>
              </motion.div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {FEATURES.map(({ emoji, title, desc, r, delay }) => (
                  <motion.div key={title}
                    initial={{ opacity: 0, y: 28, rotate: r - 3 }}
                    animate={{ opacity: 1, y: 0, rotate: r }}
                    transition={{ delay, type: 'spring', stiffness: 200, damping: 22 }}
                    whileHover={{
                      rotate: 0,
                      scale: 1.045,
                      y: -5,
                      zIndex: 10,
                      boxShadow: '8px 10px 0 var(--color-ink)',
                      transition: { type: 'spring', stiffness: 320, damping: 18 },
                    }}
                    style={{
                      background: 'var(--color-paper)', border: '2.5px solid var(--color-ink)',
                      borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                      boxShadow: '5px 5px 0 var(--color-ink)', padding: '1.5rem',
                      transformOrigin: 'center bottom', position: 'relative', overflow: 'hidden',
                      cursor: 'default',
                    }}
                  >
                    <div style={{ position: 'absolute', top: 8, right: 12, opacity: 0.25 }}><Star size={16} /></div>
                    <div style={{ fontSize: '2.8rem', lineHeight: 1, marginBottom: '0.7rem' }}>{emoji}</div>
                    <h3 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.7rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-ink)' }}>{title}</h3>
                    <p style={{ fontFamily: 'var(--font-study)', fontSize: '1rem', color: 'var(--color-pencil)', lineHeight: 1.65 }}>{desc}</p>
                    <svg viewBox="0 0 200 6" fill="none" style={{ width: '60%', marginTop: '1rem', opacity: 0.2 }}>
                      <path d="M0,3 Q50,1 100,3 Q150,5 200,3" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* ── ZIGZAG 2 ── */}
            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              style={{ margin: '0 0 3rem' }}
            >
              <Zigzag width={800} opacity={0.22} />
            </motion.div>

            {/* ── HOW IT WORKS ── */}
            <motion.section
              custom={5}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              style={{ marginBottom: '4rem' }}>
              <motion.div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              >
                <h2 style={{ fontFamily: 'var(--font-sketch)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--color-ink)' }}>How it works</h2>
                <motion.span whileHover={{ scale: 1.15, rotate: 12 }} transition={{ type: 'spring', stiffness: 400 }}>
                  <Star size={22} opacity={0.6} />
                </motion.span>
              </motion.div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {HOW.map(({ n, text, icon }, i) => (
                  <motion.div key={n}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{
                      x: 6,
                      boxShadow: '7px 7px 0 var(--color-ink)',
                      borderColor: 'var(--color-ink)',
                      transition: { type: 'spring', stiffness: 380, damping: 22 },
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1.25rem',
                      background: 'var(--color-paper)', border: '2.5px solid var(--color-ink)',
                      borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                      boxShadow: '4px 4px 0 var(--color-ink)', padding: '0.9rem 1.4rem',
                      cursor: 'default',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-pencil)', minWidth: '2.5rem' }}>{n}</span>
                    <div style={{ width: '1.5px', height: '32px', background: 'repeating-linear-gradient(to bottom, var(--color-ink) 0, var(--color-ink) 5px, transparent 5px, transparent 9px)', opacity: 0.25 }} />
                    <span style={{ fontSize: '1.6rem' }}>{icon}</span>
                    <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-ink)' }}>{text}</span>
                    {i < HOW.length - 1 && <Arrow rotate={90} size={28} opacity={0.3} />}
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* ── FINAL CTA ── */}
            <motion.div
              custom={6}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              whileHover={{
                y: -4,
                rotate: -0.5,
                boxShadow: '12px 14px 0 rgba(26,26,26,0.35)',
                transition: { type: 'spring', stiffness: 260, damping: 20 },
              }}
              style={{
                background: 'var(--color-ink)', border: '3px solid var(--color-ink)',
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                boxShadow: '8px 8px 0 var(--color-pencil)', padding: '2.5rem 2rem',
                textAlign: 'center', position: 'relative', overflow: 'visible',
                cursor: 'default',
              }}
            >
              <div style={{ position: 'absolute', top: -18, left: 20 }}><Star size={28} opacity={1} /></div>
              <div style={{ position: 'absolute', top: -14, right: 30 }}><Star size={22} opacity={1} /></div>
              <h2 style={{ fontFamily: 'var(--font-sketch)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--color-paper)', marginBottom: '0.6rem', lineHeight: 1.1 }}>
                Ready to fill your notebook?
              </h2>
              <p style={{ fontFamily: 'var(--font-study)', fontSize: '1.1rem', color: 'var(--color-paper-worn)', marginBottom: '1.75rem' }}>
                Join thousands of readers tracking their journey <SparkleIcon size={18} style={{ marginLeft: '0.2rem', verticalAlign: 'middle' }} />
              </p>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button className="btn-scribble"
                  style={{ fontSize: '1.3rem', padding: '0.65rem 2.2rem', background: 'var(--color-paper)', color: 'var(--color-ink)', boxShadow: '4px 4px 0 var(--color-pencil)' }}>
                  Create your free notebook →
                </button>
              </Link>
            </motion.div>

            {/* Footer */}
            <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '1rem', color: 'var(--color-pencil-light)', marginTop: '4rem', textAlign: 'center' }}>
              <Star size={14} opacity={0.4} />{' '}BookBuddy · made with <CoffeeIcon size={16} style={{ verticalAlign: 'middle', marginInline: '0.2rem' }} /> and too many books{' '}<Star size={14} opacity={0.4} />
            </p>

          </div>
        </div>
      )}
    </div>
  )
}