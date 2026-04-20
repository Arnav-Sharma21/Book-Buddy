import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { addBook } from '../services/firestoreBooks'
import PageWrapper, { fadeUp, stagger } from '../components/layout/PageWrapper'
import { toast } from 'react-toastify'
import { Star, Arrow, Zigzag, ScribbleButton } from '../components/ui/DoodleDecor'
import {
  SearchIcon, PencilIcon, PageIcon, BookOpenIcon,
  ArrowRightIcon, CloseIcon, RefreshIcon
} from '../components/ui/DoodleIcons'


/* ─────────────────────────────────────────
   Google Books API
───────────────────────────────────────── */
const GBOOKS = 'https://www.googleapis.com/books/v1/volumes'

async function searchGoogleBooks(query, startIndex = 0, maxResults = 20) {
  if (!query.trim()) return { items: [], totalItems: 0 }

  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

  // Clean the query a bit
  const cleanQuery = query.trim()

  const params = new URLSearchParams({
    q: cleanQuery,
    startIndex: String(startIndex),
    maxResults: String(maxResults),
    printType: 'books',
    // langRestrict: 'en', // Removing this temporarily to See if it helps results
  })

  if (key && key !== 'undefined' && key.length > 5) {
    params.append('key', key)
  }

  try {
    let res = await fetch(`${GBOOKS}?${params}`)
    
    // Fallback: If the API key is problematic (503/403), try once without it
    if ((res.status === 503 || res.status === 403) && params.has('key')) {
      console.warn(`Google Books API returned ${res.status} with key. Retrying without key...`)
      params.delete('key')
      res = await fetch(`${GBOOKS}?${params}`)
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      console.error('Google Books API Error:', body)
      // Specific handling for quota or key errors
      if (res.status === 403) throw new Error('API Key issue or Quota exceeded. Check if Books API is enabled.')
      if (res.status === 429) throw new Error('Too many requests. Please wait a moment.')
      throw new Error(body?.error?.message || `Error ${res.status}: ${res.statusText}`)
    }

    return res.json()
  } catch (err) {
    console.error('Fetch failed:', err)
    throw err
  }
}

function parseBook(item) {
  const v = item.volumeInfo || {}
  return {
    id: item.id,
    title: v.title || 'Untitled',
    author: (v.authors || ['Unknown']).join(', '),
    cover: (v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail)?.replace('http:', 'https:') || null,
    pages: v.pageCount || 0,
    genres: (v.categories || []).map(c => c.split(' / ')[0].toLowerCase()),
    description: v.description || '',
    published: v.publishedDate ? v.publishedDate.slice(0, 4) : '',
    language: v.language || '',
    rating: v.averageRating || 0,
    ratingCount: v.ratingsCount || 0,
    previewLink: v.previewLink || '',
  }
}


/* ─────────────────────────────────────────
   Loading animation
───────────────────────────────────────── */
function DoodleLoader({ text = 'Searching…' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ textAlign: 'center', padding: '3rem 0' }}
    >
      <div style={{ maxWidth: 320, margin: '0 auto 1rem' }}>
        <div
          style={{
            fontFamily: 'var(--font-sketch)',
            fontSize: '1rem',
            color: 'var(--color-pencil)',
            marginBottom: '0.6rem',
          }}
        >
          {text}
        </div>

        <div className="doodle-progress-bar" style={{ maxWidth: 280, margin: '0 auto 0.5rem' }}>
          <div className="doodle-progress-bar-fill" />
        </div>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <motion.div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                border: '1.5px solid var(--color-ink)',
                background: 'transparent',
              }}
              animate={{ background: ['transparent', 'var(--color-ink)', 'transparent'] }}
              transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </div>
      </div>

      <motion.svg
        width="60"
        height="20"
        viewBox="0 0 60 20"
        fill="none"
        style={{ margin: '0 auto', opacity: 0.3 }}
      >
        <motion.path
          d="M2,15 Q15,5 30,13 Q45,3 58,12"
          stroke="var(--color-ink)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </motion.svg>
    </motion.div>
  )
}


