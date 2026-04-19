import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getUserBooks, addBook, deleteBook, updateBook } from '../services/firestoreBooks'
import PageWrapper, { fadeUp, stagger } from '../components/layout/PageWrapper'
import BookCard from '../components/books/BookCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { toast } from 'react-toastify'
import { Star, Arrow, Zigzag, ScribbleButton, SketchInput } from '../components/ui/DoodleDecor'
import {
  BooksIcon, BookOpenIcon, CheckCircleIcon, ClipboardIcon, TrashIcon,
  PencilIcon, SearchIcon, MailboxIcon, StarFilledIcon, CloseIcon,
  BarChartIcon, PlusIcon
} from '../components/ui/DoodleIcons'

/* ── Status tab config ── */
const STATUS_TABS = [
  { value:'all',      label:'All',          icon:<BooksIcon size={15}/>,       color:'var(--color-ink)' },
  { value:'reading',  label:'Reading',      icon:<BookOpenIcon size={15}/>,    color:'var(--color-ink)' },
  { value:'finished', label:'Finished',     icon:<CheckCircleIcon size={15}/>, color:'var(--color-ink)' },
  { value:'want',     label:'Want to Read', icon:<ClipboardIcon size={15}/>,   color:'var(--color-ink)' },
  { value:'dropped',  label:'Dropped',      icon:<TrashIcon size={15}/>,       color:'var(--color-ink)' },
]

const SORT_OPTIONS = [
  { value:'recent',   label:'Recent'   },
  { value:'title',    label:'A – Z'    },
  { value:'rating',   label:'Rating'   },
  { value:'progress', label:'Progress' },
]

/* ── Animated stat chip ── */
function StatChip({ count, label, icon }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
      transition={{ type:'spring', stiffness:280, damping:20 }}
      style={{
        display:'flex', flexDirection:'column', alignItems:'center',
        gap:'0.2rem', padding:'0.75rem 1.1rem',
        background:'var(--color-paper)',
        border:'2px solid var(--color-ink)',
        borderRadius:'8px 20px 10px 16px / 16px 10px 20px 8px',
        boxShadow:'3px 3px 0 var(--color-ink)',
        minWidth:72,
      }}>
      <span style={{ display:'flex', alignItems:'center', gap:4 }}>{icon}</span>
      <span style={{ fontFamily:'var(--font-sketch)', fontSize:'1.6rem',
        fontWeight:700, lineHeight:1 }}>{count}</span>
      <span style={{ fontFamily:'var(--font-study)', fontSize:'0.72rem',
        color:'var(--color-pencil)', textTransform:'uppercase',
        letterSpacing:'0.06em' }}>{label}</span>
    </motion.div>
  )
}

