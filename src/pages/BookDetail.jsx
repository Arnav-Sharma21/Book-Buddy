import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { updateBook, deleteBook } from '../services/firestoreBooks'
import { useAuth } from '../context/AuthContext'
import PageWrapper, { fadeUp } from '../components/layout/PageWrapper'
import StarRating from '../components/books/StarRating'
import GenreIcon from '../components/books/GenreIcon'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import QuotesBook from '../components/quotes/QuotesBook'
import WordNotebook from '../components/words/WordNotebook'
import WordModal from '../components/words/WordModal'
import NearbyStores from '../components/nearby/NearbyStores'
import BookForm from '../components/books/BookForm'
import DoodleBook from '../components/ui/DoodleBook'
import { useQuotes } from '../hooks/useQuotes'
import { useWordNotes } from '../hooks/useWordNotes'
import { Star, Arrow, Zigzag } from '../components/ui/DoodleDecor'
import {
  PencilIcon, TrashIcon, BarChartIcon, StarFilledIcon,
  BookOpenIcon, TextIcon, MapPinIcon, SaveIcon,
  CheckCircleIcon, ClipboardIcon, CloseIcon, SparkleIcon
} from '../components/ui/DoodleIcons'

/* ── Status badge config ── */
const STATUS_CONFIG = {
  reading:  { label:'Currently Reading', icon:<BookOpenIcon size={14}/>,   inv:false },
  finished: { label:'Finished',          icon:<CheckCircleIcon size={14}/>, inv:true  },
  want:     { label:'Want to Read',      icon:<ClipboardIcon size={14}/>,  inv:false },
  dropped:  { label:'Dropped',           icon:<TrashIcon size={14}/>,      inv:false },
}

/* ── Hatched progress bar ── */
function DoodleProgressBar({ current, total }) {
  const pct   = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  const done  = pct >= 100
  return (
    <div>
      <div style={{ height:20, background:'var(--color-paper-worn)',
        border:'2.5px solid var(--color-ink)',
        borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
        overflow:'hidden', position:'relative' }}>
        <motion.div
          initial={{ width:0 }} animate={{ width:`${pct}%` }}
          transition={{ duration:1.1, ease:[0.22,1,0.36,1], delay:0.25 }}
          style={{
            height:'100%',
            background: done
              ? 'var(--color-ink)'
              : 'repeating-linear-gradient(-45deg,var(--color-ink) 0,var(--color-ink) 3px,transparent 3px,transparent 10px)',
          }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginTop:'0.35rem' }}>
        <span style={{ fontFamily:'var(--font-sketch)', fontSize:'0.85rem',
          color:'var(--color-pencil)' }}>p. {current} / {total||'?'}</span>
        <motion.span
          initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ delay:1, type:'spring', stiffness:300, damping:18 }}
          style={{ fontFamily:'var(--font-sketch)', fontSize:'1.1rem',
            fontWeight:700, color: done ? 'var(--color-ink)' : 'var(--color-pencil)' }}>
          {pct}%{done && ' ✓'}
        </motion.span>
      </div>
    </div>
  )
}

/* ── Doodle section card ── */
function Section({ title, icon, children, delay=0 }) {
  return (
    <motion.section
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ delay, ease:[0.22,1,0.36,1], duration:0.45 }}
      style={{
        background:'var(--color-paper)',
        border:'2.5px solid var(--color-ink)',
        borderRadius:'8px 24px 12px 20px / 20px 12px 24px 8px',
        boxShadow:'5px 5px 0 var(--color-ink)',
        padding:'1.5rem', marginBottom:'1.4rem', position:'relative',
        overflow:'visible',
      }}>
      {/* tape strip on top */}
      <div style={{ position:'absolute', top:-10, left:'50%',
        transform:'translateX(-50%) rotate(-0.8deg)',
        width:52, height:18, background:'rgba(26,26,26,0.07)',
        borderTop:'1px solid rgba(26,26,26,0.1)',
        borderBottom:'1px solid rgba(26,26,26,0.1)',
        zIndex:3 }}/>
      <h2 style={{ fontFamily:'var(--font-sketch)', fontSize:'1.6rem',
        fontWeight:700, marginBottom:'1rem',
        display:'flex', alignItems:'center', gap:'0.5rem' }}>
        {icon} {title}
      </h2>
      {children}
    </motion.section>
  )
}

