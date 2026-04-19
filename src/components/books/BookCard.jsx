import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpenIcon, CheckCircleIcon, ClipboardIcon, TrashIcon, PencilIcon } from '../ui/DoodleIcons'

const ROTATIONS = [-1.8, 1.2, -0.8, 1.6, -1.2, 0.6, -0.4, 1.4]

const STATUS_CONFIG = {
  reading:  { icon: <BookOpenIcon size={12}/>,    label: 'Reading',  bg: false },
  finished: { icon: <CheckCircleIcon size={12}/>, label: 'Done',     bg: true  },
  want:     { icon: <ClipboardIcon size={12}/>,   label: 'Want',     bg: false },
  dropped:  { icon: <TrashIcon size={12}/>,       label: 'Dropped',  bg: false },
}

/* Tiny dog-ear fold in top-right corner */
function DogEar() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none"
      style={{ position:'absolute', top:0, right:0, zIndex:3, pointerEvents:'none' }}
      aria-hidden="true">
      <path d="M26,0 L26,26 L0,0 Z" fill="var(--color-paper-worn)"/>
      <path d="M0,0 L26,26" stroke="var(--color-ink)" strokeWidth="1.3"
        strokeLinecap="round" opacity="0.3"/>
    </svg>
  )
}

/* Hand-drawn star rating */
function MiniStars({ rating }) {
  if (!rating) return null
  return (
    <span style={{ fontFamily:'var(--font-sketch)', fontSize:'0.78rem',
      letterSpacing:'-1px', color:'var(--color-ink)' }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function BookCard({ book, index = 0 }) {
  const rotate = ROTATIONS[index % ROTATIONS.length]
  const status = STATUS_CONFIG[book.status] || STATUS_CONFIG.want
  const pct    = book.totalPages > 0
    ? Math.min(100, Math.round(((book.currentPage || 0) / book.totalPages) * 100))
    : 0

  // Base shadow consistent across all statuses
  const baseShadow = '4px 4px 0 var(--color-ink)'
  const hoverShadow = '8px 8px 0 var(--color-ink)'

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:24, rotate: rotate - 4, boxShadow: baseShadow }}
      animate={{ opacity:1, y:0, rotate, boxShadow: baseShadow }}
      exit={{ opacity:0, scale:0.82, rotate: rotate + 5 }}
      whileHover={{
        rotate: 0,
        scale: 1.06,
        zIndex: 20,
        boxShadow: hoverShadow,
        transition: { duration: 0.15 },
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type:'spring', stiffness:260, damping:22 }}
      style={{
        transformOrigin: 'center bottom',
        borderRadius: '8px 20px 10px 16px / 16px 10px 20px 8px',
        // The shadow lives HERE on the wrapper, not on the inner div
      }}
    >
      <Link to={`/book/${book.id}`} style={{ textDecoration:'none', display:'block' }}>
        <div style={{
          background: 'var(--color-paper)',
          border: '2.5px solid var(--color-ink)',
          borderRadius: '8px 20px 10px 16px / 16px 10px 20px 8px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <DogEar/>

          {/* Cover image or cross-hatch placeholder */}
          {book.coverUrl ? (
            <div style={{ height:'10.5rem', overflow:'hidden',
              borderBottom:'2px solid var(--color-ink)' }}>
              <img src={book.coverUrl} alt={book.title} loading="lazy"
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
                  filter:'grayscale(20%) contrast(1.05)',
                  transition:'transform 0.35s ease',
                }}
                onMouseEnter={e => e.target.style.transform='scale(1.07)'}
                onMouseLeave={e => e.target.style.transform='scale(1)'}
              />
            </div>
          ) : (
            <div style={{
              height: '10.5rem',
              borderBottom: '2px solid var(--color-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-paper-dark)',
              backgroundImage: 'repeating-linear-gradient(-45deg, rgba(26,26,26,0.06) 0, rgba(26,26,26,0.06) 1px, transparent 0, transparent 50%), repeating-linear-gradient(45deg, rgba(26,26,26,0.06) 0, rgba(26,26,26,0.06) 1px, transparent 0, transparent 50%)',
              backgroundSize: '8px 8px',
            }}>
              <BookOpenIcon size={46} strokeWidth={1.1} style={{ opacity:0.15 }}/>
            </div>
          )}

          {/* Progress bar (any status that might have progress) */}
          {book.status === 'reading' && book.totalPages > 0 && (
            <div style={{ height:5, background:'var(--color-paper-worn)',
              borderBottom:'1.5px solid var(--color-ink)' }}>
              <motion.div
                initial={{ width:0 }}
                animate={{ width:`${pct}%` }}
                transition={{ duration:0.9, ease:'easeOut', delay:0.2 }}
                style={{ height:'100%',
                  background:'repeating-linear-gradient(-45deg, var(--color-ink) 0, var(--color-ink) 2px, transparent 2px, transparent 6px)' }}/>
            </div>
          )}

          {/* Card body */}
          <div style={{ padding:'0.7rem 0.8rem 0.75rem' }}>

            <h3 style={{
              fontFamily:'var(--font-sketch)', fontSize:'1rem', fontWeight:700,
              lineHeight:1.28, color:'var(--color-ink)', marginBottom:'0.18rem',
              overflow:'hidden', display:'-webkit-box',
              WebkitLineClamp:2, WebkitBoxOrient:'vertical',
            }}>
              {book.title}
            </h3>

            <p style={{ fontFamily:'var(--font-study)', fontSize:'0.82rem',
              color:'var(--color-pencil)', marginBottom:'0.5rem',
              overflow:'hidden', display:'-webkit-box',
              WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>
              <PencilIcon size={11} style={{marginBottom:'-2px', marginRight:3}}/>
              {book.author}
            </p>

            {book.genres?.length > 0 && (
              <div style={{ display:'flex', gap:'0.25rem', flexWrap:'wrap', marginBottom:'0.5rem' }}>
                {book.genres.slice(0,2).map(g => (
                  <span key={g} style={{
                    fontFamily:'var(--font-sketch)', fontSize:'0.65rem',
                    border:'1.5px solid var(--color-ink)',
                    borderRadius:'255px 8px 225px 8px / 8px 225px 8px 255px',
                    padding:'0.02rem 0.4rem', background:'var(--color-paper)',
                  }}>{g}</span>
                ))}
              </div>
            )}

            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', gap:'0.2rem', flexWrap:'wrap' }}>
              <span style={{
                fontFamily:'var(--font-sketch)', fontSize:'0.68rem',
                letterSpacing:'0.06em', textTransform:'uppercase',
                border:`2px ${status.bg ? 'solid' : 'double'} var(--color-ink)`,
                borderRadius:'255px 8px 225px 8px / 8px 225px 8px 255px',
                padding:'0.05rem 0.45rem',
                background: status.bg ? 'var(--color-ink)' : 'transparent',
                color: status.bg ? 'var(--color-paper)' : 'var(--color-ink)',
                display:'inline-flex', alignItems:'center', gap:'0.25rem',
                transform:`rotate(${index%2===0 ? -2 : 2}deg)`,
                opacity:0.88,
              }}>
                {status.icon} {status.label}
              </span>
              <MiniStars rating={book.rating}/>
            </div>

            {book.status === 'reading' && book.totalPages > 0 && (
              <p style={{ fontFamily:'var(--font-sketch)', fontSize:'0.68rem',
                color:'var(--color-pencil)', textAlign:'right', marginTop:'0.3rem' }}>
                {pct}% read
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
