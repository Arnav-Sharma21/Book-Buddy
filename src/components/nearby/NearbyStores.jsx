import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { getNearbyBookstores } from '../../services/placesApi'
import NotebookOverlay from '../ui/NotebookOverlay'
import { MapPinIcon, RulerIcon, AntennaIcon, RefreshIcon } from '../ui/DoodleIcons'

function StoreCard({ store, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24, rotate: -1 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 200, damping: 22 }}
      whileHover={{
        y: -4,
        rotate: 0.4,
        boxShadow: '7px 7px 0 #1a1a1a',
        transition: { type: 'spring', stiffness: 320, damping: 20 },
      }}
      style={{
        background: '#fffdf5',
        border: '2.5px solid #1a1a1a',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        boxShadow: '5px 5px 0 #1a1a1a',
        padding: '1rem 1.3rem',
        position: 'relative',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(200,100,160,0.1) 28px)',
      }}
    >
      {/* Dog-ear corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 0, height: 0, borderStyle: 'solid',
        borderWidth: '0 22px 22px 0',
        borderColor: 'transparent rgba(200,100,160,0.3) transparent transparent',
      }} />

      {/* Pin number badge */}
      <div style={{
        position: 'absolute', top: -10, left: 18,
        fontFamily: 'var(--font-sketch)', fontSize: '0.75rem', fontWeight: 700,
        background: '#1a1a1a', color: '#fff',
        border: '2px solid #1a1a1a',
        borderRadius: '50% 45% 52% 48% / 48% 52% 45% 52%',
        width: 26, height: 26,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {index + 1}
      </div>

      <h3 style={{
        fontFamily: 'var(--font-sketch)', fontSize: '1.15rem', fontWeight: 700,
        color: '#1a1a1a', marginBottom: '0.25rem', marginTop: '0.2rem',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <MapPinIcon size={15} style={{ flexShrink: 0 }} />
        {store.name}
      </h3>

      <p style={{
        fontFamily: 'var(--font-study)', fontSize: '0.88rem',
        color: 'var(--color-pencil)', lineHeight: 1.5, marginBottom: '0.4rem',
        paddingLeft: '1.3rem',
      }}>
        {store.address}
      </p>

      {store.distance && (
        <p style={{
          fontFamily: 'var(--font-sketch)', fontSize: '0.82rem',
          color: 'var(--color-pencil)',
          display: 'flex', alignItems: 'center', gap: 5,
          marginBottom: '0.55rem', paddingLeft: '1.3rem',
        }}>
          <RulerIcon size={13} /> {(store.distance / 1000).toFixed(1)} km away
        </p>
      )}

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`}
        target="_blank" rel="noreferrer"
        style={{
          fontFamily: 'var(--font-sketch)', fontSize: '0.88rem',
          color: '#1a1a1a',
          textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          borderBottom: '2px solid rgba(0,0,0,0.3)',
          paddingBottom: '0.05rem',
          marginLeft: '1.3rem',
        }}
      >
        Open in Maps →
      </a>
    </motion.div>
  )
}

export default function NearbyStores({ onClose }) {
  const [stores, setStores]   = useState([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  const handleFind = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported.')
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const results = await getNearbyBookstores(coords.latitude, coords.longitude)
          setStores(results); setFetched(true)
          if (results.length === 0) toast.info('No places found nearby.')
        } catch { toast.error('Could not fetch nearby places.') }
        finally   { setLoading(false) }
      },
      () => { toast.error('Location permission denied.'); setLoading(false) }
    )
  }

  return (
    <NotebookOverlay
      title="Nearby Bookstores"
      color="#fce7f3"
      lineColor="rgba(200,100,160,0.15)"
      icon={<MapPinIcon size={44} strokeWidth={1.2}/>}
      onClose={onClose}
    >
      {!fetched ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>

          {/* Floating pin animation */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.4rem' }}
          >
            <MapPinIcon size={68} strokeWidth={1.1} style={{ opacity: 0.22 }}/>
          </motion.div>

          <p style={{
            fontFamily: 'var(--font-sketch)', fontSize: '1.35rem',
            color: 'var(--color-pencil)', lineHeight: 1.6, marginBottom: '0.5rem',
          }}>
            Find libraries & bookstores near you!
          </p>
          <p style={{
            fontFamily: 'var(--font-study)', fontSize: '0.92rem',
            color: 'var(--color-pencil-light)', marginBottom: '1.8rem',
          }}>
            We'll use your location to find the nearest spots.
          </p>

          <motion.button onClick={handleFind} disabled={loading}
            whileHover={{ y: -3, boxShadow: '6px 6px 0 #1a1a1a' }}
            whileTap={{ y: 1 }}
            style={{
              fontFamily: 'var(--font-sketch)', fontSize: '1.1rem', fontWeight: 700,
              background: '#1a1a1a', color: '#fff',
              border: '2.5px solid #1a1a1a',
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
              padding: '0.6rem 1.6rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.25)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? <><AntennaIcon size={17}/> Finding…</>
              : <><MapPinIcon size={17}/> Find Near Me</>}
          </motion.button>
        </motion.div>
      ) : (
        <div>
          {/* Refresh header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
            <p style={{
              fontFamily: 'var(--font-sketch)', fontSize: '1rem',
              color: 'var(--color-pencil)',
            }}>
              {stores.length} spot{stores.length !== 1 ? 's' : ''} found nearby
            </p>
            <motion.button onClick={handleFind} disabled={loading}
              whileHover={{ y: -1, boxShadow: '4px 4px 0 #1a1a1a' }}
              whileTap={{ y: 1 }}
              style={{
                fontFamily: 'var(--font-sketch)', fontSize: '0.88rem',
                background: 'transparent', border: '2px solid #1a1a1a',
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                padding: '0.2rem 0.9rem', cursor: 'pointer',
                boxShadow: '2px 2px 0 #1a1a1a',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <RefreshIcon size={14}/> {loading ? 'Refreshing…' : 'Refresh'}
            </motion.button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <AnimatePresence>
              {stores.map((s, i) => (
                <StoreCard key={s.id} store={s} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </NotebookOverlay>
  )
}