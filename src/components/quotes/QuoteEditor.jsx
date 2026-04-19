import { useState } from 'react'
import { motion } from 'framer-motion'
import { StarFilledIcon, PinIcon, LightbulbIcon, BookmarkIcon, PencilIcon, SparkleIcon, DiamondIcon } from '../ui/DoodleIcons'

const STICKERS = [
  { key: 'star',     Icon: StarFilledIcon },
  { key: 'pin',      Icon: PinIcon        },
  { key: 'bulb',     Icon: LightbulbIcon  },
  { key: 'bookmark', Icon: BookmarkIcon   },
  { key: 'pencil',   Icon: PencilIcon     },
  { key: 'sparkle',  Icon: SparkleIcon    },
  { key: 'diamond',  Icon: DiamondIcon    },
]

export default function QuoteEditor({ onSave, onClose }) {
  const [form, setForm] = useState({ quoteText: '', note: '', page: '', stickers: [] })

  const toggleSticker = (s) =>
    setForm((f) => ({
      ...f,
      stickers: f.stickers.includes(s) ? f.stickers.filter((x) => x !== s) : [...f.stickers, s],
    }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  const inputUnderlineStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid rgba(0,0,0,0.2)',
    padding: '0.35rem 0.2rem',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    outline: 'none',
    color: '#1a1a1a',
    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(180,160,120,0.18) 28px)',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      style={{
        background: '#fffdf5',
        border: '2.5px solid #1a1a1a',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        boxShadow: '5px 5px 0 #1a1a1a',
        padding: '1.4rem 1.6rem',
        position: 'relative',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(180,160,120,0.18) 28px)',
      }}
    >
      {/* Dog-ear */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 0, height: 0, borderStyle: 'solid',
        borderWidth: '0 24px 24px 0',
        borderColor: 'transparent rgba(180,160,120,0.4) transparent transparent',
      }} />

      <h3 style={{
        fontFamily: 'var(--font-sketch)', fontSize: '1.4rem', fontWeight: 700,
        color: '#1a1a1a', marginBottom: '1rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <PencilIcon size={20}/> New Quote
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Quote text */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ fontFamily: 'var(--font-sketch)', fontSize: '0.88rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.25rem' }}>
            Quote *
          </label>
          <textarea
            required
            rows={4}
            value={form.quoteText}
            onChange={(e) => setForm({ ...form, quoteText: e.target.value })}
            placeholder="The passage that moved you…"
            style={{
              ...inputUnderlineStyle,
              resize: 'none',
              lineHeight: 1.7,
              paddingTop: '0.2rem',
            }}
          />
        </div>

        {/* Note */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontFamily: 'var(--font-sketch)', fontSize: '0.88rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.25rem' }}>
            Your note (optional)
          </label>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Your personal note…"
            style={inputUnderlineStyle}
          />
        </div>

        {/* Page */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ fontFamily: 'var(--font-sketch)', fontSize: '0.88rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.25rem' }}>
            Page number (optional)
          </label>
          <input
            type="text"
            value={form.page}
            onChange={(e) => setForm({ ...form, page: e.target.value })}
            placeholder="e.g. 142"
            style={{ ...inputUnderlineStyle, width: 100 }}
          />
        </div>

        {/* Stickers */}
        <div style={{ marginBottom: '1.1rem' }}>
          <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '0.88rem', color: 'var(--color-pencil)', marginBottom: '0.4rem' }}>
            Stickers
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {STICKERS.map(({ key, Icon }) => (
              <motion.button
                type="button"
                key={key}
                onClick={() => toggleSticker(key)}
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
                style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #1a1a1a',
                  borderRadius: '8px 16px 8px 16px / 16px 8px 16px 8px',
                  cursor: 'pointer',
                  background: form.stickers.includes(key) ? '#1a1a1a' : '#fff9f0',
                  color: form.stickers.includes(key) ? '#fff' : '#1a1a1a',
                  boxShadow: '2px 2px 0 #1a1a1a',
                  transition: 'background 0.1s',
                }}
              >
                <Icon size={15}/>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <motion.button
            type="submit"
            whileHover={{ y: -2, boxShadow: '5px 5px 0 #1a1a1a' }}
            whileTap={{ y: 1 }}
            style={{
              fontFamily: 'var(--font-sketch)', fontSize: '1rem', fontWeight: 700,
              background: '#1a1a1a', color: '#fff',
              border: '2px solid #1a1a1a',
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
              padding: '0.4rem 1.3rem', cursor: 'pointer',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <BookmarkIcon size={15}/> Save Quote
          </motion.button>
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            style={{
              fontFamily: 'var(--font-sketch)', fontSize: '0.95rem',
              background: 'transparent', border: '2px solid #1a1a1a',
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
              padding: '0.35rem 1rem', cursor: 'pointer',
              boxShadow: '2px 2px 0 #1a1a1a',
            }}
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}