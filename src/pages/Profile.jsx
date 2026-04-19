import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateProfile } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import PageWrapper from '../components/layout/PageWrapper'
import { toast } from 'react-toastify'
import { Star, Arrow, Zigzag } from '../components/ui/DoodleDecor'
import {
  MailIcon, PencilIcon, TheatreIcon, WarningIcon,
  CheckIcon, NotebookIcon, SparkleIcon, BookOpenIcon,
  CheckCircleIcon, ClipboardIcon, StarFilledIcon,
} from '../components/ui/DoodleIcons'
import { getUserBooks } from '../services/firestoreBooks'

/* ─── Avatar catalogue ─────────────────────────────────────────────── */
const DOODLE_AVATARS = [
  { id: 'godzilla',    src: '/avatars/av_godzilla.jpg',    label: 'Godzilla',     rot: -4,  ty: 0   },
  { id: 'pigeon',      src: '/avatars/av_pigeon.jpg',      label: 'Pigeon',       rot: 3,   ty: -10 },
  { id: 'penguin',     src: '/avatars/av_penguin.jpg',     label: 'Space Penguin',rot: -2,  ty: 6   },
  { id: 'wizard',      src: '/avatars/av_wizard.jpg',      label: 'Wizard',       rot: 5,   ty: -4  },
  { id: 'buffcat',     src: '/avatars/av_buffcat.jpg',     label: 'Buff Cat',     rot: -3,  ty: 4   },
  { id: 'businesscat', src: '/avatars/av_businesscat.jpg', label: 'Business Cat', rot: 2,   ty: -6  },
  { id: 'firespirit',  src: '/avatars/av_firespirit.png',  label: 'Fire Spirit',  rot: -5,  ty: 2   },
  { id: 'frenchduck',  src: '/avatars/av_frenchduck.png',  label: 'French Duck',  rot: 4,   ty: -8  },
  { id: 'jellyfish',   src: '/avatars/av_jellyfish.png',   label: 'Jellyfish',    rot: -2,  ty: 5   },
  { id: 'sprout',      src: '/avatars/av_sprout.png',      label: 'Sprout',       rot: 3,   ty: -3  },
  { id: 'skaterdino',  src: '/avatars/av_skaterdino.png',  label: 'Skater Dino',  rot: -4,  ty: 7   },
]

const GENRE_OPTIONS = [
  'fiction', 'fantasy', 'sci-fi', 'mystery', 'thriller',
  'romance', 'horror', 'biography', 'history', 'self-help',
  'philosophy', 'poetry', 'graphic novel', 'manga', 'classics',
]

/* ─── Sketch card wrapper ──────────────────────────────────────────── */
function SketchCard({ children, style = {}, rotate = 0, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay }}
      style={{
        background: 'var(--color-paper)',
        border: '2.5px solid var(--color-ink)',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        boxShadow: '5px 5px 0 var(--color-ink)',
        padding: '1.6rem 1.8rem',
        position: 'relative',
        transform: `rotate(${rotate}deg)`,
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(180,160,120,0.14) 32px)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Section heading ──────────────────────────────────────────────── */
function SectionHead({ icon, children, subtitle }) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ opacity: 0.7 }}>{icon}</span>
        <h2 style={{ fontFamily: 'var(--font-sketch)',
          fontSize: 'clamp(1.2rem, 2.5vw, 1.55rem)', fontWeight: 700,
          color: 'var(--color-ink)', margin: 0 }}>{children}</h2>
        <Star size={12} opacity={0.28} />
      </div>
      {subtitle && (
        <p style={{ fontFamily: 'var(--font-study)', fontSize: '0.83rem',
          color: 'var(--color-pencil)', marginTop: '0.2rem', paddingLeft: '0.3rem' }}>
          {subtitle}
        </p>
      )}
      <svg viewBox="0 0 300 8" fill="none"
        style={{ width: '100%', maxWidth: 260, marginTop: '0.4rem', opacity: 0.13 }}>
        <path d="M0,4 Q75,1 150,4 Q225,7 300,4" stroke="var(--color-ink)"
          strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

