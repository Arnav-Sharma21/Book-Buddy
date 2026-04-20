import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { fetchDefinition } from '../../services/dictionaryApi'
import { addWordNote } from '../../services/firestoreWords'
import { useAuth } from '../../context/AuthContext'
import NotebookOverlay from '../ui/NotebookOverlay'
import { TextIcon, BookmarkIcon, SearchIcon } from '../ui/DoodleIcons'

const TAGS = ['vocab', 'lore', 'technical', 'character', 'place']

export default function WordModal({ bookId, prefill = '', initialTags = [], onClose }) {
  const { user }    = useAuth()
  const [word, setWord]           = useState(prefill)
  const [definition, setDefinition] = useState(null)
  const [form, setForm]           = useState({ shortMeaning:'', example:'', tags: initialTags })
  const [fetching, setFetching]   = useState(false)

  const handleFetch = async () => {
    if (!word.trim()) return
    setFetching(true)
    try {
      const data = await fetchDefinition(word)
      setDefinition(data)
      if (data.meanings[0])
        setForm(f => ({ ...f, example: data.meanings[0].example || '' }))
    } catch {
      toast.error('Word not found in dictionary.')
    } finally { setFetching(false) }
  }

  const toggleTag = (t) =>
    setForm(f => ({
      ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t],
    }))

  const handleSave = async () => {
    if (!word || !form.shortMeaning)
      return toast.error('Enter a word and your summary.')
    try {
      await addWordNote(user.uid, bookId, {
        word,
        shortMeaning: form.shortMeaning,
        fullDefinition: definition?.meanings.map(m => m.definition).join(' / ') || '',
        example: form.example,
        tags: form.tags,
      })
      toast.success(`"${word}" saved to notebook!`)
      onClose()
    } catch { toast.error('Could not save word note.') }
  }

  return (
    <NotebookOverlay
      title="Quick Word Note"
      color="#d1fae5"
      lineColor="rgba(60,160,120,0.18)"
      icon={<TextIcon size={44} strokeWidth={1.2}/>}
      onClose={onClose}
    >
      {/* Word search row */}
      <div style={{ display:'flex', gap:'0.6rem', marginBottom:'1rem', flexWrap:'wrap' }}>
        <input value={word} onChange={e => setWord(e.target.value)}
          placeholder="Enter word…"
          onKeyDown={e => e.key==='Enter' && handleFetch()}
          style={{
            flex:1, minWidth:140,
            fontFamily:'var(--font-body)', fontSize:'1.1rem',
            background:'transparent', border:'none',
            borderBottom:'2.5px solid var(--color-ink)',
            padding:'0.35rem 0.2rem', outline:'none', color:'var(--color-ink)',
          }}/>
        <motion.button onClick={handleFetch} disabled={fetching}
          whileHover={{ y:-2, boxShadow:'4px 4px 0 var(--color-ink)' }}
          whileTap={{ y:1 }}
          style={{
            fontFamily:'var(--font-sketch)', fontSize:'0.95rem', fontWeight:700,
            background:'var(--color-ink)', color:'var(--color-paper)',
            border:'2px solid var(--color-ink)',
            borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
            padding:'0.3rem 1rem', cursor: fetching ? 'not-allowed' : 'pointer',
            boxShadow:'2px 2px 0 var(--color-pencil)',
            display:'flex', alignItems:'center', gap:5, opacity: fetching ? 0.7 : 1,
          }}>
          <SearchIcon size={14}/> {fetching ? '…' : 'Look up'}
        </motion.button>
      </div>

      {/* Dictionary result */}
      {definition && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          style={{
            background:'var(--color-paper-dark)',
            border:'2px solid var(--color-pencil-faint)',
            borderRadius:'8px 20px 10px 16px / 16px 10px 20px 8px',
            padding:'0.75rem 1rem', marginBottom:'1rem',
          }}>
          <p style={{ fontFamily:'var(--font-sketch)', fontSize:'1.1rem', marginBottom:'0.3rem' }}>
            <strong>{definition.word}</strong>
            {definition.phonetic && (
              <span style={{ fontFamily:'var(--font-study)', fontSize:'0.85rem',
                color:'var(--color-pencil)', marginLeft:8 }}>
                / {definition.phonetic} /
              </span>
            )}
          </p>
          {definition.meanings.slice(0, 3).map((m, i) => (
            <p key={i} style={{ fontFamily:'var(--font-study)', fontSize:'0.88rem',
              color:'var(--color-pencil)', lineHeight:1.55 }}>
              <em>{m.partOfSpeech}:</em> {m.definition}
            </p>
          ))}
        </motion.div>
      )}

      {/* Your summary */}
      <div style={{ marginBottom:'0.85rem' }}>
        <label style={{ fontFamily:'var(--font-sketch)', fontSize:'0.9rem',
          color:'var(--color-pencil)', display:'block', marginBottom:'0.3rem' }}>
          Your summary *
        </label>
        <textarea rows={3} value={form.shortMeaning}
          onChange={e => setForm(f => ({ ...f, shortMeaning: e.target.value }))}
          placeholder="In your own words…"
          style={{ width:'100%', background:'transparent', outline:'none', resize:'none',
            fontFamily:'var(--font-body)', fontSize:'0.98rem', lineHeight:1.7,
            padding:'0.3rem 0.2rem',
            borderTop:'none', borderLeft:'none', borderRight:'none',
            borderBottom:'2px solid var(--color-pencil-faint)',
            backgroundImage:'repeating-linear-gradient(transparent,transparent 27px,var(--color-pencil-faint) 28px)',
            color:'var(--color-ink)',
          }}/>
      </div>

      {/* Example sentence */}
      <div style={{ marginBottom:'0.9rem' }}>
        <label style={{ fontFamily:'var(--font-sketch)', fontSize:'0.9rem',
          color:'var(--color-pencil)', display:'block', marginBottom:'0.3rem' }}>
          Example sentence (opt.)
        </label>
        <input value={form.example}
          onChange={e => setForm(f => ({ ...f, example: e.target.value }))}
          placeholder="Use it in a sentence…"
          style={{ width:'100%', fontFamily:'var(--font-body)', fontSize:'0.95rem',
            background:'transparent', border:'none',
            borderBottom:'2px solid var(--color-pencil-faint)',
            padding:'0.3rem 0.1rem', outline:'none', color:'var(--color-ink)' }}/>
      </div>

      {/* Tags */}
      <div style={{ marginBottom:'1.2rem' }}>
        <label style={{ fontFamily:'var(--font-sketch)', fontSize:'0.9rem',
          color:'var(--color-pencil)', display:'block', marginBottom:'0.4rem' }}>
          Category
        </label>
        <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
          {TAGS.map(t => (
            <motion.button key={t} onClick={() => toggleTag(t)}
              whileHover={{ y:-1 }} whileTap={{ y:1 }}
              style={{
                fontFamily:'var(--font-sketch)', fontSize:'0.8rem', fontWeight:600,
                border:'1.5px solid var(--color-ink)', cursor:'pointer',
                borderRadius:'255px 8px 225px 8px / 8px 225px 8px 255px',
                padding:'0.1rem 0.55rem',
                background: form.tags.includes(t) ? 'var(--color-ink)' : 'var(--color-paper)',
                color: form.tags.includes(t) ? 'var(--color-paper)' : 'var(--color-ink)',
                transition:'background 0.1s',
              }}>
              {t}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:'0.75rem' }}>
        <motion.button onClick={handleSave}
          whileHover={{ y:-2, boxShadow:'5px 5px 0 var(--color-ink)' }}
          whileTap={{ y:1 }}
          style={{
            fontFamily:'var(--font-sketch)', fontSize:'1rem', fontWeight:700,
            background:'var(--color-ink)', color:'var(--color-paper)',
            border:'2px solid var(--color-ink)',
            borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
            padding:'0.4rem 1.2rem', cursor:'pointer',
            boxShadow:'3px 3px 0 var(--color-pencil)',
            display:'flex', alignItems:'center', gap:6,
          }}>
          <BookmarkIcon size={15}/> Save to Notebook
        </motion.button>
        <motion.button onClick={onClose}
          whileHover={{ y:-1 }} whileTap={{ y:1 }}
          style={{
            fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
            background:'transparent', border:'2px solid var(--color-ink)',
            borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
            padding:'0.35rem 1rem', cursor:'pointer',
            boxShadow:'2px 2px 0 var(--color-ink)',
          }}>
          Cancel
        </motion.button>
      </div>
    </NotebookOverlay>
  )
}