import { motion } from 'framer-motion'

export default function ProgressBar({ current = 0, total = 0 }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '1rem', color: 'var(--color-pencil)' }}>
          Progress
        </span>
        <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '1rem', fontWeight: 700 }}>
          {pct}%
        </span>
      </div>

      <div className="progress-scribble">
        <motion.div
          className="progress-scribble-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        />
      </div>

      <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '0.85rem', textAlign: 'right', marginTop: '0.3rem', color: 'var(--color-pencil)' }}>
        {current} / {total || '?'} pages
      </p>
    </div>
  )
}