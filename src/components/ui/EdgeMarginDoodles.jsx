/**
 * Extra doodles only in the left/right viewport gutters so they don’t sit
 * over the centered copy (max ~860px). Hidden on narrow viewports.
 */
const MINI = {
  star: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 14.5,9 22,9 16,13.5 18.5,20.5 12,16 5.5,20.5 8,13.5 2,9 9.5,9" />
    </svg>
  ),
  spark: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M10 1v4M10 15v4M1 10h4M15 10h4M3.5 3.5l2.8 2.8M13.7 13.7l2.8 2.8M3.5 16.5l2.8-2.8M13.7 6.3l2.8-2.8" />
    </svg>
  ),
  loop: (
    <svg width="28" height="20" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 14c4-8 16-8 20 0" />
      <path d="M8 16c3-4 9-4 12 0" opacity="0.6" />
    </svg>
  ),
  book: (
    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3c-4-1-8 0-9 2v12c4-2 8-2 9-1" />
      <path d="M13 3c4-1 8 0 9 2v12c-4-2-8-2-9-1" />
      <path d="M13 3v14" />
    </svg>
  ),
  arrow: (
    <svg width="32" height="14" viewBox="0 0 32 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7h22M22 3l6 4-6 4" />
    </svg>
  ),
  dot: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <circle cx="6" cy="6" r="2.5" />
    </svg>
  ),
}

const LEFT = [
  { id: 'L1', top: '7%',  r: -12, s: 0.95, o: 0.14, el: MINI.star },
  { id: 'L2', top: '22%', r: 8,   s: 1,   o: 0.11, el: MINI.loop },
  { id: 'L3', top: '38%', r: 4,   s: 0.9, o: 0.12, el: MINI.book },
  { id: 'L4', top: '52%', r: -6,  s: 1,   o: 0.1,  el: MINI.spark },
  { id: 'L5', top: '66%', r: 14,  s: 0.85, o: 0.13, el: MINI.arrow },
  { id: 'L6', top: '80%', r: -4,  s: 1,   o: 0.11, el: MINI.star },
  { id: 'L7', top: '91%', r: 6,   s: 0.75, o: 0.09, el: MINI.dot },
]

const RIGHT = [
  { id: 'R1', top: '9%',  r: 10,  s: 0.95, o: 0.13, el: MINI.spark },
  { id: 'R2', top: '24%', r: -8,  s: 1,   o: 0.12, el: MINI.star },
  { id: 'R3', top: '40%', r: 5,   s: 0.9, o: 0.1,  el: MINI.loop },
  { id: 'R4', top: '54%', r: -14, s: 1,   o: 0.14, el: MINI.book },
  { id: 'R5', top: '68%', r: 7,   s: 0.88, o: 0.11, el: MINI.arrow },
  { id: 'R6', top: '82%', r: -5,  s: 1,   o: 0.1,  el: MINI.star },
  { id: 'R7', top: '93%', r: 12,  s: 0.8, o: 0.08, el: MINI.dot },
]

function Strip({ side, items }) {
  return (
    <div
      className="landing-edge-doodles"
      aria-hidden="true"
      style={{
        position: 'fixed',
        [side]: 0,
        top: 0,
        bottom: 0,
        width: 'clamp(56px, 11vw, 132px)',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {items.map(({ id, top, r, s, o, el }) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            left: side === 'left' ? '12%' : undefined,
            right: side === 'right' ? '12%' : undefined,
            top,
            transform: `rotate(${r}deg) scale(${s})`,
            color: 'var(--color-ink)',
            opacity: o,
          }}
        >
          {el}
        </div>
      ))}
    </div>
  )
}

export default function EdgeMarginDoodles() {
  return (
    <>
      <Strip side="left" items={LEFT} />
      <Strip side="right" items={RIGHT} />
    </>
  )
}
