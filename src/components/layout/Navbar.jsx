import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { motion } from 'framer-motion'
import { auth } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { NotebookIcon } from '../ui/DoodleIcons'

const AVATAR_SRCS = {
  godzilla:    '/avatars/av_godzilla.jpg',
  pigeon:      '/avatars/av_pigeon.jpg',
  penguin:     '/avatars/av_penguin.jpg',
  wizard:      '/avatars/av_wizard.jpg',
  buffcat:     '/avatars/av_buffcat.jpg',
  businesscat: '/avatars/av_businesscat.jpg',
}

const links = [
  { to: '/dashboard', label: 'Home'    },
  { to: '/library',   label: 'Library' },
  { to: '/explore',   label: 'Explore' },
  { to: '/bookclubs', label: 'Clubs'   },
  { to: '/profile',   label: 'Profile' },
]

function WavySeparator() {
  return (
    <svg viewBox="0 0 1440 10" fill="none"
      style={{ width: '100%', height: '10px', display: 'block' }}
      aria-hidden="true" preserveAspectRatio="none">
      <path
        d="M0,5 Q60,1 120,5 Q180,9 240,5 Q300,1 360,5 Q420,9 480,5
           Q540,1 600,5 Q660,9 720,5 Q780,1 840,5 Q900,9 960,5
           Q1020,1 1080,5 Q1140,9 1200,5 Q1260,1 1320,5 Q1380,9 1440,5"
        stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round"
        fill="none" opacity="0.55" />
    </svg>
  )
}

function DoodleStar({ style }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={style} aria-hidden="true">
      <path d="M7,1 L8.2,5.5 L13,5.5 L9.2,8.3 L10.5,13 L7,10.2 L3.5,13 L4.8,8.3 L1,5.5 L5.8,5.5 Z"
        stroke="var(--color-ink)" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
    </svg>
  )
}

export default function Navbar() {
  const { user }     = useAuth()
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  /* read chosen avatar from localStorage, update if it changes */
  const storageKey = user ? `bookbuddy_avatar_${user.uid}` : null
  const [avatarId, setAvatarId] = useState(() =>
    storageKey ? localStorage.getItem(storageKey) : null
  )

  /* Sync whenever the storage key changes (e.g. after profile update) */
  useEffect(() => {
    if (!storageKey) return
    const sync = () => setAvatarId(localStorage.getItem(storageKey))
    // Poll lightly — cheap and works across components without a global store
    const id = setInterval(sync, 1000)
    return () => clearInterval(id)
  }, [storageKey])

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('See you soon!')
    navigate('/login')
  }

  if (!user) return null

  const avatarSrc  = avatarId ? AVATAR_SRCS[avatarId] : null
  const initials   = (user.displayName || user.email || '?').slice(0, 2).toUpperCase()

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      style={{
        position: 'sticky', top: 0, zIndex: 40,
        backgroundColor: 'var(--color-paper)',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 34px, rgba(180,170,150,0.45) 35px)',
      }}
    >
      <div style={{
        maxWidth: '1020px', marginInline: 'auto',
        padding: '0.7rem 2rem',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
      }}>

        {/* ── Logo ── */}
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <motion.span
            whileHover={{ rotate: [0, -2, 2, 0], transition: { duration: 0.35 } }}
            style={{
              fontFamily: 'var(--font-sketch)', fontSize: '2rem', fontWeight: 700,
              display: 'inline-block', textDecoration: 'none',
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='8' viewBox='0 0 200 8'%3E%3Cpath d='M0,4 Q25,1 50,4 Q75,7 100,4 Q125,1 150,4 Q175,7 200,4' stroke='%231a1a1a' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'repeat-x', backgroundPosition: '0 100%',
              backgroundSize: '200px 8px', paddingBottom: '6px',
            }}
          >
            <NotebookIcon size={24} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />BookBuddy
          </motion.span>
          <DoodleStar style={{ opacity: 0.35, marginTop: '-8px', flexShrink: 0 }} />
        </Link>

        {/* ── Nav links ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
          {links.map(({ to, label }, i) => (
            <motion.div key={to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 260, damping: 20 }}>
              <Link to={to} className={`nav-link-scribble ${pathname === to ? 'active' : ''}`}>
                {label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── User area: circular avatar + logout ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* Avatar circle — links to /profile */}
          <Link to="/profile" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: -4 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 340, damping: 18 }}
              title={user.displayName || user.email}
              style={{
                width: 38, height: 38,
                borderRadius: '50%',
                border: '2.5px solid var(--color-ink)',
                background: avatarSrc ? '#fff' : 'var(--color-ink)',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '2px 2px 0 var(--color-ink)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center',
                    transform: 'scale(1.18)',
                  }}
                />
              ) : (
                <span style={{
                  fontFamily: 'var(--font-sketch)', fontSize: '0.9rem',
                  fontWeight: 700, color: '#fff', lineHeight: 1,
                }}>
                  {initials}
                </span>
              )}
            </motion.div>
          </Link>

          <button
            onClick={handleLogout}
            className="btn-scribble"
            style={{ fontSize: '0.95rem', padding: '0.3rem 1rem' }}
          >
            Logout ↩
          </button>
        </div>
      </div>

      <WavySeparator />
    </motion.nav>
  )
}
