import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getUserBooks } from '../services/firestoreBooks'
import { fetchRecommendations, deriveGenresFromLibrary } from '../services/recommendationsApi'
import PageWrapper from '../components/layout/PageWrapper'
import BookCard from '../components/books/BookCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Star, Arrow, Zigzag, SectionHeader, ScribbleButton, SketchCard, ScribbleUnderline } from '../components/ui/DoodleDecor'
import {
  BookOpenIcon, BooksIcon, CheckCircleIcon, ClipboardIcon, TheatreIcon,
  LightbulbIcon, SearchIcon, MailboxIcon, StarFilledIcon, PinIcon,
  MedalIcon, WaveIcon, BarChartIcon, DiamondIcon, SparkleIcon, AntennaIcon,
} from '../components/ui/DoodleIcons'

/* ── Genre score computation (for "Reading Taste" section) ── */
function computeGenreScores(books) {
  const finished = books.filter(b => b.status === 'finished')
  const count = {}, ratingSum = {}
  finished.forEach(b => b.genres?.forEach(g => {
    count[g] = (count[g] || 0) + 1
    ratingSum[g] = (ratingSum[g] || 0) + (b.rating || 0)
  }))
  return Object.entries(count).map(([genre, c]) => ({
    genre, count: c, avgRating: ratingSum[genre] / c,
    score: c * 2 + ratingSum[genre] / c,
  })).sort((a, b) => b.score - a.score)
}

/* ── Stat card ── */
function StatCard({ emoji, label, value, rotate, delay }) {
  return (
    <motion.div
      initial={{ opacity:0, y:20, rotate: rotate - 3 }}
      animate={{ opacity:1, y:0, rotate }}
      transition={{ delay, type:'spring', stiffness:220, damping:22 }}
      whileHover={{ rotate:0, scale:1.06, zIndex:10, boxShadow:'8px 8px 0 var(--color-ink)' }}
      style={{
        background: 'var(--color-paper)',
        border: '2.5px solid var(--color-ink)',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        boxShadow: '5px 5px 0 var(--color-ink)',
        padding: '1.4rem 1rem',
        textAlign: 'center',
        transformOrigin: 'center bottom',
        cursor: 'default',
        position: 'relative',
      }}
    >
      <div style={{ position:'absolute', top:6, right:10 }}><Star size={14} opacity={0.3}/></div>
      <div style={{ fontSize:'2.2rem', lineHeight:1, marginBottom:'0.3rem', display:'flex', justifyContent:'center' }}>{emoji}</div>
      <div style={{ fontFamily:'var(--font-sketch)', fontSize:'3.2rem', fontWeight:700, lineHeight:1, color:'var(--color-ink)', marginBottom:'0.2rem' }}>{value}</div>
      <div style={{ fontFamily:'var(--font-sketch)', fontSize:'1rem', color:'var(--color-pencil)' }}>{label}</div>
      <svg viewBox="0 0 100 6" fill="none" style={{ width:'60%', margin:'0.5rem auto 0', display:'block', opacity:0.2 }}>
        <path d="M0,3 Q25,1 50,3 Q75,5 100,3" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </motion.div>
  )
}

