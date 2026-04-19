import { useState } from 'react'
import { motion } from 'framer-motion'

export default function StarRating({ value = 0, onChange }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <motion.button
          key={s}
          type="button"
          whileHover={{ scale: 1.45, rotate: s % 2 === 0 ? 12 : -12 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange?.(s)}
          style={{
            fontSize: '1.7rem',
            fontFamily: 'var(--font-sketch)',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            lineHeight: 1,
            color: s <= display ? 'var(--color-ink)' : 'var(--color-pencil-light)',
            filter: s <= display ? 'url(#pencil)' : 'none',
          }}
          aria-label={`${s} star${s > 1 ? 's' : ''}`}
        >
          {s <= display ? '★' : '☆'}
        </motion.button>
      ))}
      <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '0.9rem', color: 'var(--color-pencil)', marginLeft: '0.4rem' }}>
        {value > 0 ? `${value}/5` : 'tap to rate'}
      </span>
    </div>
  )
}