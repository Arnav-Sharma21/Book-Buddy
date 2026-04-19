import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove, query, orderBy, where,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import {
  BookOpenIcon, PlusIcon, CloseIcon, SearchIcon, PencilIcon,
  CheckIcon, TrashIcon, StarFilledIcon, NotebookIcon,
} from '../components/ui/DoodleIcons'

/* ─── tiny inline icons ──────────────────────────────────────────── */
function Icon({ children, size = 20, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
      {children}
    </svg>
  )
}
function UsersIcon({ size = 20, style }) {
  return <Icon size={size} style={style}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>
}
function ChatIcon({ size = 20, style }) {
  return <Icon size={size} style={style}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon>
}
function CalendarIcon({ size = 20, style }) {
  return <Icon size={size} style={style}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Icon>
}
function LinkIcon({ size = 20, style }) {
  return <Icon size={size} style={style}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Icon>
}
function CrownIcon({ size = 20, style }) {
  return <Icon size={size} style={style}><path d="M2 20h20M4 20l2-8 6 4 6-4 2 8"/><polygon points="12,4 15,10 20,8 17,14 7,14 4,8 9,10"/></Icon>
}
function LogOutIcon({ size = 20, style }) {
  return <Icon size={size} style={style}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>
}
function SendIcon({ size = 20, style }) {
  return <Icon size={size} style={style}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></Icon>
}
function ClockIcon({ size = 20, style }) {
  return <Icon size={size} style={style}><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></Icon>
}
function EditIcon({ size = 20, style }) {
  return <Icon size={size} style={style}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Icon>
}
function CopyIcon({ size = 20, style }) {
  return <Icon size={size} style={style}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>
}

/* ─── helpers ─────────────────────────────────────────────────────── */
function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatTime(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Date.now() - d.getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}
function avatarBg(uid = '') {
  const palette = ['#8b7355','#6b8040','#5a6e8a','#7a5a8a','#8a5a6e','#4a7a6e','#8a7040']
  const idx = uid.charCodeAt(0) % palette.length
  return palette[idx]
}

/* ─────────────────────────────────────────────────────────────────── */
/*   MAIN COMPONENT                                                    */
/* ─────────────────────────────────────────────────────────────────── */
export default function BookClub() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteClubId = searchParams.get('join') // ?join=<clubId>

  const [view, setView] = useState('list')          // 'list' | 'club'
  const [clubs, setClubs] = useState([])
  const [activeClub, setActiveClub] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  /* ── auto-join via invite link ── */
  useEffect(() => {
    if (!inviteClubId || !user) return
    handleJoinById(inviteClubId)
  }, [inviteClubId, user])

  /* ── listen to clubs where user is member ── */
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'bookclubs'), where('memberIds', 'array-contains', user.uid))
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setClubs(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))
      setLoading(false)
    })
    return unsub
  }, [user])

  /* ── if viewing a specific club, keep it fresh ── */
  useEffect(() => {
    if (!activeClub) return
    const fresh = clubs.find(c => c.id === activeClub.id)
    if (fresh) setActiveClub(fresh)
  }, [clubs])

  const handleJoinById = async (clubId) => {
    try {
      const ref = doc(db, 'bookclubs', clubId)
      const snap = await getDoc(ref)
      if (!snap.exists()) { toast.error('Club not found! The link may be invalid.'); return }
      const data = snap.data()
      // Clear the ?join= param from the URL so refresh doesn't re-trigger
      navigate('/bookclubs', { replace: true })
      if (data.memberIds?.includes(user.uid)) {
        toast.info('You are already in this club!')
        setActiveClub({ id: snap.id, ...data })
        setView('club')
        return
      }
      await updateDoc(ref, {
        memberIds: arrayUnion(user.uid),
        members: arrayUnion({ uid: user.uid, name: user.displayName || user.email, joinedAt: new Date().toISOString() }),
      })
      toast.success(`Joined "${data.name}"! Opening club…`)
      // Auto-open the club after joining
      setActiveClub({ id: snap.id, ...data })
      setView('club')
    } catch (e) {
      console.error('BookClub join error:', e)
      if (e.code === 'permission-denied') {
        toast.error('Join failed: Firestore rules are blocking the request. Please update your Firebase security rules.')
      } else {
        toast.error(`Could not join club: ${e.message || e.code || 'Unknown error'}`)
      }
    }
  }


  const handleCreateClub = async ({ name, bookTitle, bookAuthor, description }) => {
    try {
      const ref = await addDoc(collection(db, 'bookclubs'), {
        name,
        bookTitle,
        bookAuthor,
        description,
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        memberIds: [user.uid],
        members: [{ uid: user.uid, name: user.displayName || user.email, joinedAt: new Date().toISOString() }],
        createdAt: serverTimestamp(),
      })
      toast.success('Book club created!')
      setShowCreateModal(false)
    } catch (e) {
      toast.error('Could not create club.')
    }
  }

  const handleOpenClub = (club) => {
    setActiveClub(club)
    setView('club')
  }

  const handleBack = () => {
    setView('list')
    setActiveClub(null)
  }

  /* ── PAGE WRAPPER ── */
  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {view === 'club' && (
            <button onClick={handleBack} className="btn-scribble"
              style={{ fontSize: '0.9rem', padding: '0.3rem 0.9rem' }}>
              ← Back
            </button>
          )}
          <div>
            <h1 style={{ fontFamily: 'var(--font-sketch)', fontSize: '2.4rem', margin: 0, lineHeight: 1 }}>
              <UsersIcon size={32} style={{ marginRight: '0.4rem' }} />
              Book Clubs
            </h1>
            <p style={{ color: 'var(--color-pencil)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
              {view === 'list'
                ? 'Read together. Discuss freely. Meet often.'
                : activeClub?.name}
            </p>
          </div>
        </div>
        {view === 'list' && (
          <button onClick={() => setShowCreateModal(true)} className="btn-scribble btn-scribble-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem' }}>
            <PlusIcon size={18} /> New Club
          </button>
        )}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list"
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <ClubList clubs={clubs} loading={loading} onOpen={handleOpenClub}
              onJoinById={handleJoinById} user={user} />
          </motion.div>
        ) : (
          <motion.div key="club"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25 }}>
            <ClubDetail club={activeClub} user={user} onLeft={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateClubModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateClub} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/*   CLUB LIST                                                          */
