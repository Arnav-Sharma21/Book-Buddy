import { motion } from 'framer-motion'

/* Pencil SVG that "writes" along a path */
function PencilSpinner() {
  return (
    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
      {/* Circular track */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
        aria-hidden="true"
      >
        {/* Dashed circle track */}
        <circle
          cx="40"
          cy="40"
          r="30"
          stroke="var(--color-pencil-faint)"
          strokeWidth="2"
          strokeDasharray="6 5"
          fill="none"
        />
        {/* Animated arc that grows */}
        <motion.circle
          cx="40"
          cy="40"
          r="30"
          stroke="var(--color-ink)"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="188.5"
          animate={{ strokeDashoffset: [188.5, 0, -188.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '40px 40px', transform: 'rotate(-90deg)' }}
        />
      </svg>

      {/* Pencil icon in the center */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <motion.svg
          width="22"
          height="38"
          viewBox="0 0 22 38"
          fill="none"
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          {/* Pencil body */}
          <rect x="6" y="2" width="10" height="26" rx="2" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.6"/>
          {/* Pencil tip */}
          <path d="M6,28 L11,36 L16,28" fill="var(--color-paper-worn)" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinejoin="round"/>
          {/* Pencil tip point */}
          <path d="M11,33 L11,36" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round"/>
          {/* Eraser top */}
          <rect x="6" y="2" width="10" height="5" rx="2" fill="var(--color-paper-crease)" stroke="var(--color-ink)" strokeWidth="1.6"/>
          {/* Lines on body */}
          <line x1="7" y1="12" x2="15" y2="12" stroke="var(--color-pencil-light)" strokeWidth="1" strokeDasharray="2 1.5"/>
          <line x1="7" y1="17" x2="15" y2="17" stroke="var(--color-pencil-light)" strokeWidth="1" strokeDasharray="2 1.5"/>
        </motion.svg>
      </div>
    </div>
  )
}

/* Scribble line that animates under the text */
function ScribbleLine() {
  return (
    <svg viewBox="0 0 180 8" fill="none" style={{ width: '180px', height: '8px', opacity: 0.35 }} aria-hidden="true">
      <motion.path
        d="M0,4 Q22,1 45,4 Q68,7 90,4 Q112,1 135,4 Q158,7 180,4"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.2 }}
      />
    </svg>
  )
}

export default function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.2rem',
        padding: '5rem 2rem',
        minHeight: '30vh',
      }}
    >
      <PencilSpinner />

      <div style={{ textAlign: 'center' }}>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontFamily: 'var(--font-sketch)',
            fontSize: '1.25rem',
            color: 'var(--color-pencil)',
            marginBottom: '0.3rem',
          }}
        >
          {text}
        </motion.p>
        <ScribbleLine />
      </div>
    </div>
  )
}