/* ─────────────────────────────────────────
   Book detail modal
───────────────────────────────────────── */
function BookModal({ book, onClose, onAdd, added, adding }) {
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!book) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(26,26,26,0.55)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <motion.div
          initial={{ scale: 0.88, rotate: -2, opacity: 0 }}
          animate={{ scale: 1, rotate: -0.5, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--color-paper)',
            width: '100%',
            maxWidth: 520,
            border: '2.5px solid var(--color-ink)',
            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
            boxShadow: '8px 8px 0 var(--color-ink)',
            padding: '1.8rem',
            maxHeight: '85vh',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 14,
              right: 18,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <CloseIcon size={22} />
          </button>

          <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            {book.cover ? (
              <motion.img
                src={book.cover}
                alt={book.title}
                initial={{ rotate: -3 }}
                animate={{ rotate: 0 }}
                style={{
                  width: 90,
                  height: 130,
                  objectFit: 'cover',
                  border: '2px solid var(--color-ink)',
                  boxShadow: '4px 4px 0 var(--color-ink)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 90,
                  height: 130,
                  border: '2px solid var(--color-ink)',
                  background: 'var(--color-paper-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BookOpenIcon size={36} strokeWidth={1.4} />
              </div>
            )}

            <div style={{ flex: 1, minWidth: 180 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-sketch)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: '0.3rem',
                }}
              >
                {book.title}
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-study)',
                  fontSize: '0.95rem',
                  color: 'var(--color-pencil)',
                  marginBottom: '0.4rem',
                }}
              >
                <PencilIcon size={13} style={{ marginBottom: '-2px', marginRight: 4 }} />
                {book.author}
              </p>

              {book.published && (
                <p
                  style={{
                    fontFamily: 'var(--font-study)',
                    fontSize: '0.85rem',
                    color: 'var(--color-pencil-light)',
                  }}
                >
                  {book.published}
                </p>
              )}

              {book.rating > 0 && (
                <p
                  style={{
                    fontFamily: 'var(--font-sketch)',
                    fontSize: '0.9rem',
                    marginTop: '0.3rem',
                  }}
                >
                  {'★'.repeat(Math.round(book.rating))}
                  {'☆'.repeat(5 - Math.round(book.rating))}{' '}
                  <span style={{ color: 'var(--color-pencil)', fontSize: '0.8rem' }}>
                    ({book.ratingCount})
                  </span>
                </p>
              )}
            </div>
          </div>

          {book.pages > 0 && (
            <p
              style={{
                fontFamily: 'var(--font-study)',
                fontSize: '0.88rem',
                color: 'var(--color-pencil)',
                marginBottom: '0.6rem',
              }}
            >
              <PageIcon size={13} style={{ marginBottom: '-2px', marginRight: 4 }} />
              {book.pages} pages
            </p>
          )}

          {book.genres.length > 0 && (
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
              {book.genres.slice(0, 5).map(g => (
                <span key={g} className="tag-scribble" style={{ fontSize: '0.78rem' }}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {book.description && (
            <p
              style={{
                fontFamily: 'var(--font-study)',
                fontSize: '0.9rem',
                color: 'var(--color-pencil)',
                lineHeight: 1.65,
                marginBottom: '1.1rem',
                borderLeft: '3px solid var(--color-pencil-faint)',
                paddingLeft: '0.7rem',
                display: '-webkit-box',
                WebkitLineClamp: 6,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {book.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <ScribbleButton
              primary={!added.has(book.id)}
              disabled={added.has(book.id) || adding === book.id}
              onClick={() => onAdd(book)}
            >
              {added.has(book.id) ? '✓ Added to Library' : adding === book.id ? 'Adding…' : '+ Want to Read'}
            </ScribbleButton>

            {book.previewLink && (
              <ScribbleButton as="a" href={book.previewLink} target="_blank" rel="noreferrer">
                Preview →
              </ScribbleButton>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


/* ─────────────────────────────────────────
   Genre chips
───────────────────────────────────────── */
const QUICK_GENRES = [
  { label: 'Fiction', q: 'subject:fiction' },
  { label: 'Fantasy', q: 'subject:fantasy' },
  { label: 'Sci-Fi', q: 'subject:science fiction' },
  { label: 'Mystery', q: 'subject:mystery' },
  { label: 'Romance', q: 'subject:romance' },
  { label: 'Biography', q: 'subject:biography' },
  { label: 'History', q: 'subject:history' },
  { label: 'Self-Help', q: 'subject:self help' },
  { label: 'Horror', q: 'subject:horror' },
  { label: 'Philosophy', q: 'subject:philosophy' },
]


/* ─────────────────────────────────────────
   Main Explore page
───────────────────────────────────────── */
export default function Explore() {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [added, setAdded] = useState(new Set())
  const [adding, setAdding] = useState(null)
  const [selected, setSelected] = useState(null)
  const inputRef = useRef(null)
  const MAX = 20

  const fetchBooks = useCallback(async (q, startIndex, append = false) => {
    if (!q || !q.trim()) return
    setLoading(true)
    setError(null)

    try {
      const data = await searchGoogleBooks(q, startIndex ?? 0, MAX)
      const books = (data.items || []).map(parseBook)
      
      if (books.length === 0 && !append) {
        setResults([])
        setTotal(0)
      } else {
        setResults(prev => (append ? [...prev, ...books] : books))
        setTotal(Math.min(data.totalItems || 0, 400)) // Allowing up to 400 results
      }
    } catch (e) {
      console.error('Explore Fetch Error:', e)
      setError(e.message || 'Could not reach Google Books. Please check your connection or API key.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = e => {
    e?.preventDefault()
    if (!input.trim()) return
    const q = input.trim()
    setQuery(q)
    setPage(0)
    setResults([])
    fetchBooks(q, 0, false)
  }

  const handleQuickGenre = (q, label) => {
    setInput(label)
    setQuery(q)
    setPage(0)
    setResults([])
    fetchBooks(q, 0, false)
  }

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    fetchBooks(query, next * MAX, true)
  }

  const handleAdd = async book => {
    if (!user) {
      toast.error('Please sign in to add books.')
      return
    }

    setAdding(book.id)
    try {
      await addBook(user.uid, {
        title: book.title,
        author: book.author,
        status: 'want',
        totalPages: book.pages || 0,
        currentPage: 0,
        rating: 0,
        genres: book.genres,
        coverUrl: book.cover || '',
        notes: '',
      })
      setAdded(s => new Set([...s, book.id]))
      toast.success(`"${book.title}" added to Want to Read!`)
      if (selected?.id === book.id) setSelected(null)
    } catch {
      toast.error('Could not add book. Try again.')
    } finally {
      setAdding(null)
    }
  }

  useEffect(() => {
    const DEFAULT = 'bestseller books 2024'
    setQuery(DEFAULT)
    setInput(DEFAULT)
    fetchBooks(DEFAULT, 0, false)
  }, [fetchBooks])

  const hasMore = results.length < total && total > 0

  return (
    <PageWrapper>
      <motion.div variants={fadeUp} initial="initial" animate="animate" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Star size={28} opacity={0.55} />
          <h1
            style={{
              fontFamily: 'var(--font-sketch)',
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              fontWeight: 700,
              color: 'var(--color-ink)',
          }}
          >
            Explore Books
          </h1>
          <Star size={22} opacity={0.4} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
          <Arrow size={30} opacity={0.3} />
          <p style={{ fontFamily: 'var(--font-study)', fontSize: '1rem', color: 'var(--color-pencil)' }}>
            Search millions of books via Google Books
          </p>
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', maxWidth: 620 }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              pointerEvents: 'none',
            }}
          >
            <SearchIcon size={18} />
          </span>

          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Search by title, author, genre, ISBN…"
            style={{
              width: '100%',
              padding: '0.7rem 1rem 0.7rem 2.8rem',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--color-ink)',
              background: 'var(--color-paper)',
              border: '2.5px solid var(--color-ink)',
              outline: 'none',
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
              boxShadow: '4px 4px 0 var(--color-ink)',
            }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="btn-scribble"
          style={{
            background: 'var(--color-ink)',
            color: 'var(--color-paper)',
            borderColor: 'var(--color-ink)',
            boxShadow: '4px 4px 0 var(--color-pencil)',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            padding: '0.65rem 1.4rem',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          whileHover={!loading ? { y: -2, boxShadow: '6px 6px 0 var(--color-ink)' } : {}}
          whileTap={!loading ? { y: 1, boxShadow: '2px 2px 0 var(--color-ink)' } : {}}
        >
          {loading ? 'Searching…' : 'Search →'}
        </motion.button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.14 }}
        style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}
      >
        {QUICK_GENRES.map(({ label, q }, i) => (
          <motion.button
            key={label}
            onClick={() => handleQuickGenre(q, label)}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 + i * 0.035, type: 'spring', stiffness: 280, damping: 18 }}
            whileHover={{ y: -2, rotate: -1, boxShadow: '4px 4px 0 var(--color-ink)' }}
            whileTap={{ y: 1, rotate: 0 }}
            style={{
              fontFamily: 'var(--font-sketch)',
              fontSize: '0.9rem',
              fontWeight: 600,
              border: '2px solid var(--color-ink)',
              cursor: 'pointer',
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
              padding: '0.22rem 0.85rem',
              background: query === q ? 'var(--color-ink)' : 'var(--color-paper)',
              color: query === q ? 'var(--color-paper)' : 'var(--color-ink)',
              boxShadow: '2px 2px 0 var(--color-ink)',
              transition: 'background 0.1s',
            }}
          >
            {label}
          </motion.button>
        ))}
      </motion.div>

      <div style={{ marginBottom: '1.2rem' }}>
        <Zigzag opacity={0.18} />
      </div>

      {!loading && results.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontFamily: 'var(--font-sketch)',
            fontSize: '1rem',
            color: 'var(--color-pencil)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Star size={13} opacity={0.5} />
          {total > 0 ? `${total}+ books found` : `${results.length} results`}
          {query && <> for &ldquo;{query}&rdquo;</>}
        </motion.p>
      )}

      {loading && results.length === 0 && <DoodleLoader text="Searching the shelves…" />}

      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            padding: '3rem',
            border: '2px dashed var(--color-pencil-faint)',
            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sketch)',
              fontSize: '1.1rem',
              marginBottom: '1rem',
              color: 'var(--color-ink)',
            }}
          >
            ⚠️ {error}
          </p>
          <ScribbleButton onClick={() => fetchBooks(query, page * MAX)}>
            <RefreshIcon size={16} style={{ marginBottom: '-2px', marginRight: 4 }} />
            Retry
          </ScribbleButton>
        </motion.div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            border: '2.5px dashed var(--color-pencil-faint)',
            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <SearchIcon size={52} strokeWidth={1.4} />
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-sketch)',
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: '0.4rem',
            }}
          >
            No matches found
          </h3>
          <p style={{ fontFamily: 'var(--font-study)', color: 'var(--color-pencil)' }}>
            We couldn't find any books for &ldquo;{query}&rdquo;. <br/>
            Try checking for typos or using broader keywords.
          </p>
        </motion.div>
      )}

      {results.length > 0 && (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.1rem',
            marginBottom: '2rem',
          }}
        >
          <AnimatePresence>
            {results.map((book, i) => (
              <motion.div
                key={book.id}
                variants={fadeUp}
                layout
                initial={{ opacity: 0, y: 18, rotate: i % 2 === 0 ? -1 : 1 }}
                animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -0.5 : 0.5 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  delay: Math.min(i * 0.028, 0.35),
                  type: 'spring',
                  stiffness: 260,
                  damping: 22,
                }}
                whileHover={{
                  scale: 1.03,
                  rotate: 0,
                  boxShadow: '7px 7px 0 var(--color-ink)',
                  transition: { duration: 0.15 },
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(book)}
                style={{
                  background: 'var(--color-paper)',
                  border: '2.5px solid var(--color-ink)',
            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  boxShadow: '4px 4px 0 var(--color-ink)',
                  padding: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', top: 8, right: 12, zIndex: 1 }}>
                  <Star size={12} opacity={0.18} />
                </div>

                {book.cover ? (
                  <div
                    style={{
                      height: 160,
                      overflow: 'hidden',
                      borderBottom: '2px solid var(--color-ink)',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={book.cover}
                      alt={book.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.3s',
                      }}
                      onMouseEnter={e => (e.target.style.transform = 'scale(1.06)')}
                      onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
                      onError={e => {
                        e.target.style.display = 'none'
                        e.target.parentElement.style.background = 'var(--color-paper-dark)'
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 140,
                      borderBottom: '2px solid var(--color-ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--color-paper-dark)',
                    }}
                  >
                    <BookOpenIcon size={44} strokeWidth={1.2} />
                  </div>
                )}

                <div style={{ padding: '0.85rem 0.9rem' }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-sketch)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      lineHeight: 1.25,
                      marginBottom: '0.18rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {book.title}
                  </p>

                  <p
                    style={{
                      fontFamily: 'var(--font-study)',
                      fontSize: '0.82rem',
                      color: 'var(--color-pencil)',
                      marginBottom: '0.45rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {book.author}
                  </p>

                  {book.genres.length > 0 && (
                    <span
                      className="tag-scribble"
                      style={{ fontSize: '0.72rem', marginBottom: '0.5rem', display: 'inline-block' }}
                    >
                      {book.genres[0]}
                    </span>
                  )}

                  <div style={{ marginTop: '0.6rem' }}>
                    <motion.button
                      onClick={e => {
                        e.stopPropagation()
                        handleAdd(book)
                      }}
                      disabled={added.has(book.id) || adding === book.id}
                      whileHover={!added.has(book.id) ? { y: -1 } : {}}
                      whileTap={!added.has(book.id) ? { y: 1 } : {}}
                      style={{
                        fontFamily: 'var(--font-sketch)',
                        fontSize: '0.82rem',
                        border: '2px solid var(--color-ink)',
                        borderRadius: '255px 15px/15px 255px',
                        padding: '0.2rem 0.75rem',
                        cursor: added.has(book.id) ? 'default' : 'pointer',
                        background: added.has(book.id) ? 'var(--color-paper-dark)' : 'var(--color-ink)',
                        color: added.has(book.id) ? 'var(--color-pencil)' : 'var(--color-paper)',
                        boxShadow: added.has(book.id) ? 'none' : '2px 2px 0 var(--color-pencil)',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {added.has(book.id) ? '✓ Added' : adding === book.id ? 'Adding…' : '+ Want to Read'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {loading && results.length > 0 && (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <DoodleLoader text="Loading more…" />
        </div>
      )}

      {hasMore && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.button
            onClick={handleLoadMore}
            className="btn-scribble"
            whileHover={{ y: -2, rotate: -1, boxShadow: '5px 5px 0 var(--color-ink)' }}
            whileTap={{ y: 1, rotate: 0 }}
          >
            <ArrowRightIcon size={16} style={{ marginBottom: '-2px', marginRight: 4 }} />
            Load more books
          </motion.button>
        </motion.div>
      )}

      {selected && (
        <BookModal
          book={selected}
          onClose={() => setSelected(null)}
          onAdd={handleAdd}
          added={added}
          adding={adding}
        />
      )}
    </PageWrapper>
  )
}