/* ── Confirm-delete button with 2-step confirm ── */
function DeleteButton({ onConfirm }) {
  const [arm, setArm] = useState(false)
  return arm ? (
    <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
      style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
      <span style={{ fontFamily:'var(--font-sketch)', fontSize:'0.9rem',
        color:'var(--color-pencil)' }}>Sure?</span>
      <motion.button whileHover={{ y:-1 }} whileTap={{ y:1 }}
        onClick={onConfirm}
        style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
          background:'var(--color-ink)', color:'var(--color-paper)',
          border:'2px solid var(--color-ink)',
          borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
          padding:'0.25rem 0.9rem', cursor:'pointer',
          boxShadow:'2px 2px 0 var(--color-pencil)' }}>
        Yes, remove
      </motion.button>
      <motion.button whileHover={{ y:-1 }} whileTap={{ y:1 }}
        onClick={() => setArm(false)}
        style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
          background:'transparent',
          border:'2px solid var(--color-ink)',
          borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
          padding:'0.25rem 0.9rem', cursor:'pointer' }}>
        Cancel
      </motion.button>
    </motion.div>
  ) : (
    <motion.button whileHover={{ y:-1 }} whileTap={{ y:1 }}
      onClick={() => setArm(true)}
      style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
        background:'transparent',
        border:'2px solid var(--color-ink)',
        borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
        padding:'0.3rem 1rem', cursor:'pointer',
        boxShadow:'2px 2px 0 var(--color-ink)',
        display:'flex', alignItems:'center', gap:6 }}>
      <TrashIcon size={15}/> Remove
    </motion.button>
  )
}

/* ── Book shelf — four DoodleBook cards ── */
function BookShelf({ bookId, onOpenQuotes, onOpenWords, onOpenWordNote, onOpenLoreNote, onOpenNearby }) {
  const { quotes }    = useQuotes(bookId)
  const { wordNotes } = useWordNotes(bookId)

  const BOOKS = [
    {
      title:'Quotes Journal', subtitle:'Your highlights', color:'#f5e6c8',
      icon:<BookOpenIcon size={40} strokeWidth={1.2}/>, count: quotes?.length,
      onClick: onOpenQuotes, delay:0.28,
    },
    {
      title:'Word Notebook', subtitle:'Vocab & lore', color:'#dbeafe',
      icon:<TextIcon size={40} strokeWidth={1.2}/>, count: wordNotes?.length,
      onClick: onOpenWords, delay:0.34,
    },
    {
      title:'Quick Word Note', subtitle:'Look up a word', color:'#d1fae5',
      icon:<PencilIcon size={40} strokeWidth={1.2}/>, count: null,
      onClick: onOpenWordNote, delay:0.4,
    },

    {
      title:'Nearby Stores', subtitle:'Find bookshops', color:'#fce7f3',
      icon:<MapPinIcon size={40} strokeWidth={1.2}/>, count: null,
      onClick: onOpenNearby, delay:0.46,
    },
  ]

  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:0.25, ease:[0.22,1,0.36,1] }}
      style={{ marginBottom:'2.5rem' }}>
      {/* Shelf header */}
      <h2 style={{ fontFamily:'var(--font-sketch)', fontSize:'1.4rem',
        fontWeight:700, marginBottom:'1.5rem',
        display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <Star size={18} opacity={0.6}/> Your Notebooks
      </h2>

      {/* Shelf plank */}
      <div style={{ position:'relative' }}>
        {/* Books row */}
        <div style={{ display:'flex', gap:'1.8rem', flexWrap:'wrap',
          padding:'1rem 1rem 0', justifyContent:'center' }}>
          {BOOKS.map(b => (
            <DoodleBook key={b.title}
              title={b.title} subtitle={b.subtitle}
              color={b.color} icon={b.icon}
              count={b.count} delay={b.delay}
              onClick={b.onClick}/>
          ))}
        </div>


      </div>
    </motion.div>
  )
}

/* ── Status changer row ── */
const STATUSES = [
  { value:'reading',  label:'Reading',   icon:<BookOpenIcon size={13}/> },
  { value:'finished', label:'Finished',  icon:<CheckCircleIcon size={13}/> },
  { value:'want',     label:'Want',      icon:<ClipboardIcon size={13}/> },
  { value:'dropped',  label:'Dropped',   icon:<TrashIcon size={13}/> },
]