/* ─── Sketch input ─────────────────────────────────────────────────── */
function SketchInput({ label, value, onChange, placeholder, readOnly, note }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label style={{ display: 'block', fontFamily: 'var(--font-sketch)',
          fontSize: '0.88rem', color: 'var(--color-pencil)', marginBottom: '0.2rem' }}>
          {label}
        </label>
      )}
      <input value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          borderBottom: `2px solid ${readOnly ? 'rgba(0,0,0,0.1)' : 'var(--color-ink)'}`,
          padding: '0.3rem 0.2rem', fontFamily: 'var(--font-body)', fontSize: '0.97rem',
          outline: 'none', color: readOnly ? 'var(--color-pencil)' : 'var(--color-ink)',
          cursor: readOnly ? 'default' : 'text',
        }} />
      {note && <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '0.7rem',
        color: 'var(--color-pencil-light)', marginTop: '0.18rem' }}>{note}</p>}
    </div>
  )
}

/* ─── Mini reading stat ────────────────────────────────────────────── */
function MiniStat({ icon, value, label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '0.1rem', padding: '0.5rem 0.7rem',
      border: '1.5px solid rgba(0,0,0,0.15)',
      borderRadius: '8px 20px 10px 16px / 16px 10px 20px 8px',
      background: 'rgba(255,255,255,0.6)',
      boxShadow: '2px 2px 0 rgba(0,0,0,0.09)',
      minWidth: 58, flex: 1,
    }}>
      <span style={{ opacity: 0.5 }}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.5rem',
        fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1 }}>{value}</span>
      <span style={{ fontFamily: 'var(--font-study)', fontSize: '0.6rem',
        color: 'var(--color-pencil)', textTransform: 'uppercase',
        letterSpacing: '0.06em' }}>{label}</span>
    </div>
  )
}

/* ─── Single scattered avatar bubble ──────────────────────────────── */
function AvatarBubble({ av, isSelected, onSelect, index }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.55, rotate: av.rot * 2 }}
      animate={{ opacity: 1, scale: 1, rotate: isSelected ? 0 : av.rot }}
      transition={{ delay: 0.04 * index, type: 'spring', stiffness: 280, damping: 18 }}
      whileHover={{ scale: 1.14, rotate: 0, y: -8 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => onSelect(av.id)}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '0.4rem', cursor: 'pointer', flexShrink: 0,
        translateY: isSelected ? -6 : av.ty,
      }}
    >
      <div style={{ position: 'relative', width: 76, height: 76 }}>
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              style={{
                position: 'absolute', inset: -5, borderRadius: '50%',
                border: '3px solid var(--color-ink)',
                boxShadow: '0 0 0 2px var(--color-paper), 0 0 0 4.5px var(--color-ink)',
                zIndex: 2, pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          overflow: 'hidden', background: '#fff',
          border: isSelected ? '2.5px solid var(--color-ink)'
            : hov ? '2px solid var(--color-pencil)'
            : '2px dashed rgba(0,0,0,0.17)',
          boxShadow: isSelected ? '3px 3px 0 var(--color-ink)'
            : hov ? '2px 2px 0 rgba(0,0,0,0.16)'
            : '1px 1px 0 rgba(0,0,0,0.07)',
          transition: 'border 0.15s, box-shadow 0.15s',
        }}>
          <img src={av.src} alt={av.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover',
              objectPosition: 'center', transform: 'scale(1.18)' }} />
        </div>
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              style={{
                position: 'absolute', bottom: 1, right: 1, zIndex: 3,
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--color-ink)', border: '2px solid var(--color-paper)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CheckIcon size={10} style={{ color: '#fff' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span style={{
        fontFamily: 'var(--font-sketch)', fontSize: '0.62rem',
        color: 'var(--color-ink)', opacity: isSelected ? 0.9 : 0.55,
        letterSpacing: '0.02em', textTransform: 'uppercase',
        transform: `rotate(${av.rot * 0.35}deg)`, display: 'inline-block',
      }}>
        {av.label}
      </span>
    </motion.div>
  )
}

/* ─── Quote / fun reading fact ─────────────────────────────────────── */
const QUOTES = [
  '"A reader lives a thousand lives before he dies."',
  '"So many books, so little time."',
  '"Reading is dreaming with open eyes."',
  '"Not all those who wander are lost — but all who read are found."',
  '"The more that you read, the more things you will know."',
]

function QuoteCard({ delay = 0 }) {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)]
  return (
    <motion.div
      initial={{ opacity: 0, rotate: 2 }}
      animate={{ opacity: 1, rotate: 1.5 }}
      transition={{ delay, type: 'spring', stiffness: 180, damping: 22 }}
      style={{
        background: 'var(--color-paper)',
        border: '2px dashed var(--color-pencil)',
        borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
        padding: '1rem 1.4rem',
        position: 'relative',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(180,160,120,0.13) 28px)',
      }}
    >
      <Star size={12} opacity={0.25} style={{ position: 'absolute', top: 8, right: 14 }} />
      <p style={{
        fontFamily: 'var(--font-study)', fontSize: '0.88rem',
        color: 'var(--color-pencil)', fontStyle: 'italic', lineHeight: 1.65,
        margin: 0,
      }}>
        {q}
      </p>
    </motion.div>
  )
}