/* ─────────────────────────────────────────────────────────────────── */
function ClubList({ clubs, loading, onOpen, onJoinById, user }) {
  const [joinId, setJoinId] = useState('')
  const [joining, setJoining] = useState(false)

  const handleJoin = async () => {
    if (!joinId.trim()) return
    setJoining(true)
    await onJoinById(joinId.trim())
    setJoinId('')
    setJoining(false)
  }

  // parse club ID from a full URL if pasted
  const handleJoinInput = (val) => {
    const match = val.match(/[?&]join=([^&]+)/)
    setJoinId(match ? match[1] : val)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-pencil)' }}>
      <NotebookIcon size={40} style={{ opacity: 0.4, marginBottom: '1rem' }} />
      <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.3rem' }}>Loading clubs…</p>
    </div>
  )

  return (
    <div>
      {/* Join via link */}
      <div className="card-scribble" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LinkIcon size={18} /> Join a club via invite link or ID
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            className="input-scribble-box"
            style={{ flex: 1, minWidth: '220px' }}
            placeholder="Paste invite link or Club ID…"
            value={joinId}
            onChange={e => handleJoinInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          <button className="btn-scribble" onClick={handleJoin} disabled={joining || !joinId.trim()}>
            {joining ? '…' : 'Join Club'} →
          </button>
        </div>
      </div>

      {clubs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ marginBottom: '1rem' }}><UsersIcon size={52} style={{ opacity: 0.25 }} /></div>
          <h2 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            No clubs yet!
          </h2>
          <p style={{ color: 'var(--color-pencil)', maxWidth: '380px', margin: '0 auto' }}>
            Create your first book club or join one with an invite link to start reading together.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {clubs.map((club, i) => (
            <ClubCard key={club.id} club={club} user={user} onOpen={() => onOpen(club)} delay={i * 0.07} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/*   CLUB CARD                                                          */
/* ─────────────────────────────────────────────────────────────────── */
function ClubCard({ club, user, onOpen, delay }) {
  const isOwner = club.createdBy === user?.uid
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 22 }}
      className="card-scribble dog-ear"
      onClick={onOpen}
      style={{ padding: '1.5rem', cursor: 'pointer', position: 'relative' }}
    >
      {isOwner && (
        <span className="stamp-scribble" style={{ position: 'absolute', top: '12px', right: '32px', fontSize: '0.65rem' }}>
          Owner
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50% 45% 52% 48% / 48% 52% 45% 53%',
          background: avatarBg(club.id), display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, border: '2px solid var(--color-ink)', color: 'var(--color-paper)',
          fontFamily: 'var(--font-sketch)', fontWeight: 700, fontSize: '1.1rem',
        }}>
          {initials(club.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.2rem', margin: '0 0 0.15rem', lineHeight: 1.2 }}>
            {club.name}
          </h3>
          {club.bookTitle && (
            <p style={{ color: 'var(--color-pencil)', fontSize: '0.88rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BookOpenIcon size={14} /> <em>"{club.bookTitle}"</em>
              {club.bookAuthor && <span style={{ opacity: 0.6 }}>— {club.bookAuthor}</span>}
            </p>
          )}
        </div>
      </div>

      {club.description && (
        <p style={{ color: 'var(--color-pencil)', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {club.description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-pencil)', fontSize: '0.85rem' }}>
          <UsersIcon size={14} /> {club.memberIds?.length || 1} member{(club.memberIds?.length || 1) !== 1 ? 's' : ''}
        </span>
        <span style={{ color: 'var(--color-pencil)', fontSize: '0.78rem' }}>
          {formatDate(club.createdAt)}
        </span>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/*   CLUB DETAIL (tabs: Discussion · Meetings · Members · Info)        */
/* ─────────────────────────────────────────────────────────────────── */
function ClubDetail({ club, user, onLeft }) {
  const [activeTab, setActiveTab] = useState('chat')
  const isOwner = club?.createdBy === user?.uid

  const copyInviteLink = () => {
    const url = `${window.location.origin}/bookclubs?join=${club.id}`
    navigator.clipboard.writeText(url)
    toast.success('Invite link copied! Share it with friends 🔗')
  }

  const handleLeave = async () => {
    if (isOwner) { toast.error('Owners cannot leave — delete the club instead.'); return }
    if (!window.confirm('Leave this book club?')) return
    try {
      const me = club.members?.find(m => m.uid === user.uid)
      await updateDoc(doc(db, 'bookclubs', club.id), {
        memberIds: arrayRemove(user.uid),
        members: me ? arrayRemove(me) : arrayRemove(),
      })
      toast.success('You left the club.')
      onLeft()
    } catch { toast.error('Could not leave.') }
  }

  const handleDeleteClub = async () => {
    if (!window.confirm('Delete this club permanently? All chats and meetings will be lost.')) return
    try {
      await deleteDoc(doc(db, 'bookclubs', club.id))
      toast.success('Club deleted.')
      onLeft()
    } catch { toast.error('Could not delete.') }
  }

  if (!club) return null

  const tabs = [
    { id: 'chat',     label: 'Discussion', icon: <ChatIcon size={16} /> },
    { id: 'meetings', label: 'Meetings',   icon: <CalendarIcon size={16} /> },
    { id: 'members',  label: 'Members',    icon: <UsersIcon size={16} /> },
    { id: 'info',     label: 'Info',       icon: <NotebookIcon size={16} /> },
  ]

  return (
    <div>
      {/* Club header strip */}
      <div className="card-scribble" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50% 45% 52% 48% / 48% 52% 45% 53%',
              background: avatarBg(club.id), display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--color-ink)', color: 'var(--color-paper)',
              fontFamily: 'var(--font-sketch)', fontWeight: 700, fontSize: '1.2rem',
            }}>
              {initials(club.name)}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.5rem', margin: 0 }}>{club.name}</h2>
              {club.bookTitle && (
                <p style={{ color: 'var(--color-pencil)', fontSize: '0.88rem', margin: 0 }}>
                  <BookOpenIcon size={14} style={{ marginRight: '0.25rem' }} />
                  <em>"{club.bookTitle}"</em>{club.bookAuthor && ` — ${club.bookAuthor}`}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-scribble" onClick={copyInviteLink}
              style={{ fontSize: '0.9rem', padding: '0.3rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <LinkIcon size={15} /> Share Link
            </button>
            {!isOwner && (
              <button className="btn-scribble btn-scribble-ghost" onClick={handleLeave}
                style={{ fontSize: '0.9rem', padding: '0.3rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <LogOutIcon size={15} /> Leave
              </button>
            )}
            {isOwner && (
              <button className="btn-scribble btn-scribble-danger" onClick={handleDeleteClub}
                style={{ fontSize: '0.9rem', padding: '0.3rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <TrashIcon size={15} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`notebook-tab ${activeTab === t.id ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.95rem', cursor: 'pointer', border: '2px solid var(--color-ink)' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          {activeTab === 'chat'     && <ChatPanel club={club} user={user} />}
          {activeTab === 'meetings' && <MeetingsPanel club={club} user={user} isOwner={isOwner} />}
          {activeTab === 'members'  && <MembersPanel club={club} user={user} isOwner={isOwner} />}
          {activeTab === 'info'     && <InfoPanel club={club} user={user} isOwner={isOwner} onCopyLink={() => { const url = `${window.location.origin}/bookclubs?join=${club.id}`; navigator.clipboard.writeText(url); toast.success('Copied! 🔗') }} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/*   CHAT PANEL (real-time)                                            */
/* ─────────────────────────────────────────────────────────────────── */
function ChatPanel({ club, user }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const q = query(
      collection(db, 'bookclubs', club.id, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [club.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e?.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await addDoc(collection(db, 'bookclubs', club.id, 'messages'), {
        text: text.trim(),
        uid: user.uid,
        senderName: user.displayName || user.email,
        createdAt: serverTimestamp(),
      })
      setText('')
    } catch { toast.error('Could not send message.') }
    setSending(false)
  }

  return (
    <div className="card-scribble" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '520px' }}>
      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.25rem 0.5rem',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 34px, rgba(180,170,150,0.3) 35px)' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-pencil)' }}>
            <ChatIcon size={40} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
            <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.1rem' }}>No messages yet — start the discussion!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.uid === user.uid
          const prevMsg = messages[i - 1]
          const showName = !prevMsg || prevMsg.uid !== msg.uid
          return (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '0.5rem', display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: '0.5rem', marginTop: showName ? '0.75rem' : 0 }}>
              {!isMe && showName && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: avatarBg(msg.uid),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid var(--color-ink)', color: 'var(--color-paper)',
                  fontFamily: 'var(--font-sketch)', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {initials(msg.senderName)}
                </div>
              )}
              {!isMe && !showName && <div style={{ width: 32, flexShrink: 0 }} />}
              <div style={{ maxWidth: '70%' }}>
                {!isMe && showName && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-pencil)', marginBottom: '0.15rem',
                    fontFamily: 'var(--font-sketch)', paddingLeft: '0.5rem' }}>
                    {msg.senderName}
                  </p>
                )}
                <div style={{
                  padding: '0.55rem 0.9rem',
                  background: isMe ? 'var(--color-ink)' : 'var(--color-paper-dark)',
                  color: isMe ? 'var(--color-paper)' : 'var(--color-ink)',
                  borderRadius: isMe
                    ? '18px 18px 4px 18px'
                    : '18px 18px 18px 4px',
                  border: '1.5px solid var(--color-ink)',
                  fontSize: '0.95rem', lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-pencil-light)', marginTop: '0.15rem',
                  textAlign: isMe ? 'right' : 'left', paddingInline: '0.3rem' }}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </motion.div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.6rem',
        borderTop: '2px solid var(--color-ink)', alignItems: 'center' }}>
        <input
          className="input-scribble-box"
          style={{ flex: 1 }}
          placeholder="Share a thought… ✍️"
          value={text}
          onChange={e => setText(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="btn-scribble btn-scribble-primary"
          disabled={!text.trim() || sending}
          style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <SendIcon size={16} />
        </button>
      </form>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/*   MEETINGS PANEL                                                     */
/* ─────────────────────────────────────────────────────────────────── */
function MeetingsPanel({ club, user, isOwner }) {
  const [meetings, setMeetings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', time: '', link: '', agenda: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'bookclubs', club.id, 'meetings'), orderBy('date', 'asc'))
    const unsub = onSnapshot(q, snap => setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    return unsub
  }, [club.id])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.date || !form.time) { toast.error('Title, date and time are required.'); return }
    setSaving(true)
    try {
      await addDoc(collection(db, 'bookclubs', club.id, 'meetings'), {
        ...form,
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        rsvps: [user.uid],
      })
      toast.success('Meeting scheduled!')
      setForm({ title: '', date: '', time: '', link: '', agenda: '' })
      setShowForm(false)
    } catch { toast.error('Could not schedule meeting.') }
    setSaving(false)
  }

  const handleRsvp = async (meeting) => {
    const hasRsvp = meeting.rsvps?.includes(user.uid)
    await updateDoc(doc(db, 'bookclubs', club.id, 'meetings', meeting.id), {
      rsvps: hasRsvp ? arrayRemove(user.uid) : arrayUnion(user.uid),
    })
    toast.success(hasRsvp ? 'RSVP removed' : "You're going!")
  }

  const handleDelete = async (meetingId) => {
    if (!window.confirm('Delete this meeting?')) return
    await deleteDoc(doc(db, 'bookclubs', club.id, 'meetings', meetingId))
    toast.success('Meeting deleted.')
  }

  const now = new Date()
  const upcoming = meetings.filter(m => new Date(`${m.date}T${m.time}`) >= now)
  const past = meetings.filter(m => new Date(`${m.date}T${m.time}`) < now)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.3rem', margin: 0 }}>
          <CalendarIcon size={20} style={{ marginRight: '0.4rem' }} /> Scheduled Meetings
        </h3>
        <button onClick={() => setShowForm(v => !v)} className="btn-scribble"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', padding: '0.3rem 0.9rem' }}>
          {showForm ? <CloseIcon size={15} /> : <PlusIcon size={15} />}
          {showForm ? 'Cancel' : 'Schedule Meeting'}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handleSave}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card-scribble" style={{ padding: '1.25rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <h4 style={{ fontFamily: 'var(--font-sketch)', marginBottom: '1rem' }}>New Meeting</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.2rem' }}>Meeting Title *</label>
                <input className="input-scribble-box" style={{ width: '100%' }}
                  placeholder="e.g. Chapter 5-8 Discussion"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.2rem' }}>Date *</label>
                <input type="date" className="input-scribble-box" style={{ width: '100%', background: 'var(--color-paper)' }}
                  value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.2rem' }}>Time *</label>
                <input type="time" className="input-scribble-box" style={{ width: '100%', background: 'var(--color-paper)' }}
                  value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.2rem' }}>Video Call Link (optional)</label>
                <input className="input-scribble-box" style={{ width: '100%' }}
                  placeholder="https://meet.google.com/…"
                  value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.2rem' }}>Agenda / Notes</label>
                <textarea className="input-scribble-box" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                  placeholder="What will you discuss?"
                  value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn-scribble btn-scribble-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-scribble btn-scribble-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CalendarIcon size={15} /> {saving ? 'Scheduling…' : 'Schedule'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '1rem', color: 'var(--color-pencil)', marginBottom: '0.75rem' }}>
            Upcoming
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
            {upcoming.map(m => (
              <MeetingCard key={m.id} meeting={m} user={user} isOwner={isOwner}
                onRsvp={() => handleRsvp(m)} onDelete={() => handleDelete(m.id)} isPast={false} />
            ))}
          </div>
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '1rem', color: 'var(--color-pencil)', marginBottom: '0.75rem', opacity: 0.65 }}>
            Past Meetings
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', opacity: 0.6 }}>
            {past.map(m => (
              <MeetingCard key={m.id} meeting={m} user={user} isOwner={isOwner}
                onRsvp={() => handleRsvp(m)} onDelete={() => handleDelete(m.id)} isPast={true} />
            ))}
          </div>
        </>
      )}

      {meetings.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-pencil)' }}>
          <CalendarIcon size={44} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <p style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.15rem' }}>No meetings yet — schedule your first one!</p>
        </div>
      )}
    </div>
  )
}

function MeetingCard({ meeting, user, isOwner, onRsvp, onDelete, isPast }) {
  const hasRsvp = meeting.rsvps?.includes(user.uid)
  const dt = new Date(`${meeting.date}T${meeting.time}`)
  const dateStr = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="card-scribble" style={{ padding: '1.1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.1rem', margin: '0 0 0.3rem' }}>{meeting.title}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', color: 'var(--color-pencil)', fontSize: '0.88rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CalendarIcon size={14} /> {dateStr}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ClockIcon size={14} /> {timeStr}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <UsersIcon size={14} /> {meeting.rsvps?.length || 0} going
            </span>
          </div>
          {meeting.agenda && (
            <p style={{ color: 'var(--color-pencil)', fontSize: '0.88rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
              {meeting.agenda}
            </p>
          )}
          {meeting.link && (
            <a href={meeting.link} target="_blank" rel="noopener noreferrer"
              className="btn-scribble" onClick={e => e.stopPropagation()}
              style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.25rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
              <LinkIcon size={14} /> Join Call
            </a>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
          {!isPast && (
            <button onClick={onRsvp}
              className={`btn-scribble ${hasRsvp ? 'btn-scribble-primary' : ''}`}
              style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {hasRsvp ? <CheckIcon size={14} /> : null} {hasRsvp ? "I'm going" : 'RSVP'}
            </button>
          )}
          {(isOwner || meeting.createdBy === user.uid) && (
            <button onClick={onDelete} className="btn-scribble btn-scribble-ghost"
              style={{ fontSize: '0.85rem', padding: '0.25rem 0.6rem' }}>
              <TrashIcon size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/*   MEMBERS PANEL                                                      */
/* ─────────────────────────────────────────────────────────────────── */
function MembersPanel({ club, user, isOwner }) {
  const handleKick = async (member) => {
    if (member.uid === club.createdBy) { toast.error("Can't remove the owner."); return }
    if (!window.confirm(`Remove ${member.name} from the club?`)) return
    try {
      await updateDoc(doc(db, 'bookclubs', club.id), {
        memberIds: arrayRemove(member.uid),
        members: arrayRemove(member),
      })
      toast.success(`${member.name} removed.`)
    } catch { toast.error('Could not remove member.') }
  }
  return (
    <div className="card-scribble" style={{ padding: '1.25rem' }}>
      <h3 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.2rem', marginBottom: '1rem' }}>
        <UsersIcon size={18} style={{ marginRight: '0.4rem' }} />
        {club.memberIds?.length || 0} Member{(club.memberIds?.length || 0) !== 1 ? 's' : ''}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {(club.members || []).map(member => (
          <div key={member.uid} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.6rem 0.9rem', borderRadius: '6px',
            background: member.uid === user.uid ? 'var(--color-paper-dark)' : 'transparent',
            border: '1.5px solid var(--color-paper-crease)' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: avatarBg(member.uid),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--color-ink)', color: 'var(--color-paper)',
              fontFamily: 'var(--font-sketch)', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
            }}>
              {initials(member.name)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-sketch)', margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {member.name}
                {member.uid === club.createdBy && (
                  <span className="stamp-scribble" style={{ fontSize: '0.6rem', transform: 'rotate(-1deg)', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <CrownIcon size={10} /> Owner
                  </span>
                )}
                {member.uid === user.uid && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-pencil)' }}>(you)</span>
                )}
              </p>
              {member.joinedAt && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-pencil)', margin: 0 }}>
                  Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
            {isOwner && member.uid !== user.uid && member.uid !== club.createdBy && (
              <button className="btn-scribble btn-scribble-ghost" onClick={() => handleKick(member)}
                style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/*   INFO PANEL (editable by owner)                                    */
/* ─────────────────────────────────────────────────────────────────── */
function InfoPanel({ club, user, isOwner, onCopyLink }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: club.name, bookTitle: club.bookTitle || '', bookAuthor: club.bookAuthor || '', description: club.description || '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateDoc(doc(db, 'bookclubs', club.id), { ...form })
      toast.success('Club updated!')
      setEditing(false)
    } catch { toast.error('Could not save.') }
    setSaving(false)
  }

  const inviteUrl = `${window.location.origin}/bookclubs?join=${club.id}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Invite link card */}
      <div className="card-scribble" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LinkIcon size={18} /> Sharable Invite Link
        </h4>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <code style={{ flex: 1, minWidth: 0, padding: '0.45rem 0.8rem', background: 'var(--color-paper-dark)',
            border: '1.5px dashed var(--color-pencil)', borderRadius: '6px', fontSize: '0.8rem',
            wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--color-pencil)' }}>
            {inviteUrl}
          </code>
          <button className="btn-scribble" onClick={onCopyLink}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', padding: '0.35rem 0.85rem', flexShrink: 0 }}>
            <CopyIcon size={15} /> Copy
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-pencil)', marginTop: '0.5rem', opacity: 0.7 }}>
          Anyone with this link can join the club. Share it via WhatsApp, email, or anywhere!
        </p>
      </div>

      {/* Club details */}
      <div className="card-scribble" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.1rem', margin: 0 }}>Club Details</h4>
          {isOwner && !editing && (
            <button className="btn-scribble btn-scribble-ghost" onClick={() => setEditing(true)}
              style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <EditIcon size={14} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.2rem' }}>Club Name</label>
              <input className="input-scribble-box" style={{ width: '100%' }} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.2rem' }}>Book Title</label>
                <input className="input-scribble-box" style={{ width: '100%' }} value={form.bookTitle}
                  onChange={e => setForm(f => ({ ...f, bookTitle: e.target.value }))} placeholder="Currently reading…" />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.2rem' }}>Author</label>
                <input className="input-scribble-box" style={{ width: '100%' }} value={form.bookAuthor}
                  onChange={e => setForm(f => ({ ...f, bookAuthor: e.target.value }))} placeholder="Author name" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-pencil)', display: 'block', marginBottom: '0.2rem' }}>Description</label>
              <textarea className="input-scribble-box" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What's this club about?" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-scribble btn-scribble-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn-scribble btn-scribble-primary" disabled={saving}>
                {saving ? 'Saving…' : '✓ Save'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Row label="Club Name" value={club.name} />
            <Row label="Currently Reading" value={club.bookTitle ? `"${club.bookTitle}"${club.bookAuthor ? ` — ${club.bookAuthor}` : ''}` : '—'} />
            <Row label="About" value={club.description || '—'} />
            <Row label="Created By" value={club.creatorName || '—'} />
            <Row label="Created" value={formatDate(club.createdAt)} />
            <Row label="Club ID" value={club.id} mono />
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px dashed var(--color-paper-crease)', paddingBottom: '0.4rem' }}>
      <span style={{ fontFamily: 'var(--font-sketch)', color: 'var(--color-pencil)', minWidth: '140px', flexShrink: 0, fontSize: '0.88rem' }}>
        {label}
      </span>
      <span style={{ color: 'var(--color-ink)', fontSize: '0.92rem', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>
        {value}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/*   CREATE CLUB MODAL                                                  */
/* ─────────────────────────────────────────────────────────────────── */
function CreateClubModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', bookTitle: '', bookAuthor: '', description: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Club name is required.'); return }
    setSaving(true)
    await onCreate(form)
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="modal-backdrop"
      style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div
        initial={{ scale: 0.88, opacity: 0, rotate: -1 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        className="card-scribble"
        style={{ background: 'var(--color-paper)', width: '100%', maxWidth: '520px', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-pencil)' }}>
          <CloseIcon size={22} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-sketch)', fontSize: '1.8rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpenIcon size={26} /> Start a Book Club
        </h2>
        <p style={{ color: 'var(--color-pencil)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Gather your readers and discuss books together.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={{ fontFamily: 'var(--font-sketch)', display: 'block', marginBottom: '0.25rem' }}>Club Name *</label>
            <input className="input-scribble-box" style={{ width: '100%' }}
              placeholder="e.g. The Midnight Readers"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-sketch)', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Book Title</label>
              <input className="input-scribble-box" style={{ width: '100%' }}
                placeholder="Currently reading…"
                value={form.bookTitle} onChange={e => setForm(f => ({ ...f, bookTitle: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-sketch)', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Author</label>
              <input className="input-scribble-box" style={{ width: '100%' }}
                placeholder="Author name"
                value={form.bookAuthor} onChange={e => setForm(f => ({ ...f, bookAuthor: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-sketch)', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>About Your Club</label>
            <textarea className="input-scribble-box" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
              placeholder="What kind of books will you read? Any vibe?"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn-scribble btn-scribble-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-scribble btn-scribble-primary" disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckIcon size={16} /> {saving ? 'Creating…' : 'Create Club'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
