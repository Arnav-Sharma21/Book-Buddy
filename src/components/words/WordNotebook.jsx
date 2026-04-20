import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWordNotes } from '../../hooks/useWordNotes'
import WordCard from './WordCard'
import LoadingSpinner from '../ui/LoadingSpinner'
import NotebookOverlay from '../ui/NotebookOverlay'
import { TextIcon, SearchIcon, PencilIcon } from '../ui/DoodleIcons'

const TAGS = ['all', 'vocab', 'lore', 'technical', 'character', 'place']

export default function WordNotebook({ bookId, onOpenModal, onClose }) {
  const { wordNotes, loading, handleDeleteWordNote } = useWordNotes(bookId)
  const [tag, setTag]       = useState('all')
  const [search, setSearch] = useState('')

  const filtered = wordNotes.filter(n => {
    const tags = n.tags || []
    const word = n.word || ''
    const tagMatch    = tag === 'all' || tags.includes(tag)
    const searchMatch = !search || word.toLowerCase().includes(search.toLowerCase())
    return tagMatch && searchMatch
  })

  return (
    <NotebookOverlay
      title="Word & Lore Notebook"
      color="#dbeafe"
      lineColor="rgba(100,160,230,0.2)"
      icon={<TextIcon size={44} strokeWidth={1.2}/>}
      onClose={onClose}
    >
      {/* Toolbar */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.6rem',
        alignItems:'center', marginBottom:'1.1rem' }}>
        {/* Search */}
        <div style={{ position:'relative', flex:'1 1 160px' }}>
          <span style={{ position:'absolute', left:10, top:'50%',
            transform:'translateY(-50%)', pointerEvents:'none' }}>
            <SearchIcon size={15}/>
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search words…"
            style={{
              width:'100%', paddingLeft:'2rem', paddingRight:'0.6rem',
              fontFamily:'var(--font-body)', fontSize:'0.92rem',
              background:'var(--color-paper)', border:'2px solid var(--color-ink)', outline:'none',
              borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
              padding:'0.3rem 0.7rem 0.3rem 2rem',
              boxShadow:'2px 2px 0 var(--color-ink)',
              color:'var(--color-ink)',
            }}/>
        </div>

        {/* Tag chips */}
        <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap' }}>
          {TAGS.map(t => (
            <motion.button key={t} onClick={() => setTag(t)}
              whileHover={{ y:-1 }} whileTap={{ y:1 }}
              style={{
                fontFamily:'var(--font-sketch)', fontSize:'0.78rem', fontWeight:600,
                border:'1.5px solid var(--color-ink)', cursor:'pointer',
                borderRadius:'255px 8px 225px 8px / 8px 225px 8px 255px',
                padding:'0.1rem 0.55rem',
                background: tag===t ? 'var(--color-ink)' : 'var(--color-paper)',
                color: tag===t ? 'var(--color-paper)' : 'var(--color-ink)',
                transition:'background 0.1s',
              }}>
              {t}
            </motion.button>
          ))}
        </div>

        {/* Add word button */}
        <motion.button onClick={onOpenModal}
          whileHover={{ y:-2, boxShadow:'4px 4px 0 var(--color-ink)' }}
          whileTap={{ y:1 }}
          style={{
            fontFamily:'var(--font-sketch)', fontSize:'0.95rem', fontWeight:700,
            background:'var(--color-ink)', color:'var(--color-paper)',
            border:'2px solid var(--color-ink)',
            borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
            padding:'0.3rem 1rem', cursor:'pointer',
            boxShadow:'2px 2px 0 var(--color-pencil)',
            display:'flex', alignItems:'center', gap:5,
          }}>
          <PencilIcon size={14}/> + Word
        </motion.button>
      </div>

      {/* Word cards */}
      {loading ? (
        <LoadingSpinner text="Loading word notebook…"/>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{ textAlign:'center', padding:'3rem 1rem' }}>
          <TextIcon size={52} strokeWidth={1.1} style={{ opacity:0.18, margin:'0 auto 1rem' }}/>
          <p style={{ fontFamily:'var(--font-sketch)', fontSize:'1.4rem',
            color:'var(--color-pencil)' }}>
            {search ? 'No matching words.' : 'No words yet. Look something up!'}
          </p>
        </motion.div>
      ) : (
        <div style={{ display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',
          gap:'0.85rem' }}>
          <AnimatePresence>
            {filtered.map((n, i) => (
              <motion.div key={n.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:0.9 }}
                transition={{ delay: i*0.04 }}>
                <WordCard note={n} index={i}/>
                <motion.button
                  onClick={() => handleDeleteWordNote(n.id)}
                  whileHover={{ color:'var(--color-ink)' }}
                  style={{ fontFamily:'var(--font-sketch)', fontSize:'0.75rem',
                    color:'var(--color-pencil-light)', background:'none',
                    border:'none', cursor:'pointer', marginTop:'0.2rem',
                    padding:'0 0.2rem' }}>
                  remove
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </NotebookOverlay>
  )
}