/* ── Empty state ── */
function EmptyState({ emoji, title, desc, actionTo, actionLabel }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      style={{ textAlign:'center', padding:'3rem 2rem', border:'2.5px dashed var(--color-pencil-faint)',
        borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px', background:'var(--color-paper-worn)' }}>
      <div style={{ fontSize:'3.5rem', marginBottom:'0.75rem' }}>{emoji}</div>
      <h3 style={{ fontFamily:'var(--font-sketch)', fontSize:'1.7rem', fontWeight:700, color:'var(--color-ink)', marginBottom:'0.4rem' }}>{title}</h3>
      <p style={{ fontFamily:'var(--font-study)', fontSize:'1rem', color:'var(--color-pencil)', marginBottom:'1.5rem', maxWidth:'36ch', marginInline:'auto' }}>{desc}</p>
      {actionTo && (
        <Link to={actionTo} style={{ textDecoration:'none' }}>
          <ScribbleButton primary>{actionLabel}</ScribbleButton>
        </Link>
      )}
    </motion.div>
  )
}

/* ── Recommendation card (live data from Open Library) ── */
function RecCard({ book, index }) {
  return (
    <motion.div
      initial={{ opacity:0, y:18 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: 0.06 + index * 0.07, type:'spring', stiffness:220, damping:22 }}
      whileHover={{ y:-4, rotate:0, boxShadow:'7px 7px 0 var(--color-ink)', transition:{ type:'spring', stiffness:300, damping:20 } }}
      style={{
        background: 'var(--color-paper)',
        border: '2.5px solid var(--color-ink)',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        boxShadow: '4px 4px 0 var(--color-ink)',
        padding: '1rem 1.2rem',
        position: 'relative',
        display: 'flex',
        gap: '0.85rem',
        alignItems: 'flex-start',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, var(--color-pencil-faint) 28px)',
        rotate: `${index % 2 === 0 ? -0.5 : 0.5}deg`,
      }}
    >
      {/* Dog-ear */}
      <div style={{
        position:'absolute', top:0, right:0,
        width:0, height:0, borderStyle:'solid',
        borderWidth:'0 20px 20px 0',
        borderColor:'transparent var(--color-paper-crease) transparent transparent',
      }}/>

      {/* Cover thumbnail or placeholder */}
      <div style={{
        width: 52, height: 72, flexShrink:0,
        border: '2px solid var(--color-pencil-faint)',
        borderRadius: '4px 8px 8px 4px',
        overflow: 'hidden',
        background: 'var(--color-paper-dark)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title}
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onError={e => { e.target.style.display='none' }}
          />
        ) : (
          <BookOpenIcon size={22} strokeWidth={1.2} style={{ opacity:0.25 }}/>
        )}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ position:'absolute', top:6, right:14 }}><Star size={12} opacity={0.22}/></div>

        <p style={{ fontFamily:'var(--font-sketch)', fontSize:'1.05rem', fontWeight:700,
          lineHeight:1.3, color:'var(--color-ink)', marginBottom:'0.2rem',
          overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {book.title}
        </p>
        <p style={{ fontFamily:'var(--font-study)', fontSize:'0.85rem',
          color:'var(--color-pencil)', marginBottom:'0.45rem' }}>
          by {book.author}
        </p>

        <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap' }}>
          {/* Show matched genre as a highlighted pill, then rest */}
          {book.matchedGenre && (
            <span style={{
              fontFamily:'var(--font-sketch)', fontSize:'0.68rem', fontWeight:700,
              background:'var(--color-ink)', color:'var(--color-paper)',
              border:'1.5px solid var(--color-ink)',
              borderRadius:'255px 8px 225px 8px / 8px 225px 8px 255px',
              padding:'0.05rem 0.45rem',
            }}>
              <DiamondIcon size={10} style={{ marginBottom:'-1px', marginRight:2 }}/>
              {book.matchedGenre}
            </span>
          )}
          {book.subjects.slice(0,2).filter(s => s.toLowerCase() !== book.matchedGenre?.toLowerCase()).map(s => (
            <span key={s} style={{
              fontFamily:'var(--font-sketch)', fontSize:'0.65rem',
              border:'1.5px solid var(--color-pencil-faint)',
              borderRadius:'255px 8px 225px 8px / 8px 225px 8px 255px',
              padding:'0.02rem 0.4rem', background:'var(--color-paper)',
              color:'var(--color-pencil)',
              overflow:'hidden', maxWidth:90,
              whiteSpace:'nowrap', textOverflow:'ellipsis',
            }}>
              {s}
            </span>
          ))}
        </div>

        <a
          href={`https://openlibrary.org${book.olKey}`}
          target="_blank" rel="noreferrer"
          style={{
            fontFamily: 'var(--font-sketch)', fontSize: '0.78rem',
            color: 'var(--color-ink)', display: 'inline-block', marginTop: '0.45rem',
            borderBottom: '1.5px solid var(--color-pencil-light)',
            textDecoration: 'none',
          }}
        >
          View on Open Library →
        </a>
      </div>
    </motion.div>
  )
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { user } = useAuth()
  const [books, setBooks]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [genreScores, setGenreScores] = useState([])
  const [recommendations, setRecs]  = useState([])
  const [recsLoading, setRecsLoading] = useState(false)
  const [recsGenres, setRecsGenres]   = useState([])

  useEffect(() => {
    getUserBooks(user.uid).then(async data => {
      setBooks(data)
      setLoading(false)

      // Genre taste from finished + rated books
      const scores = computeGenreScores(data)
      setGenreScores(scores)

      // Derive genres for recommendations from reading/want/finished
      const liveGenres = deriveGenresFromLibrary(data)
      setRecsGenres(liveGenres)

      if (liveGenres.length > 0) {
        setRecsLoading(true)
        const ownedTitles = new Set(data.map(b => b.title.toLowerCase()))
        const recs = await fetchRecommendations(liveGenres, ownedTitles, 8)
        setRecs(recs)
        setRecsLoading(false)
      }
    }).catch(err => {
      console.error(err);
      setLoading(false);
    })
  }, [user.uid])

  if (loading) return <LoadingSpinner text="Setting up your dashboard…"/>

  const reading  = books.filter(b => b.status === 'reading')
  const finished = books.filter(b => b.status === 'finished')
  const wantRead = books.filter(b => b.status === 'want')

  const stats = [
    { emoji:<BookOpenIcon size={36} strokeWidth={1.8}/>,    label:'Reading',      value:reading.length,  rotate:-1.5, delay:0    },
    { emoji:<CheckCircleIcon size={36} strokeWidth={1.8}/>, label:'Finished',     value:finished.length, rotate: 1.2, delay:0.08 },
    { emoji:<ClipboardIcon size={36} strokeWidth={1.8}/>,   label:'Want to Read', value:wantRead.length, rotate:-0.8, delay:0.16 },
    { emoji:<BooksIcon size={36} strokeWidth={1.8}/>,       label:'Total',        value:books.length,    rotate: 1.5, delay:0.24 },
  ]

  return (
    <PageWrapper>

      {/* ── Greeting ── */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:'2.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', marginBottom:'0.2rem' }}>
          <Star size={26} opacity={0.55}/>
          <h1 style={{ fontFamily:'var(--font-sketch)', fontSize:'clamp(2.2rem, 5vw, 3.6rem)', fontWeight:700, color:'var(--color-ink)', lineHeight:1.1 }}>
            Good day, <ScribbleUnderline>{user.displayName?.split(' ')[0] || 'Reader'}</ScribbleUnderline> <WaveIcon size={34} style={{ marginLeft:'0.25rem' }}/>
          </h1>
          <Star size={22} opacity={0.45}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Arrow size={36} opacity={0.35}/>
          <p style={{ fontFamily:'var(--font-study)', fontSize:'1.1rem', color:'var(--color-pencil)' }}>
            Here's your reading world at a glance.
          </p>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(185px, 1fr))', gap:'1.25rem', marginBottom:'1.5rem' }}>
        {stats.map(s => <StatCard key={s.label} {...s}/>)}
      </div>

      <div style={{ marginBottom:'3rem' }}><Zigzag opacity={0.22}/></div>

      {/* ── Genre Taste ── */}
      {genreScores.length > 0 && (
        <section style={{ marginBottom:'3rem' }}>
          <SectionHeader emoji={<TheatreIcon size={28}/>} subtitle="Based on books you've rated and finished">
            Your Reading Taste
          </SectionHeader>
          <SketchCard rotate={-0.5} style={{ maxWidth:640 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {genreScores.slice(0,5).map(({ genre, count, avgRating, score }, i) => (
                <div key={genre}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem', alignItems:'center' }}>
                    <span style={{ fontFamily:'var(--font-sketch)', fontSize:'1.1rem', textTransform:'capitalize' }}>
                      {[<MedalIcon key={0} size={18} number={1}/>,<MedalIcon key={1} size={18} number={2}/>,<MedalIcon key={2} size={18} number={3}/>,<PinIcon key={3} size={18}/>,<PinIcon key={4} size={18}/>][i]}{' '}{genre}
                    </span>
                    <span style={{ fontFamily:'var(--font-sketch)', fontSize:'0.9rem', color:'var(--color-pencil)' }}>
                      {count} book{count>1?'s':''} · <StarFilledIcon size={14} style={{ marginBottom:'-2px' }}/> {avgRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="progress-scribble">
                    <motion.div className="progress-scribble-fill"
                      initial={{ width:0 }}
                      animate={{ width:`${Math.min(100,(score/(genreScores[0].score||1))*100)}%` }}
                      transition={{ delay:i*0.1, duration:0.8 }}/>
                  </div>
                </div>
              ))}
            </div>
          </SketchCard>
        </section>
      )}

      {/* ── Currently Reading ── */}
      <section style={{ marginBottom:'3rem' }}>
        <SectionHeader emoji={<BookOpenIcon size={28}/>} subtitle={reading.length > 0 ? `${reading.length} book${reading.length>1?'s':''} in progress` : 'Nothing open yet'}>
          Currently Reading
        </SectionHeader>
        <AnimatePresence>
          {reading.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'1.5rem' }}>
              {reading.map((b, i) => <BookCard key={b.id} book={b} index={i}/>)}
            </div>
          ) : (
            <EmptyState emoji={<MailboxIcon size={56} strokeWidth={1.4}/>} title="Nothing open yet"
              desc="Add a book you're currently reading to see it here."
              actionTo="/library" actionLabel="+ Add a book"/>
          )}
        </AnimatePresence>
      </section>

      <div style={{ marginBottom:'3rem' }}><Zigzag opacity={0.18}/></div>

      {/* ── Live Recommendations ── */}
      <section style={{ marginBottom:'3rem' }}>
        <SectionHeader
          emoji={<LightbulbIcon size={28}/>}
          subtitle={
            recsGenres.length > 0
              ? `Picked for you based on: ${recsGenres.slice(0,3).join(', ')}`
              : 'Add books to your library to get personalised picks!'
          }
        >
          Recommended For You
        </SectionHeader>

        {recsLoading ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'2rem',
              border:'2.5px dashed var(--color-pencil-faint)',
              borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px' }}>
            <motion.div animate={{ rotate:360 }} transition={{ duration:2, repeat:Infinity, ease:'linear' }}>
              <AntennaIcon size={24} style={{ opacity:0.5 }}/>
            </motion.div>
            <p style={{ fontFamily:'var(--font-sketch)', fontSize:'1.1rem', color:'var(--color-pencil)' }}>
              Searching Open Library for picks…
            </p>
          </motion.div>
        ) : recsLoading === false && recommendations.length > 0 ? (
          <>
            {/* Source note */}
            <motion.p
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }}
              style={{ fontFamily:'var(--font-study)', fontSize:'0.82rem',
                color:'var(--color-pencil-light)', marginBottom:'1.1rem',
                display:'flex', alignItems:'center', gap:'0.35rem' }}
            >
              <SparkleIcon size={13} style={{ opacity:0.5 }}/>
              Live results from Open Library · based on your {recsGenres.length} active genre{recsGenres.length>1?'s':''}
            </motion.p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.1rem' }}>
              {recommendations.map((b, i) => <RecCard key={b.olKey || b.title} book={b} index={i}/>)}
            </div>
          </>
        ) : recsGenres.length === 0 ? (
          <EmptyState
            emoji={<SearchIcon size={56} strokeWidth={1.4}/>}
            title="No picks yet"
            desc="Add books you're reading or want to read and we'll find great matches from Open Library."
            actionTo="/library" actionLabel="Go to Library"
          />
        ) : (
          <EmptyState
            emoji={<SearchIcon size={56} strokeWidth={1.4}/>}
            title="No results found"
            desc="Try adding more books to your library so we can better understand your taste."
            actionTo="/explore" actionLabel="Explore books"
          />
        )}
      </section>

      <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
        <Link to="/library" style={{ textDecoration:'none' }}>
          <ScribbleButton primary>Go to Library →</ScribbleButton>
        </Link>
        <Link to="/explore" style={{ textDecoration:'none' }}>
          <ScribbleButton>Explore books <SearchIcon size={16} style={{ marginLeft:'0.2rem', marginBottom:'-2px' }}/></ScribbleButton>
        </Link>
      </div>

    </PageWrapper>
  )
}