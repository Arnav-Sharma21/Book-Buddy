/**
 * DoodleBook — a hand-drawn book card that sits on the shelf.
 * Click it to trigger the NotebookOverlay book-open animation.
 *
 * Props:
 *   title        — book spine / cover label
 *   subtitle     — small tag below title
 *   color        — cover colour (warm paper tone)
 *   icon         — JSX icon rendered on the cover
 *   onClick      — called when the book is clicked
 *   count        — optional number badge (e.g. "3 quotes")
 */

import { motion } from 'framer-motion'

/* ── Ruled lines on the book cover ── */
function CoverLines({ n = 4 }) {
  return (
    <div style={{ position:'absolute', left:12, right:8, bottom:20,
      display:'flex', flexDirection:'column', gap:6 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          height: 1.5,
          background: 'rgba(0,0,0,0.15)',
          borderRadius: 1,
        }}/>
      ))}
    </div>
  )
}

/* ── Tiny stitched spine mark ── */
function SpineMark() {
  return (
    <div style={{
      position:'absolute', top:0, left:0, bottom:0, width:10,
      background:'rgba(0,0,0,0.12)',
      borderRight:'1px solid rgba(0,0,0,0.18)',
    }}/>
  )
}

export default function DoodleBook({
  title,
  subtitle,
  color = '#f5e6c8',
  icon,
  onClick,
  count,
  delay = 0,
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
      <motion.div
        onClick={onClick}
        initial={{ opacity:0, y:24, rotate: -3 }}
        animate={{ opacity:1, y:0, rotate: 0 }}
        transition={{ delay, type:'spring', stiffness:240, damping:22 }}
        whileHover={{
          y: -10,
          rotate: -2,
          scale: 1.06,
          boxShadow: '8px 12px 0 #1a1a1a',
          transition: { duration:0.2 },
        }}
        whileTap={{ scale: 0.97, y:-4 }}
        style={{
          position: 'relative',
          width: 120,
          height: 160,
          background: color,
          border: '2.5px solid #1a1a1a',
          borderRadius: '4px 10px 10px 4px',
          boxShadow: '4px 6px 0 #1a1a1a',
          cursor: 'pointer',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        <SpineMark/>

        {/* Icon on upper half */}
        <div style={{
          position:'absolute', top:22, left:0, right:0,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ opacity: 0.55 }}>{icon}</div>
        </div>

        {/* Title area */}
        <div style={{
          position:'absolute', left:14, right:8, top:'50%',
          transform:'translateY(-50%)',
          marginTop: 12,
        }}>
          <p style={{
            fontFamily:'var(--font-sketch)', fontSize:'0.82rem',
            fontWeight:700, color:'rgba(0,0,0,0.75)',
            lineHeight:1.25, textAlign:'center',
          }}>
            {title}
          </p>
        </div>

        {/* Ruled lines at bottom */}
        <CoverLines n={3}/>

        {/* Count badge */}
        {count > 0 && (
          <div style={{
            position:'absolute', top:6, right:6,
            background:'#1a1a1a', color:'#fff',
            fontFamily:'var(--font-sketch)', fontSize:'0.62rem',
            borderRadius:'50%', minWidth:18, height:18,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:700,
          }}>
            {count}
          </div>
        )}
      </motion.div>

      {/* Label below the book */}
      {subtitle && (
        <p style={{
          fontFamily:'var(--font-study)', fontSize:'0.75rem',
          color:'var(--color-pencil)', textAlign:'center',
          maxWidth:110,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
