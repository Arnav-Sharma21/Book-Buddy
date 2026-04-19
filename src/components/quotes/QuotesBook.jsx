import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuotes } from '../../hooks/useQuotes'
import QuoteCard from './QuoteCard'
import QuoteEditor from './QuoteEditor'
import LoadingSpinner from '../ui/LoadingSpinner'
import NotebookOverlay from '../ui/NotebookOverlay'
import { BookOpenIcon, PencilIcon } from '../ui/DoodleIcons'

export default function QuotesBook({ bookId, onClose }) {
  const { quotes, loading, handleAddQuote, handleDeleteQuote } = useQuotes(bookId)
  const [showEditor, setShowEditor] = useState(false)

  const handleSave = async (data) => {
    await handleAddQuote(data)
    setShowEditor(false)
  }

  return (
    <NotebookOverlay
      title="Quotes Journal"
      color="#f5e6c8"
      lineColor="rgba(180,160,120,0.28)"
      icon={<BookOpenIcon size={44} strokeWidth={1.2}/>}
      onClose={onClose}
    >
      {/* Add quote button */}
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
        <motion.button
          onClick={() => setShowEditor(v => !v)}
          whileHover={{ y:-2, boxShadow:'4px 4px 0 #111' }}
          whileTap={{ y:1 }}
          style={{
            fontFamily:'var(--font-sketch)', fontSize:'1rem', fontWeight:700,
            background: showEditor ? '#111' : 'transparent',
            color: showEditor ? '#fff' : '#111',
            border:'2.5px solid #111',
            borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
            padding:'0.35rem 1.1rem', cursor:'pointer',
            boxShadow:'2px 2px 0 #111',
            display:'flex', alignItems:'center', gap:6,
          }}>
          <PencilIcon size={15}/> {showEditor ? 'Cancel' : '+ Add Quote'}
        </motion.button>
      </div>

      {/* Quote editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }}
            style={{ overflow:'hidden', marginBottom:'1.2rem' }}>
            <QuoteEditor onSave={handleSave} onClose={() => setShowEditor(false)}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quotes list */}
      {loading ? (
        <LoadingSpinner text="Opening quotes journal…"/>
      ) : quotes.length === 0 && !showEditor ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{ textAlign:'center', padding:'3rem 1rem' }}>
          <BookOpenIcon size={56} strokeWidth={1.1} style={{ opacity:0.18, margin:'0 auto 1rem' }}/>
          <p style={{ fontFamily:'var(--font-sketch)', fontSize:'1.4rem',
            color:'var(--color-pencil)', lineHeight:1.5 }}>
            No quotes yet.<br/>Start highlighting great passages!
          </p>
        </motion.div>
      ) : (
        <div style={{
          columns:'1', gap:'1rem',
          // two columns on wider screens
        }}>
          <style>{`@media(min-width:540px){ .quotes-cols{ columns:2!important; } }`}</style>
          <div className="quotes-cols" style={{ columns:1, gap:'1rem' }}>
            <AnimatePresence>
              {quotes.map((q, i) => (
                <motion.div key={q.id}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, scale:0.9 }}
                  transition={{ delay: i*0.04 }}
                  style={{ breakInside:'avoid', marginBottom:'1rem' }}>
                  <QuoteCard quote={q} index={i}/>
                  <motion.button
                    onClick={() => handleDeleteQuote(q.id)}
                    whileHover={{ color:'#111' }}
                    style={{ fontFamily:'var(--font-sketch)', fontSize:'0.75rem',
                      color:'var(--color-pencil-light)', background:'none',
                      border:'none', cursor:'pointer', marginTop:'0.2rem',
                      padding:'0 0.2rem' }}>
                    remove
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </NotebookOverlay>
  )
}