function StatusChanger({ current, onChange }) {
  return (
    <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginTop:'0.6rem' }}>
      {STATUSES.map(s => (
        <motion.button key={s.value}
          onClick={() => onChange(s.value)}
          whileHover={{ y:-1 }} whileTap={{ y:1 }}
          style={{
            fontFamily:'var(--font-sketch)', fontSize:'0.85rem', fontWeight:600,
            border:'2px solid var(--color-ink)', cursor:'pointer',
            borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
            padding:'0.2rem 0.75rem',
            background: current===s.value ? 'var(--color-ink)' : 'var(--color-paper)',
            color: current===s.value ? 'var(--color-paper)' : 'var(--color-ink)',
            boxShadow: current===s.value ? '2px 2px 0 var(--color-pencil)' : '2px 2px 0 var(--color-ink)',
            display:'flex', alignItems:'center', gap:5,
          }}>
          {s.icon} {s.label}
        </motion.button>
      ))}
    </div>
  )
}

/* ══════ Main component ══════ */
export default function BookDetail() {
  const { bookId }   = useParams()
  const { user }     = useAuth()
  const navigate     = useNavigate()
  const [book, setBook]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [review, setReview]         = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [rating, setRating]         = useState(0)
  const [status, setStatus]         = useState('want')
  const [showQuotes, setShowQuotes] = useState(false)
  const [showWords, setShowWords]   = useState(false)
  const [showWordModal, setShowWordModal] = useState(false)
  const [wordModalTags, setWordModalTags] = useState([])
  const [showNearby, setShowNearby] = useState(false)
  const [showEdit, setShowEdit]     = useState(false)

  const fetchBook = async () => {
    setLoading(true)
    const snap = await getDoc(doc(db, 'books', bookId))
    if (snap.exists() && snap.data().userId === user.uid) {
      const data = { id: snap.id, ...snap.data() }
      setBook(data); setReview(data.review || '')
      setCurrentPage(data.currentPage || 0)
      setRating(data.rating || 0); setStatus(data.status || 'want')
    } else {
      toast.error('Book not found.')
      navigate('/library')
    }
    setLoading(false)
  }

  useEffect(() => { fetchBook() }, [bookId])

  const handleSaveReview = async () => {
    await updateBook(bookId, { rating, review })
    toast.success('Review saved!')
  }

  const handleUpdateProgress = async (val) => {
    const pg = Number(val); setCurrentPage(pg)
    await updateBook(bookId, { currentPage: pg })
    if (book.totalPages && pg >= book.totalPages)
      toast.success("You finished the book! Don't forget to mark it as Finished.")
  }

  const handleStatusChange = async (s) => {
    setStatus(s)
    await updateBook(bookId, { status: s })
    toast.success(`Status updated to "${s}"`)
  }

  const handleDelete = async () => {
    await deleteBook(bookId)
    toast.success('Book removed from your library.')
    navigate('/library')
  }

  const handleEditSave = async (data) => {
    await updateBook(bookId, data)
    toast.success('Book updated!'); setShowEdit(false); fetchBook()
  }

  if (loading) return (
    <PageWrapper><LoadingSpinner text="Opening your book…"/></PageWrapper>
  )
  if (!book) return null

  const st = STATUS_CONFIG[status] || STATUS_CONFIG.want

  return (
    <PageWrapper>

      {/* ── Back link ── */}
      <motion.div variants={fadeUp} initial="initial" animate="animate"
        style={{ marginBottom:'1.5rem' }}>
        <Link to="/library" style={{ textDecoration:'none',
          fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
          color:'var(--color-pencil)', display:'inline-flex', alignItems:'center', gap:5 }}>
          ← Back to Library
        </Link>
      </motion.div>

      {/* ── Book hero ── */}
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        transition={{ ease:[0.22,1,0.36,1], duration:0.45 }}
        style={{
          display:'flex', gap:'1.8rem', flexWrap:'wrap', marginBottom:'2rem',
          background:'var(--color-paper)',
          border:'2.5px solid var(--color-ink)',
          borderRadius:'8px 24px 12px 20px / 20px 12px 24px 8px',
          boxShadow:'6px 6px 0 var(--color-ink)',
          padding:'1.8rem', position:'relative',
        }}>

        {/* tape strip */}
        <div style={{ position:'absolute', top:-10, left:'50%',
          transform:'translateX(-50%) rotate(-1deg)',
          width:60, height:20, background:'rgba(26,26,26,0.07)',
          borderTop:'1px solid rgba(26,26,26,0.1)',
          borderBottom:'1px solid rgba(26,26,26,0.1)', zIndex:3 }}/>

        {/* Cover */}
        {book.coverUrl ? (
          <motion.img
            initial={{ rotate:-4, opacity:0 }} animate={{ rotate:-1, opacity:1 }}
            transition={{ type:'spring', stiffness:200, damping:20, delay:0.1 }}
            src={book.coverUrl} alt={book.title}
            style={{ width:140, height:200, objectFit:'cover', flexShrink:0,
              border:'2.5px solid var(--color-ink)',
              boxShadow:'5px 5px 0 var(--color-ink)',
              filter:'grayscale(15%) contrast(1.05)',
            }}/>
        ) : (
          <motion.div
            initial={{ rotate:-3, opacity:0 }} animate={{ rotate:-1, opacity:1 }}
            transition={{ type:'spring', stiffness:200, damping:20, delay:0.1 }}
            className="cross-hatch"
            style={{ width:140, height:200, flexShrink:0,
              border:'2.5px solid var(--color-ink)',
              boxShadow:'5px 5px 0 var(--color-ink)',
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'var(--color-paper-dark)' }}>
            <BookOpenIcon size={56} strokeWidth={1.1} style={{ opacity:0.18 }}/>
          </motion.div>
        )}

        {/* Info */}
        <div style={{ flex:1, minWidth:200 }}>
          <motion.h1
            initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.12, ease:[0.22,1,0.36,1] }}
            style={{ fontFamily:'var(--font-sketch)',
              fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:700,
              lineHeight:1.15, marginBottom:'0.3rem', color:'var(--color-ink)' }}>
            {book.title}
          </motion.h1>

          <p style={{ fontFamily:'var(--font-sketch)', fontSize:'1.1rem',
            color:'var(--color-pencil)', marginBottom:'0.6rem' }}>
            <PencilIcon size={14} style={{ marginBottom:'-2px', marginRight:5 }}/>
            {book.author}
          </p>

          {/* Genre tags */}
          {book.genres?.length > 0 && (
            <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap',
              marginBottom:'0.8rem' }}>
              {book.genres.map(g => (
                <span key={g} style={{
                  fontFamily:'var(--font-sketch)', fontSize:'0.78rem',
                  border:'1.5px solid var(--color-ink)',
                  borderRadius:'255px 8px 225px 8px / 8px 225px 8px 255px',
                  padding:'0.04rem 0.5rem',
                  display:'inline-flex', alignItems:'center', gap:4,
                }}>
                  <GenreIcon genre={g}/> {g}
                </span>
              ))}
            </div>
          )}

          {/* Status badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:6,
            fontFamily:'var(--font-sketch)', fontSize:'0.85rem',
            border:`2.5px ${st.inv ? 'solid' : 'double'} var(--color-ink)`,
            borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
            padding:'0.18rem 0.75rem', marginBottom:'0.8rem',
            background: st.inv ? 'var(--color-ink)' : 'transparent',
            color: st.inv ? 'var(--color-paper)' : 'var(--color-ink)',
            letterSpacing:'0.05em', textTransform:'uppercase',
          }}>
            {st.icon} {st.label}
          </div>

          {book.totalPages > 0 && (
            <p style={{ fontFamily:'var(--font-study)', fontSize:'0.88rem',
              color:'var(--color-pencil)', marginBottom:'0.9rem' }}>
              {book.totalPages} pages
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
            <motion.button onClick={() => setShowEdit(true)}
              whileHover={{ y:-2 }} whileTap={{ y:1 }}
              style={{ fontFamily:'var(--font-sketch)', fontSize:'0.95rem',
                background:'transparent', border:'2px solid var(--color-ink)',
                borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
                padding:'0.3rem 1rem', cursor:'pointer',
                boxShadow:'2px 2px 0 var(--color-ink)',
                display:'flex', alignItems:'center', gap:6 }}>
              <PencilIcon size={15}/> Edit
            </motion.button>
            <DeleteButton onConfirm={handleDelete}/>
          </div>
        </div>
      </motion.div>

      {/* ── Status changer ── */}
      <Section title="Reading Status" icon={<ClipboardIcon size={20}/>} delay={0.1}>
        <p style={{ fontFamily:'var(--font-study)', fontSize:'0.95rem',
          color:'var(--color-pencil)', marginBottom:'0.3rem' }}>
          Change where this book sits on your shelf:
        </p>
        <StatusChanger current={status} onChange={handleStatusChange}/>
      </Section>

      {/* ── Reading progress ── */}
      {book.totalPages > 0 && (
        <Section title="Reading Progress" icon={<BarChartIcon size={20}/>} delay={0.15}>
          <DoodleProgressBar current={currentPage} total={book.totalPages}/>
          <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', marginTop:'1rem',
            flexWrap:'wrap' }}>
            <label style={{ fontFamily:'var(--font-sketch)', fontSize:'1rem' }}>
              Current page:
            </label>
            <input type="number" min={0} max={book.totalPages}
              value={currentPage}
              onChange={e => handleUpdateProgress(e.target.value)}
              style={{ width:80, textAlign:'center',
                fontFamily:'var(--font-sketch)', fontSize:'1.1rem',
                background:'var(--color-paper)', outline:'none',
                border:'2px solid var(--color-ink)',
                borderRadius:'8px 14px 10px 12px / 12px 10px 14px 8px',
                padding:'0.3rem 0.5rem',
                boxShadow:'2px 2px 0 var(--color-ink)' }}/>
            <span style={{ fontFamily:'var(--font-sketch)', fontSize:'1rem',
              color:'var(--color-pencil)' }}>
              of {book.totalPages}
            </span>
          </div>
        </Section>
      )}

      {/* ── Rating & Review ── */}
      <Section title="Rating & Review" icon={<StarFilledIcon size={20}/>} delay={0.2}>
        <StarRating value={rating} onChange={setRating}/>
        <textarea rows={4} value={review}
          onChange={e => setReview(e.target.value)}
          placeholder="Write your thoughts…"
          style={{
            width:'100%', background:'transparent', outline:'none', resize:'none',
            fontFamily:'var(--font-body)', fontSize:'1rem', lineHeight:1.75,
            padding:'0.5rem 0.3rem', marginTop:'0.8rem',
            borderTop:'none', borderLeft:'none', borderRight:'none',
            borderBottom:'2px solid var(--color-ink)',
            backgroundImage:'repeating-linear-gradient(transparent,transparent 27px,var(--color-pencil-faint) 28px)',
            color:'var(--color-ink)',
          }}/>
        <motion.button onClick={handleSaveReview}
          whileHover={{ y:-2, boxShadow:'5px 5px 0 var(--color-ink)' }}
          whileTap={{ y:1, boxShadow:'2px 2px 0 var(--color-ink)' }}
          style={{ marginTop:'0.85rem',
            fontFamily:'var(--font-sketch)', fontSize:'1rem', fontWeight:700,
            background:'var(--color-ink)', color:'var(--color-paper)',
            border:'2px solid var(--color-ink)',
            borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
            padding:'0.4rem 1.2rem', cursor:'pointer',
            boxShadow:'3px 3px 0 var(--color-pencil)',
            display:'inline-flex', alignItems:'center', gap:7 }}>
          <SaveIcon size={16}/> Save Review
        </motion.button>
      </Section>

      {/* ── Book shelf ── */}
      <BookShelf
        bookId={bookId}
        onOpenQuotes={() => setShowQuotes(true)}
        onOpenWords={()  => setShowWords(true)}
        onOpenWordNote={() => { setWordModalTags([]); setShowWordModal(true) }}
        onOpenLoreNote={() => { setWordModalTags(['lore']); setShowWordModal(true) }}
        onOpenNearby={() => setShowNearby(true)}
      />

      {/* ── Overlays ── */}
      <AnimatePresence>
        {showQuotes && <QuotesBook bookId={bookId} onClose={() => setShowQuotes(false)}/>}
        {showWords && (
          <WordNotebook bookId={bookId}
            onOpenModal={() => { setShowWords(false); setShowWordModal(true) }}
            onClose={() => setShowWords(false)}/>
        )}
        {showWordModal && (
          <WordModal
            bookId={bookId}
            initialTags={wordModalTags}
            onClose={() => setShowWordModal(false)}
          />
        )}
        {showNearby && <NearbyStores onClose={() => setShowNearby(false)}/>}
        {showEdit && (
          <BookForm initial={book} onSubmit={handleEditSave}
            onClose={() => setShowEdit(false)}/>
        )}
      </AnimatePresence>

    </PageWrapper>
  )
}