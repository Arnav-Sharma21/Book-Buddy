/**
 * NotebookOverlay — animated "book opens" wrapper.
 *
 * Usage:
 *   <NotebookOverlay title="…" color="#f5e6c8" onClose={fn}>
 *     {content}
 *   </NotebookOverlay>
 *
 * Animation sequence:
 *   1. Backdrop fades in + blurs the page behind
 *   2. Book cover scales up from the centre (spring)
 *   3. Pages flip (3 SVG paper sheets arc over)
 *   4. Content fades in — feels like you opened the notebook
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloseIcon } from './DoodleIcons'

/* ── Single page-flip sheet ── */
function FlipPage({ delay, color }) {
  return (
    <motion.div
      initial={{ rotateY: 0, originX: 0 }}
      animate={{ rotateY: -180 }}
      transition={{ delay, duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute', inset: 0,
        background: color,
        borderRadius: 'inherit',
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d',
        border: '2px solid rgba(0,0,0,0.15)',
        boxShadow: '2px 0 8px rgba(0,0,0,0.12)',
        zIndex: 10,
      }}
    />
  )
}

/* ── Tiny ruled lines drawn on the page while flipping ── */
function PageLines({ color = 'rgba(0,0,0,0.07)' }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, ${color} 28px)`,
      borderRadius: 'inherit',
    }}/>
  )
}

/* ── Spine gutter on the left ── */
function Spine({ color }) {
  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, bottom: 0, width: 28,
      background: color, borderRight: '2px solid rgba(0,0,0,0.2)',
      borderRadius: '8px 0 0 8px', zIndex: 2,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 8, paddingTop: 16,
    }}>
      {[0,1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(0,0,0,0.25)',
        }}/>
      ))}
    </div>
  )
}

export default function NotebookOverlay({
  children,
  title,
  color = '#f5e6c8',        // book cover / spine colour
  lineColor,                // ruled-line colour (defaults based on cover)
  icon,
  onClose,
}) {
  const [phase, setPhase] = useState('entering') // 'entering' | 'open'
  const lc = lineColor || `${color}88`

  // After flip animation completes → show content
  useEffect(() => {
    const t = setTimeout(() => setPhase('open'), 820)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {/* ── Backdrop ── */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(15, 10, 5, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        {/* ── Book container ── */}
        <motion.div
          key="book"
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.3, rotate: -8, y: 60, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, y: 0, opacity: 1 }}
          exit={{ scale: 0.3, rotate: 8, y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.05 }}
          style={{
            position: 'relative',
            width: '100%', maxWidth: 720,
            height: '85vh',
            maxHeight: 620,
            background: '#faf6ee',
            border: '3px solid #1a1a1a',
            borderRadius: '6px 16px 16px 6px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.45), 12px 12px 0 #1a1a1a',
            overflow: 'hidden',
            transformStyle: 'preserve-3d',
            perspective: 1200,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Left spine */}
          <Spine color={color}/>

          {/* ── Phase: entering → flip pages ── */}
          {phase === 'entering' && (
            <>
              {/* Page 3 (back) */}
              <motion.div style={{
                position:'absolute', inset:0, zIndex:8,
                background: `color-mix(in srgb, ${color} 60%, #fff)`,
                borderRadius:'inherit',
              }}/>

              {/* Page 2 */}
              <FlipPage delay={0.15} color={`color-mix(in srgb, ${color} 40%, #fff)`}/>

              {/* Page 1 (front / cover) — flips last */}
              <FlipPage delay={0.28} color={color}/>

              {/* Cover doodle content */}
              <motion.div
                initial={{ opacity: 1 }} animate={{ opacity: 0 }}
                transition={{ delay: 0.25, duration: 0.15 }}
                style={{
                  position: 'absolute', inset: 0, zIndex: 12,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '0.75rem', paddingLeft: 28,
                }}>
                {icon && <div style={{ opacity: 0.45 }}>{icon}</div>}
                <p style={{
                  fontFamily: 'var(--font-sketch)', fontSize: '1.6rem',
                  fontWeight: 700, color: '#1a1a1a', textAlign: 'center',
                  opacity: 0.7, maxWidth: 280,
                }}>{title}</p>
                {/* Simulated ruled lines on cover */}
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{
                    width: 200, height: 1.5,
                    background: 'rgba(0,0,0,0.15)',
                  }}/>
                ))}
              </motion.div>
            </>
          )}

          {/* ── Phase: open → show content ── */}
          {phase === 'open' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                paddingLeft: 36, // clear spine
                overflow: 'hidden',
                backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, ${lc} 32px)`,
              }}
            >
              {/* Notebook header bar */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.2rem 0.8rem',
                borderBottom: `2.5px solid #1a1a1a`,
                background: color,
                flexShrink: 0,
              }}>
                <h2 style={{
                  fontFamily: 'var(--font-sketch)', fontSize: '1.6rem',
                  fontWeight: 700, color: '#1a1a1a',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  {icon} {title}
                </h2>
                <motion.button onClick={onClose}
                  whileHover={{ rotate: 90, scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <CloseIcon size={22}/>
                </motion.button>
              </div>

              {/* Scrollable content area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.2rem 1.2rem' }}>
                {children}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