/* ─── Main Profile ─────────────────────────────────────────────────── */
export default function Profile() {
  const { user } = useAuth()
  const [name,   setName]   = useState(user.displayName || '')
  const [saving, setSaving] = useState(false)
  const [genres, setGenres] = useState([])
  const [books,  setBooks]  = useState([])

  const storageKey = `bookbuddy_avatar_${user.uid}`
  const [chosenAvatar, setChosenAvatar] = useState(() => localStorage.getItem(storageKey) || null)

  const handleSelectAvatar = (id) => {
    setChosenAvatar(id)
    localStorage.setItem(storageKey, id)
    const av = DOODLE_AVATARS.find(a => a.id === id)
    toast.success(`${av?.label} selected!`)
  }

  useEffect(() => { getUserBooks(user.uid).then(setBooks) }, [user.uid])

  const reading  = books.filter(b => b.status === 'reading').length
  const finished = books.filter(b => b.status === 'finished').length
  const want     = books.filter(b => b.status === 'want').length

  const toggleGenre = (g) =>
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const save = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name cannot be empty')
    setSaving(true)
    try {
      await updateProfile(auth.currentUser, { displayName: name })
      toast.success('Profile updated!')
    } catch { toast.error('Could not update profile') }
    finally { setSaving(false) }
  }

  const initials = (user.displayName || user.email || '?').slice(0, 2).toUpperCase()
  const memberSince = new Date(user.metadata.creationTime)
    .toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
  const activeAvatar = DOODLE_AVATARS.find(a => a.id === chosenAvatar)

  return (
    <PageWrapper>

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{ marginBottom: '2.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Star size={28} opacity={0.5} />
          <h1 style={{ fontFamily: 'var(--font-sketch)',
            fontSize: 'clamp(2.2rem, 5.5vw, 3.4rem)', fontWeight: 700,
            color: 'var(--color-ink)', lineHeight: 1 }}>
            My Profile
          </h1>
          <Star size={20} opacity={0.35} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
          <Arrow size={30} opacity={0.28} />
          <p style={{ fontFamily: 'var(--font-study)', fontSize: '0.95rem', color: 'var(--color-pencil)' }}>
            Your reading identity &amp; preferences
          </p>
        </div>
      </motion.div>

      {/* ── MAIN 2-COLUMN LAYOUT ────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
        gap: '2rem',
        alignItems: 'start',
        marginBottom: '2.2rem',
      }}>

        {/* ══ LEFT COLUMN ══════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Avatar hero card */}
          <SketchCard rotate={-1} delay={0.04} style={{ textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: -16, right: -6 }}>
              <Star size={32} opacity={0.5} />
            </div>
            <div style={{ position: 'absolute', top: 12, left: -12 }}>
              <Star size={16} opacity={0.25} />
            </div>

            {/* Big avatar circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.06 }}
              whileHover={{ rotate: 0, scale: 1.04 }}
              style={{
                position: 'relative', display: 'inline-block',
                marginBottom: '1rem',
              }}
            >
              {/* Dotted decorative ring */}
              <svg width="156" height="156" viewBox="0 0 156 156" fill="none" style={{
                position: 'absolute', inset: -12, zIndex: 0, pointerEvents: 'none', opacity: 0.12,
              }}>
                <circle cx="78" cy="78" r="72" stroke="var(--color-ink)" strokeWidth="1.5"
                  strokeDasharray="5 4" />
              </svg>

              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                border: '3.5px solid var(--color-ink)',
                background: '#fff', overflow: 'hidden',
                boxShadow: '5px 5px 0 var(--color-ink)',
                position: 'relative', zIndex: 1,
              }}>
                {activeAvatar ? (
                  <motion.img key={activeAvatar.id}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1.18, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    src={activeAvatar.src} alt={activeAvatar.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', background: 'var(--color-ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '2.6rem',
                      fontWeight: 700, color: '#fff' }}>{initials}</span>
                  </div>
                )}
              </div>

              {/* Pencil edit badge */}
              <div style={{
                position: 'absolute', bottom: 4, right: 4, zIndex: 2,
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--color-paper)', border: '2px solid var(--color-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '2px 2px 0 var(--color-ink)',
              }}>
                <PencilIcon size={12} />
              </div>
            </motion.div>

            <h2 style={{ fontFamily: 'var(--font-sketch)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 700,
              color: 'var(--color-ink)', marginBottom: '0.2rem', lineHeight: 1.1 }}>
              {user.displayName || 'Reader'}
            </h2>

            <AnimatePresence>
              {activeAvatar && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: 'inline-block', marginBottom: '0.5rem',
                    border: '1.5px dashed var(--color-pencil)',
                    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                    padding: '0.08rem 0.75rem',
                    fontFamily: 'var(--font-sketch)', fontSize: '0.7rem',
                    color: 'var(--color-pencil)', opacity: 0.7, transform: 'rotate(-1.5deg)',
                  }}>
                  playing as {activeAvatar.label}
                </motion.div>
              )}
            </AnimatePresence>

            <p style={{ fontFamily: 'var(--font-study)', fontSize: '0.85rem',
              color: 'var(--color-pencil)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
              <MailIcon size={13} /> {user.email}
            </p>
            <p style={{ fontFamily: 'var(--font-study)', fontSize: '0.75rem',
              color: 'var(--color-pencil-light)', marginBottom: '1.1rem' }}>
              Member since {memberSince}
            </p>

            {/* Active reader stamp */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.52, rotate: -2 }}
              transition={{ delay: 0.25 }}
              style={{
                display: 'inline-block',
                border: '2.5px double var(--color-ink)',
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                padding: '0.1rem 0.8rem',
                fontFamily: 'var(--font-sketch)', fontSize: '0.68rem',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--color-ink)', marginBottom: '1.2rem',
              }}>
              Active Reader
            </motion.div>

            {/* Reading stats */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <MiniStat icon={<BookOpenIcon size={15} />}    value={reading}  label="Reading" />
              <MiniStat icon={<CheckCircleIcon size={15} />} value={finished} label="Finished" />
              <MiniStat icon={<ClipboardIcon size={15} />}   value={want}     label="Want" />
            </div>

            <svg viewBox="0 0 200 8" fill="none"
              style={{ width: '65%', margin: '1.2rem auto 0', display: 'block', opacity: 0.1 }}>
              <path d="M0,4 Q50,1 100,4 Q150,7 200,4"
                stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </SketchCard>

          {/* Avatar gallery — scattered bubbles */}
          <SketchCard rotate={0.5} delay={0.1} style={{ padding: '1.4rem 1.6rem' }}>
            <SectionHead icon={<PencilIcon size={18} />} subtitle="Tap one to set it as yours">
              Pick your character
            </SectionHead>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.2rem 1.5rem',
              justifyContent: 'center',
              paddingTop: '0.4rem',
            }}>
              {DOODLE_AVATARS.map((av, i) => (
                <AvatarBubble key={av.id} av={av} index={i}
                  isSelected={chosenAvatar === av.id}
                  onSelect={handleSelectAvatar} />
              ))}
            </div>
          </SketchCard>

          {/* Random reading quote */}
          <QuoteCard delay={0.18} />
        </div>

        {/* ══ RIGHT COLUMN ═════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Edit details */}
          <SketchCard rotate={0.8} delay={0.08}>
            <div style={{ position: 'absolute', top: 10, right: 16 }}>
              <Star size={14} opacity={0.2} />
            </div>
            <SectionHead icon={<PencilIcon size={20} />}>Edit Details</SectionHead>

            <form onSubmit={save} noValidate>
              <SketchInput label="Display Name" value={name}
                onChange={e => setName(e.target.value)} placeholder="Your name" />
              <SketchInput label="Email" value={user.email} readOnly
                note="Email cannot be changed here." />

              <motion.button type="submit" disabled={saving}
                whileHover={{ y: -2, boxShadow: '6px 6px 0 var(--color-ink)' }}
                whileTap={{ y: 1 }}
                style={{
                  marginTop: '0.5rem',
                  fontFamily: 'var(--font-sketch)', fontSize: '1rem', fontWeight: 700,
                  background: 'var(--color-ink)', color: 'var(--color-paper)',
                  border: '2.5px solid var(--color-ink)',
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  padding: '0.48rem 1.6rem', cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.22)',
                  display: 'inline-flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1,
                }}>
                {saving ? 'Saving…' : <><CheckIcon size={16} /> Save changes</>}
              </motion.button>
            </form>
          </SketchCard>

          {/* Genre preferences */}
          <SketchCard rotate={-0.5} delay={0.14}>
            <div style={{ position: 'absolute', top: 10, right: 20 }}>
              <Star size={16} opacity={0.2} />
            </div>
            <SectionHead icon={<TheatreIcon size={22} />}
              subtitle="Genres you love to read">
              Reading Preferences
            </SectionHead>

            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {GENRE_OPTIONS.map(g => (
                <motion.button key={g} onClick={() => toggleGenre(g)}
                  whileHover={{ y: -2, boxShadow: '4px 4px 0 var(--color-ink)' }}
                  whileTap={{ y: 1 }}
                  style={{
                    fontFamily: 'var(--font-sketch)', fontSize: '0.85rem', fontWeight: 600,
                    textTransform: 'capitalize',
                    border: '2px solid var(--color-ink)',
                    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                    padding: '0.18rem 0.75rem', cursor: 'pointer',
                    background: genres.includes(g) ? 'var(--color-ink)' : 'var(--color-paper)',
                    color: genres.includes(g) ? 'var(--color-paper)' : 'var(--color-ink)',
                    boxShadow: genres.includes(g) ? '3px 3px 0 #555' : '2px 2px 0 var(--color-ink)',
                    transition: 'background 0.12s, color 0.12s',
                  }}>
                  {g}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {genres.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{
                    marginTop: '1rem', display: 'flex', alignItems: 'flex-start',
                    gap: '0.4rem', borderTop: '1.5px dashed rgba(0,0,0,0.12)',
                    paddingTop: '0.9rem',
                  }}>
                    <SparkleIcon size={15} style={{ marginTop: 2, opacity: 0.4, flexShrink: 0 }} />
                    <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '0.88rem',
                      color: 'var(--color-pencil)', lineHeight: 1.6 }}>
                      <strong>{genres.length}</strong> genre{genres.length > 1 ? 's' : ''} selected: {genres.join(', ')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SketchCard>

          {/* Account / sign out */}
          <SketchCard rotate={0.4} delay={0.2} style={{ padding: '1.4rem 1.8rem' }}>
            <SectionHead icon={<WarningIcon size={20} />} subtitle="Manage your account">
              Account
            </SectionHead>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem',
            }}>
              <div>
                <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '1rem',
                  fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.15rem' }}>
                  Sign out
                </p>
                <p style={{ fontFamily: 'var(--font-study)', fontSize: '0.84rem',
                  color: 'var(--color-pencil)' }}>
                  Your notebook will be waiting.
                </p>
              </div>
              <motion.button
                onClick={async () => {
                  const { signOut } = await import('firebase/auth')
                  await signOut(auth)
                }}
                whileHover={{ y: -2, boxShadow: '4px 4px 0 var(--color-ink)' }}
                whileTap={{ y: 1 }}
                style={{
                  fontFamily: 'var(--font-sketch)', fontSize: '0.93rem', fontWeight: 700,
                  background: 'transparent', color: 'var(--color-ink)',
                  border: '2.5px solid var(--color-ink)',
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  padding: '0.35rem 1.1rem', cursor: 'pointer',
                  boxShadow: '3px 3px 0 var(--color-ink)',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}>
                <NotebookIcon size={14} /> Logout ↩
              </motion.button>
            </div>
          </SketchCard>

        </div>
      </div>

    </PageWrapper>
  )
}