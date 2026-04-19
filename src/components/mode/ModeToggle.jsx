import { motion } from 'framer-motion'
import { useMode } from '../../context/ModeContext'

export default function ModeToggle() {
  const { mode, toggleMode } = useMode()
  const isNovel = mode === 'novel'

  return (
    <div className="flex items-center gap-3 font-sketch text-lg">
      <span className={isNovel ? 'font-bold' : 'text-pencil'}>📖 Novels</span>
      <button
        onClick={toggleMode}
        className="relative w-14 h-7 sketch-border bg-paper"
        aria-label="Toggle mode"
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 w-6 h-6 sketch-border ${isNovel ? 'bg-novel-accent left-0.5' : 'bg-learn-accent left-7'}`}
        />
      </button>
      <span className={!isNovel ? 'font-bold' : 'text-pencil'}>📐 Learning</span>
    </div>
  )
}