import { motion } from 'framer-motion'
import { StarFilledIcon, PinIcon, LightbulbIcon, BookmarkIcon, PencilIcon, SparkleIcon, DiamondIcon } from '../ui/DoodleIcons'

const STICKER_MAP = {
  star:     StarFilledIcon,
  pin:      PinIcon,
  bulb:     LightbulbIcon,
  bookmark: BookmarkIcon,
  pencil:   PencilIcon,
  sparkle:  SparkleIcon,
  diamond:  DiamondIcon,
}

// Subtle warm tints for variety
const CARD_TINTS = ['#fffdf5', '#fff9f0', '#fdfaf3', '#fffcf7', '#faf7ee']

export default function QuoteCard({ quote, index }) {
  const tint = CARD_TINTS[index % CARD_TINTS.length]

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20, rotate: index % 2 === 0 ? -1 : 1 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 220, damping: 22 }}
      whileHover={{ y: -3, boxShadow: '6px 6px 0 #111', transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      style={{
        background: tint,
        border: '2px solid #1a1a1a',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        boxShadow: '4px 4px 0 #1a1a1a',
        padding: '1.1rem 1.2rem',
        position: 'relative',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(180,160,120,0.18) 28px)',
      }}
    >
      {/* Dog-ear corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: '0 22px 22px 0',
        borderColor: 'transparent rgba(180,160,120,0.35) transparent transparent',
      }} />

      {/* Stickers */}
      {quote.stickers?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: '0.5rem' }}>
          {quote.stickers.map((s, i) => {
            const Icon = STICKER_MAP[s]
            return Icon
              ? <span key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><Icon size={15}/></span>
              : <span key={i} style={{ fontSize: '1.1rem' }}>{s}</span>
          })}
        </div>
      )}

      {/* Quote text */}
      <blockquote style={{
        fontFamily: 'var(--font-sketch)',
        fontSize: '1.05rem',
        fontStyle: 'italic',
        lineHeight: 1.65,
        color: '#1a1a1a',
        margin: 0,
        paddingLeft: '0.2rem',
        borderLeft: '3px solid rgba(100,80,40,0.25)',
      }}>
        "{quote.quoteText}"
      </blockquote>

      {quote.note && (
        <p style={{
          marginTop: '0.6rem',
          fontFamily: 'var(--font-study)',
          fontSize: '0.88rem',
          color: 'var(--color-pencil)',
          lineHeight: 1.5,
          borderLeft: '2px solid rgba(0,0,0,0.15)',
          paddingLeft: '0.5rem',
        }}>
          {quote.note}
        </p>
      )}

      {quote.page && (
        <p style={{
          marginTop: '0.4rem',
          fontFamily: 'var(--font-sketch)',
          fontSize: '0.8rem',
          color: 'var(--color-pencil-light)',
        }}>
          — p.{quote.page}
        </p>
      )}
    </motion.div>
  )
}