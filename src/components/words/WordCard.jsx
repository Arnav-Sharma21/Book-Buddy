import { motion } from 'framer-motion'

const TAG_PALETTE = {
  vocab:     { bg: 'rgba(250,230,60,0.18)',  border: 'var(--color-pencil)' },
  lore:      { bg: 'rgba(80,140,240,0.18)',  border: 'var(--color-pencil)' },
  technical: { bg: 'rgba(60,200,100,0.18)',  border: 'var(--color-pencil)' },
  character: { bg: 'rgba(230,60,160,0.15)',  border: 'var(--color-pencil)' },
  place:     { bg: 'rgba(240,160,40,0.18)',  border: 'var(--color-pencil)' },
}

export default function WordCard({ note, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 220, damping: 22 }}
      whileHover={{ y: -3, boxShadow: '6px 6px 0 var(--color-ink)', transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      style={{
        background: 'var(--color-paper)',
        border: '2px solid var(--color-ink)',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        boxShadow: '4px 4px 0 var(--color-ink)',
        padding: '1rem 1.1rem',
        position: 'relative',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(100,160,230,0.1) 28px)',
      }}
    >
      {/* Dog-ear corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 0, height: 0, borderStyle: 'solid',
        borderWidth: '0 20px 20px 0',
        borderColor: 'transparent var(--color-paper-worn) transparent transparent',
      }} />

      {/* Word + tags row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <h4 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.2 }}>
          {note.word}
        </h4>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {note.tags?.map((t) => {
            const p = TAG_PALETTE[t] || { bg: 'rgba(180,180,180,0.18)', border: 'var(--color-pencil)' }
            return (
              <span key={t} style={{
                fontFamily: 'var(--font-sketch)', fontSize: '0.72rem', fontWeight: 600,
                background: p.bg, color: p.border,
                border: `1.5px solid ${p.border}`,
                borderRadius: '8px 20px 8px 20px / 20px 8px 20px 8px',
                padding: '0.05rem 0.45rem',
                whiteSpace: 'nowrap',
              }}>
                {t}
              </span>
            )
          })}
        </div>
      </div>

      {/* Short meaning */}
      <p style={{
        fontFamily: 'var(--font-study)', fontSize: '0.9rem',
        color: 'var(--color-pencil)', fontStyle: 'italic',
        lineHeight: 1.5, marginBottom: note.fullDefinition || note.example ? '0.4rem' : 0,
      }}>
        {note.shortMeaning}
      </p>

      {/* Full definition excerpt */}
      {note.fullDefinition && (
        <p style={{
          fontFamily: 'var(--font-study)', fontSize: '0.8rem',
          color: 'var(--color-pencil)',
          lineHeight: 1.5,
          borderLeft: '2.5px solid var(--color-pencil-faint)',
          paddingLeft: '0.5rem',
          marginBottom: note.example ? '0.4rem' : 0,
        }}>
          {note.fullDefinition.slice(0, 120)}{note.fullDefinition.length > 120 ? '…' : ''}
        </p>
      )}

      {/* Example sentence */}
      {note.example && (
        <p style={{
          fontFamily: 'var(--font-study)', fontSize: '0.78rem',
          color: 'var(--color-pencil)', fontStyle: 'italic',
        }}>
          "{note.example}"
        </p>
      )}
    </motion.div>
  )
}