/* ── Add Book Modal ── */
function AddBookModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title:'', author:'', status:'reading', totalPages:'', genres:'', coverUrl:''
  })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.author.trim())
      return toast.error('Title and author are required')
    setSaving(true)
    try {
      await onAdd({
        title: form.title.trim(), author: form.author.trim(),
        status: form.status, totalPages: parseInt(form.totalPages) || 0,
        currentPage:0, rating:0,
        genres: form.genres.split(',').map(g => g.trim()).filter(Boolean),
        coverUrl: form.coverUrl.trim(), notes:'',
      })
      toast.success('Book added to your library!')
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:'fixed', inset:0, zIndex:60,
        display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem',
        background:'rgba(0,0,0,0.5)',
        backgroundImage:'repeating-linear-gradient(-45deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03) 1px,transparent 1px,transparent 9px)',
        backdropFilter:'blur(2px)'
      }}
      onClick={e => e.target===e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale:0.88, rotate:-2, opacity:0, y:20 }}
        animate={{ scale:1, rotate:-0.5, opacity:1, y:0 }}
        exit={{ scale:0.9, opacity:0, y:10 }}
        transition={{ type:'spring', stiffness:280, damping:24 }}
        style={{
          width:'100%', maxWidth:500, maxHeight:'88vh', overflowY:'auto',
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
            <PencilIcon size={22}/> Add a Book
          </h2>
          <motion.button onClick={onClose}
            whileHover={{ rotate:90, scale:1.1 }} whileTap={{ scale:0.9 }}
            style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}>
            <CloseIcon size={22}/>
          </motion.button>
        </div>

        <form onSubmit={submit} noValidate style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Fields */}
          {[
            { key:'title',      label:'Title *',           placeholder:'e.g. The Great Gatsby', required:true },
            { key:'author',     label:'Author *',          placeholder:'e.g. F. Scott Fitzgerald', required:true },
            { key:'coverUrl',   label:'Cover URL (opt.)',  placeholder:'https://…' },
            { key:'totalPages', label:'Total Pages',       placeholder:'e.g. 320', type:'number' },
            { key:'genres',     label:'Genres (comma-sep)',placeholder:'fiction, romance, …' },
          ].map(({ key, label, placeholder, required, type='text' }) => (
            <div key={key}>
              <label style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
                fontWeight:600, color:'var(--color-pencil)', display:'block',
                marginBottom:'0.3rem' }}>{label}</label>
              <input type={type} value={form[key]} onChange={set(key)}
                placeholder={placeholder} required={required}
                style={{
                  width:'100%', fontFamily:'var(--font-body)', fontSize:'1rem',
                  background:'transparent', border:'none',
                  borderBottom:'2.5px solid var(--color-ink)',
                  padding:'0.35rem 0.2rem', outline:'none', color:'var(--color-ink)',
                }}/>
            </div>
          ))}

          {/* Status pills */}
          <div>
            <label style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
              fontWeight:600, color:'var(--color-pencil)', display:'flex',
              alignItems:'center', gap:6, marginBottom:'0.5rem' }}>
              <ClipboardIcon size={15}/> Reading Status
            </label>
            <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
              {STATUS_TABS.filter(t => t.value !== 'all').map(t => (
                <motion.button key={t.value} type="button"
                  onClick={() => setForm(f => ({ ...f, status: t.value }))}
                  whileHover={{ y:-1 }} whileTap={{ y:1 }}
                  style={{
                    fontFamily:'var(--font-sketch)', fontSize:'0.88rem', fontWeight:600,
                    border:'2px solid var(--color-ink)', cursor:'pointer',
                    borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
                    padding:'0.22rem 0.85rem',
                    background: form.status === t.value ? 'var(--color-ink)' : 'var(--color-paper)',
                    color: form.status === t.value ? 'var(--color-paper)' : 'var(--color-ink)',
                    boxShadow: form.status === t.value ? '2px 2px 0 var(--color-pencil)' : '2px 2px 0 var(--color-ink)',
                    display:'flex', alignItems:'center', gap:5,
                  }}>
                  {t.icon} {t.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <motion.button type="submit" disabled={saving}
            whileHover={{ y:-2, boxShadow:'6px 6px 0 var(--color-ink)' }}
            whileTap={{ y:1, boxShadow:'2px 2px 0 var(--color-ink)' }}
            style={{
              fontFamily:'var(--font-sketch)', fontSize:'1.15rem', fontWeight:700,
              background:'var(--color-ink)', color:'var(--color-paper)',
              border:'2.5px solid var(--color-ink)',
              borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
              padding:'0.65rem 1.5rem', cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow:'4px 4px 0 var(--color-pencil)',
              marginTop:'0.5rem', width:'100%', display:'flex',
              alignItems:'center', justifyContent:'center', gap:8,
              opacity: saving ? 0.7 : 1,
            }}>
            {saving
              ? 'Adding…'
              : <><PlusIcon size={18}/> Add to Notebook</>
            }
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}

/* ── Main Library page ── */
export default function Library() {
  const { user } = useAuth()
  const [books, setBooks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('all')
  const [sort, setSort]       = useState('recent')
  const [search, setSearch]   = useState('')
  const [showModal, setModal] = useState(false)

  const load = () => getUserBooks(user.uid).then(b => { setBooks(b); setLoading(false) })
  useEffect(() => { load() }, [user.uid])

  const handleAdd    = async (data) => { await addBook(user.uid, data); await load() }
  const handleDelete = async (id)   => { await deleteBook(user.uid, id); await load(); toast.success('Removed') }
  const handleUpdate = async (id, data) => { await updateBook(user.uid, id, data); await load() }

  /* ── Per-status counts ── */
  const counts = {
    all:      books.length,
    reading:  books.filter(b => b.status === 'reading').length,
    finished: books.filter(b => b.status === 'finished').length,
    want:     books.filter(b => b.status === 'want').length,
    dropped:  books.filter(b => b.status === 'dropped').length,
  }

  const visible = books
    .filter(b => tab === 'all' || b.status === tab)
    .filter(b => !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'title')    return a.title.localeCompare(b.title)
      if (sort === 'rating')   return (b.rating||0) - (a.rating||0)
      if (sort === 'progress') return ((b.currentPage||0)/(b.totalPages||1)) - ((a.currentPage||0)/(a.totalPages||1))
      return (b.addedAt?.seconds||0) - (a.addedAt?.seconds||0)
    })

  if (loading) return <LoadingSpinner text="Loading your library…"/>

  return (
    <PageWrapper>

      {/* ── Header ── */}
      <motion.div variants={fadeUp} initial="initial" animate="animate"
        style={{ marginBottom:'2rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <Star size={28} opacity={0.55}/>
              <h1 style={{ fontFamily:'var(--font-sketch)',
                fontSize:'clamp(2.2rem, 5vw, 3.4rem)', fontWeight:700, color:'var(--color-ink)' }}>
                My Library
              </h1>
              <Star size={20} opacity={0.4}/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.3rem' }}>
              <Arrow size={30} opacity={0.3}/>
              <p style={{ fontFamily:'var(--font-study)', fontSize:'1rem',
                color:'var(--color-pencil)' }}>
                {books.length} book{books.length!==1?'s':''} in your collection
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => setModal(true)}
            whileHover={{ y:-2, boxShadow:'6px 6px 0 var(--color-ink)', rotate:-1 }}
            whileTap={{ y:1, boxShadow:'2px 2px 0 var(--color-ink)' }}
            style={{
              fontFamily:'var(--font-sketch)', fontSize:'1.1rem', fontWeight:700,
              background:'var(--color-ink)', color:'var(--color-paper)',
              border:'2.5px solid var(--color-ink)',
              borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
              padding:'0.5rem 1.4rem', cursor:'pointer',
              boxShadow:'4px 4px 0 var(--color-pencil)',
              display:'flex', alignItems:'center', gap:8,
            }}>
            <PlusIcon size={18}/> Add Book
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      {books.length > 0 && (
        <motion.div variants={stagger} initial="initial" animate="animate"
          style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'1.75rem' }}>
          <StatChip count={counts.reading}  label="Reading"  icon={<BookOpenIcon size={16}/>}/>
          <StatChip count={counts.finished} label="Finished" icon={<CheckCircleIcon size={16}/>}/>
          <StatChip count={counts.want}     label="Want"     icon={<ClipboardIcon size={16}/>}/>
          <StatChip count={counts.dropped}  label="Dropped"  icon={<TrashIcon size={16}/>}/>
          {counts.finished > 0 && (
            <StatChip
              count={`${Math.round((counts.finished / counts.all) * 100)}%`}
              label="Completion"
              icon={<BarChartIcon size={16}/>}
            />
          )}
        </motion.div>
      )}

      {/* ── Search bar ── */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
        transition={{ delay:0.1 }}
        style={{ position:'relative', marginBottom:'1.25rem', maxWidth:500 }}>
        <span style={{ position:'absolute', left:14, top:'50%',
          transform:'translateY(-50%)', display:'flex', pointerEvents:'none' }}>
          <SearchIcon size={18}/>
        </span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or author…"
          style={{
            width:'100%',
            padding:'0.65rem 1rem 0.65rem 2.8rem',
            fontFamily:'var(--font-body)', fontSize:'1rem', color:'var(--color-ink)',
            background:'var(--color-paper)', border:'2.5px solid var(--color-ink)', outline:'none',
            borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
            boxShadow:'4px 4px 0 var(--color-ink)',
          }}/>
      </motion.div>

      {/* ── Status tabs ── */}
      <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.9rem' }}>
        {STATUS_TABS.map((t, i) => (
          <motion.button key={t.value} onClick={() => setTab(t.value)}
            initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.08 + i*0.05, type:'spring', stiffness:300, damping:22 }}
            whileHover={{ y:-2, boxShadow: tab===t.value ? '5px 5px 0 var(--color-pencil)' : '4px 4px 0 var(--color-ink)' }}
            whileTap={{ y:1 }}
            style={{
              fontFamily:'var(--font-sketch)', fontSize:'0.95rem', fontWeight:600,
              border:'2px solid var(--color-ink)',
              borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
              padding:'0.28rem 0.9rem', cursor:'pointer',
              background: tab===t.value ? 'var(--color-ink)' : 'var(--color-paper)',
              color: tab===t.value ? 'var(--color-paper)' : 'var(--color-ink)',
              boxShadow: tab===t.value ? '3px 3px 0 var(--color-pencil)' : '3px 3px 0 var(--color-ink)',
              display:'inline-flex', alignItems:'center', gap:5,
            }}>
            {t.icon} {t.label}
            {counts[t.value] > 0 && (
              <span style={{
                fontFamily:'var(--font-sketch)', fontSize:'0.7rem',
                background: tab===t.value ? 'rgba(255,255,255,0.15)' : 'var(--color-paper-worn)',
                borderRadius:'50%', minWidth:18, height:18,
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                marginLeft:2,
              }}>
                {counts[t.value]}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* ── Sort row ── */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem',
        marginBottom:'1.4rem', flexWrap:'wrap' }}>
        <span style={{ fontFamily:'var(--font-sketch)', fontSize:'0.9rem',
          color:'var(--color-pencil)' }}>Sort by:</span>
        {SORT_OPTIONS.map(s => (
          <motion.button key={s.value} onClick={() => setSort(s.value)}
            whileHover={{ y:-1 }} whileTap={{ y:1 }}
            style={{
              fontFamily:'var(--font-sketch)', fontSize:'0.85rem', fontWeight:600,
              border:'1.5px solid var(--color-ink)',
              borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
              padding:'0.15rem 0.75rem', cursor:'pointer',
              background: sort===s.value ? 'var(--color-ink)' : 'transparent',
              color: sort===s.value ? 'var(--color-paper)' : 'var(--color-ink)',
              boxShadow: sort===s.value ? '2px 2px 0 var(--color-pencil)' : 'none',
              transition:'background 0.1s',
            }}>
            {s.label}
          </motion.button>
        ))}
      </div>

      <div style={{ marginBottom:'1.4rem' }}><Zigzag opacity={0.18}/></div>

      {/* ── Book grid / empty state ── */}
      <AnimatePresence mode="wait">
        {visible.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(172px, 1fr))',
              gap:'1.4rem',
            }}>
            <AnimatePresence mode="popLayout">
              {visible.map((b, i) => (
                <BookCard key={b.id} book={b} index={i}
                  onDelete={handleDelete} onUpdate={handleUpdate}/>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="empty"
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }}
            style={{ textAlign:'center', padding:'4.5rem 2rem',
              border:'2.5px dashed var(--color-pencil-faint)',
              borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px' }}>

            <motion.div
              animate={{ y:[0,-8,0] }}
              transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
              style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}>
              {search
                ? <SearchIcon size={60} strokeWidth={1.3}/>
                : tab==='all'
                  ? <MailboxIcon size={60} strokeWidth={1.3}/>
                  : <ClipboardIcon size={60} strokeWidth={1.3}/>
              }
            </motion.div>

            <h3 style={{ fontFamily:'var(--font-sketch)', fontSize:'2rem',
              fontWeight:700, marginBottom:'0.4rem' }}>
              {search ? 'No matches found' : tab==='all' ? 'Your shelf is empty' : `No ${tab} books`}
            </h3>
            <p style={{ fontFamily:'var(--font-study)', color:'var(--color-pencil)',
              marginBottom:'1.75rem', fontSize:'1.05rem' }}>
              {search
                ? 'Try different keywords.'
                : 'Start adding books to fill your notebook!'}
            </p>

            {!search && (
              <motion.button onClick={() => setModal(true)}
                whileHover={{ y:-2, boxShadow:'6px 6px 0 var(--color-ink)' }}
                whileTap={{ y:1 }}
                style={{
                  fontFamily:'var(--font-sketch)', fontSize:'1.1rem', fontWeight:700,
                  background:'var(--color-ink)', color:'var(--color-paper)',
                  border:'2.5px solid var(--color-ink)',
                  borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
                  padding:'0.55rem 1.5rem', cursor:'pointer',
                  boxShadow:'4px 4px 0 var(--color-pencil)',
                  display:'inline-flex', alignItems:'center', gap:8,
                }}>
                <PlusIcon size={18}/> Add First Book
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add book modal ── */}
      <AnimatePresence>
        {showModal && (
          <AddBookModal onClose={() => setModal(false)} onAdd={handleAdd}/>
        )}
      </AnimatePresence>

    </PageWrapper>
  )
}