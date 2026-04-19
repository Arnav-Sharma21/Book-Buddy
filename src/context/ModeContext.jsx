import { createContext, useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ModeContext = createContext(null)

export function ModeProvider({ children }) {
  const [mode, setMode] = useState('novel') // 'novel' | 'learning'

  const toggleMode = () =>
    setMode((prev) => (prev === 'novel' ? 'learning' : 'novel'))

  return (
    <ModeContext.Provider value={{ mode, toggleMode }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={mode === 'novel' ? 'min-h-screen bg-novel-bg' : 'min-h-screen bg-learn-bg'}
          style={{ backgroundImage: mode === 'novel' ? 'none' : 'repeating-linear-gradient(0deg,transparent,transparent 27px,#b8d4ed 28px),repeating-linear-gradient(90deg,transparent,transparent 27px,#b8d4ed 28px)' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </ModeContext.Provider>
  )
}

export const useMode = () => useContext(ModeContext)