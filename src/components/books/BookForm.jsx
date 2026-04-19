import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PencilIcon, BooksIcon, CloseIcon, ClipboardIcon,
  CheckCircleIcon, BookOpenIcon, TrashIcon } from '../ui/DoodleIcons'

const GENRES = [
  'fantasy','romance','sci-fi','horror','mystery','history',
  'science','math','programming','philosophy','biography','thriller',
  'self-help','classic','poetry',
]

const STATUS_OPTS = [
  { value:'reading',  label:'Reading',   icon:<BookOpenIcon size={13}/> },
  { value:'want',     label:'Want',      icon:<ClipboardIcon size={13}/> },
  { value:'finished', label:'Finished',  icon:<CheckCircleIcon size={13}/> },
  { value:'dropped',  label:'Dropped',   icon:<TrashIcon size={13}/> },
]

export default function BookForm({ onSubmit, onClose, initial = {} }) {
  const [form, setForm] = useState({
    title:'', author:'', coverUrl:'', status:'want',
    type:'novel', totalPages:'', genres:[], ...initial,
  })

  const toggleGenre = (g) =>
    setForm(f => ({
      ...f,
      genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g],
    }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, totalPages: Number(form.totalPages) || 0 })
  }

  const isEdit = Boolean(initial.title)

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:'fixed', inset:0, zIndex:60,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'1.5rem',
        background:'rgba(0,0,0,0.5)',
        backgroundImage:'repeating-linear-gradient(-45deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03) 1px,transparent 1px,transparent 9px)',
        backdropFilter:'blur(2px)' }}
      onClick={e => e.target===e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale:0.88, rotate:isEdit ? 1 : -2, opacity:0, y:20 }}
        animate={{ scale:1, rotate:isEdit ? 0.5 : -0.5, opacity:1, y:0 }}
        exit={{ scale:0.9, opacity:0, y:12 }}
        transition={{ type:'spring', stiffness:270, damping:24 }}
        style={{
          width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto',
          background:'var(--color-paper)',
          border:'3px solid var(--color-ink)',
          borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
          boxShadow:'10px 10px 0 var(--color-ink)',
          padding:'2rem',
        }}
      >
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ fontFamily:'var(--font-sketch)', fontSize:'2rem',
            fontWeight:700, display:'flex', alignItems:'center', gap:'0.5rem' }}>
            {isEdit
              ? <><PencilIcon size={22}/> Edit Book</>
              : <><BooksIcon size={22}/> Add Book</>}
          </h2>
          <motion.button onClick={onClose}
            whileHover={{ rotate:90, scale:1.1 }} whileTap={{ scale:0.9 }}
            style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}>
            <CloseIcon size={22}/>
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Text fields */}
          {[
            { name:'title',      label:'Title *',          required:true, placeholder:'e.g. Dune' },
            { name:'author',     label:'Author *',         required:true, placeholder:'e.g. Frank Herbert' },
            { name:'coverUrl',   label:'Cover URL (opt.)', placeholder:'https://...' },
            { name:'totalPages', label:'Total Pages',      type:'number', placeholder:'e.g. 412' },
          ].map(({ name, label, required, type='text', placeholder }) => (
            <div key={name}>
              <label style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
                color:'var(--color-pencil)', display:'block', marginBottom:'0.3rem',
                fontWeight:600 }}>{label}</label>
              <input type={type} value={form[name]} placeholder={placeholder}
                onChange={e => setForm({ ...form, [name]: e.target.value })}
                required={required}
                style={{ width:'100%', fontFamily:'var(--font-body)', fontSize:'1rem',
                  background:'transparent', border:'none',
                  borderBottom:'2.5px solid var(--color-ink)',
                  padding:'0.35rem 0.2rem', outline:'none', color:'var(--color-ink)' }}/>
            </div>
          ))}

          {/* Status */}
          <div>
            <label style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
              color:'var(--color-pencil)', fontWeight:600,
              display:'flex', alignItems:'center', gap:6, marginBottom:'0.5rem' }}>
              <ClipboardIcon size={15}/> Status
            </label>
            <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
              {STATUS_OPTS.map(s => (
                <motion.button key={s.value} type="button"
                  onClick={() => setForm(f => ({ ...f, status: s.value }))}
                  whileHover={{ y:-1 }} whileTap={{ y:1 }}
                  style={{
                    fontFamily:'var(--font-sketch)', fontSize:'0.85rem', fontWeight:600,
                    border:'2px solid var(--color-ink)', cursor:'pointer',
                    borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
                    padding:'0.2rem 0.75rem',
                    background: form.status===s.value ? 'var(--color-ink)' : 'var(--color-paper)',
                    color: form.status===s.value ? 'var(--color-paper)' : 'var(--color-ink)',
                    boxShadow: form.status===s.value ? '2px 2px 0 var(--color-pencil)' : '2px 2px 0 var(--color-ink)',
                    display:'flex', alignItems:'center', gap:5,
                  }}>
                  {s.icon} {s.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
              color:'var(--color-pencil)', fontWeight:600,
              display:'block', marginBottom:'0.4rem' }}>Type</label>
            <div style={{ display:'flex', gap:'1rem' }}>
              {['novel','learning'].map(t => (
                <label key={t} style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
                  cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                  <input type="radio" name="type" value={t} checked={form.type===t}
                    onChange={() => setForm(f => ({ ...f, type:t }))}
                    style={{ accentColor:'var(--color-ink)' }}/>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
              color:'var(--color-pencil)', fontWeight:600,
              display:'block', marginBottom:'0.5rem' }}>Genres</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
              {GENRES.map((g, i) => (
                <motion.button key={g} type="button"
                  onClick={() => toggleGenre(g)}
                  initial={{ opacity:0, scale:0.8 }}
                  animate={{ opacity:1, scale:1 }}
                  transition={{ delay: i * 0.02, type:'spring', stiffness:300, damping:20 }}
                  whileHover={{ y:-1 }}
                  style={{
                    fontFamily:'var(--font-sketch)', fontSize:'0.78rem', fontWeight:600,
                    border:'1.5px solid var(--color-ink)', cursor:'pointer',
                    borderRadius:'255px 8px 225px 8px / 8px 225px 8px 255px',
                    padding:'0.1rem 0.55rem',
                    background: form.genres.includes(g) ? 'var(--color-ink)' : 'var(--color-paper)',
                    color: form.genres.includes(g) ? 'var(--color-paper)' : 'var(--color-ink)',
                    transition:'background 0.1s',
                  }}>
                  {g}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
            <motion.button type="submit"
              whileHover={{ y:-2, boxShadow:'6px 6px 0 var(--color-ink)' }}
              whileTap={{ y:1, boxShadow:'2px 2px 0 var(--color-ink)' }}
              style={{ flex:1, fontFamily:'var(--font-sketch)', fontSize:'1.1rem',
                fontWeight:700, background:'var(--color-ink)', color:'var(--color-paper)',
                border:'2.5px solid var(--color-ink)',
                borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
                padding:'0.55rem 1.2rem', cursor:'pointer',
                boxShadow:'4px 4px 0 var(--color-pencil)' }}>
              {isEdit ? 'Save Changes' : 'Add Book'}
            </motion.button>
            <motion.button type="button" onClick={onClose}
              whileHover={{ y:-1 }} whileTap={{ y:1 }}
              style={{ fontFamily:'var(--font-sketch)', fontSize:'1rem',
                background:'transparent', border:'2px solid var(--color-ink)',
                borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
                padding:'0.5rem 1.1rem', cursor:'pointer',
                boxShadow:'2px 2px 0 var(--color-ink)' }}>
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}