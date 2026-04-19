const ITEMS = [
  // ── OPEN BOOKS ──
  { id:'b1',  x:'3%',   y:'4%',   r:-14, s:1.4, o:0.22,
    d:<svg width="72" height="54" viewBox="0 0 72 54" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M36 9 C27 6 12 6 6 9 L6 45 C12 42 27 42 36 45"/><path d="M36 9 C45 6 60 6 66 9 L66 45 C60 42 45 42 36 45"/><path d="M36 9 L36 45"/><line x1="12" y1="18" x2="30" y2="18"/><line x1="12" y1="25" x2="30" y2="25"/><line x1="12" y1="32" x2="26" y2="32"/><line x1="42" y1="18" x2="60" y2="18"/><line x1="42" y1="25" x2="60" y2="25"/><line x1="42" y1="32" x2="56" y2="32"/></svg> },
  { id:'b2',  x:'72%',  y:'2%',   r: 10, s:1.1, o:0.18,
    d:<svg width="56" height="42" viewBox="0 0 56 42" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M28 7 C21 5 9 5 5 7 L5 35 C9 33 21 33 28 35"/><path d="M28 7 C35 5 47 5 51 7 L51 35 C47 33 35 33 28 35"/><path d="M28 7 L28 35"/><line x1="9" y1="14" x2="23" y2="14"/><line x1="9" y1="20" x2="23" y2="20"/></svg> },
  { id:'b3',  x:'92%',  y:'62%',  r: 6,  s:1.0, o:0.12,
    d:<svg width="56" height="42" viewBox="0 0 56 42" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M28 7 C21 5 9 5 5 7 L5 35 C9 33 21 33 28 35"/><path d="M28 7 C35 5 47 5 51 7 L51 35 C47 33 35 33 28 35"/><path d="M28 7 L28 35"/></svg> },
  { id:'b4',  x:'88%',  y:'38%',  r:-8,  s:1.2, o:0.2,
    d:<svg width="72" height="54" viewBox="0 0 72 54" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M36 9 C27 6 12 6 6 9 L6 45 C12 42 27 42 36 45"/><path d="M36 9 C45 6 60 6 66 9 L66 45 C60 42 45 42 36 45"/><path d="M36 9 L36 45"/><line x1="12" y1="18" x2="30" y2="18"/><line x1="42" y1="18" x2="60" y2="18"/></svg> },

  // ── PENCILS ──
  { id:'p1',  x:'90%',  y:'6%',   r: 32, s:1.2, o:0.25,
    d:<svg width="16" height="64" viewBox="0 0 16 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="10" height="44" rx="1"/><polygon points="3,49 13,49 8,61"/><line x1="3" y1="10" x2="13" y2="10"/><line x1="3" y1="15" x2="13" y2="15"/><line x1="8" y1="1" x2="8" y2="5"/></svg> },
  { id:'p2',  x:'58%',  y:'85%',  r:-38, s:1.0, o:0.2,
    d:<svg width="16" height="64" viewBox="0 0 16 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="10" height="44" rx="1"/><polygon points="3,49 13,49 8,61"/><line x1="3" y1="10" x2="13" y2="10"/></svg> },
  { id:'p3',  x:'8%',   y:'44%',  r:-55, s:1.3, o:0.22,
    d:<svg width="16" height="64" viewBox="0 0 16 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="10" height="44" rx="1"/><polygon points="3,49 13,49 8,61"/><line x1="3" y1="10" x2="13" y2="10"/><line x1="3" y1="15" x2="13" y2="15"/></svg> },

  // ── STARS ──
  { id:'s1',  x:'16%',  y:'18%',  r: 18, s:1.2, o:0.28,
    d:<svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19,3 23,14 35,14 26,21 29,33 19,26 9,33 12,21 3,14 15,14"/></svg> },
  { id:'s2',  x:'80%',  y:'14%',  r:-10, s:0.9, o:0.25,
    d:<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="14,2 17,10 26,10 19,16 22,24 14,18 6,24 9,16 2,10 11,10"/></svg> },
  { id:'s3',  x:'38%',  y:'93%',  r: 22, s:1.0, o:0.2,
    d:<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="14,2 17,10 26,10 19,16 22,24 14,18 6,24 9,16 2,10 11,10"/></svg> },
  { id:'s4',  x:'93%',  y:'72%',  r:-5,  s:0.8, o:0.18,
    d:<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11,1 13.5,8 21,8 15,12.5 17.5,19.5 11,15 4.5,19.5 7,12.5 1,8 8.5,8"/></svg> },
  { id:'s5',  x:'52%',  y:'8%',   r: 8,  s:1.0, o:0.2,
    d:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12,2 14.5,9 22,9 16,13.5 18.5,20.5 12,16 5.5,20.5 8,13.5 2,9 9.5,9"/></svg> },

  // ── ARROWS ──
  { id:'a1',  x:'30%',  y:'3%',   r: 15, s:1.1, o:0.3,
    d:<svg width="64" height="24" viewBox="0 0 64 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12 Q30 7 54 12"/><polyline points="44,5 54,12 44,19"/></svg> },
  { id:'a2',  x:'94%',  y:'44%',  r:-20, s:1.0, o:0.14,
    d:<svg width="64" height="24" viewBox="0 0 64 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12 Q30 17 54 12"/><polyline points="44,5 54,12 44,19"/></svg> },
  { id:'a3',  x:'5%',   y:'68%',  r: 40, s:1.2, o:0.22,
    d:<svg width="50" height="50" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 40 Q20 10 40 10"/><polyline points="32,6 40,10 36,18"/></svg> },
  { id:'a4',  x:'75%',  y:'55%',  r:-30, s:1.0, o:0.17,
    d:<svg width="50" height="50" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M40 40 Q20 10 10 10"/><polyline points="18,6 10,10 14,18"/></svg> },

  // ── MAGNIFYING GLASS ──
  { id:'m1',  x:'76%',  y:'22%',  r:-18, s:1.1, o:0.22,
    d:<svg width="48" height="54" viewBox="0 0 48 54" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="20" cy="20" r="15"/><line x1="31" y1="31" x2="44" y2="46"/><line x1="13" y1="20" x2="27" y2="20"/><line x1="20" y1="13" x2="20" y2="27"/></svg> },
  { id:'m2',  x:'22%',  y:'78%',  r: 12, s:0.9, o:0.17,
    d:<svg width="44" height="50" viewBox="0 0 44 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="18" r="13"/><line x1="27" y1="27" x2="40" y2="42"/></svg> },

  // ── LIGHTBULB ──
  { id:'l1',  x:'4%',   y:'25%',  r:-5,  s:1.1, o:0.22,
    d:<svg width="40" height="52" viewBox="0 0 40 52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 5 A13 13 0 0 1 33 18 C33 26 27 30 26 34 L14 34 C13 30 7 26 7 18 A13 13 0 0 1 20 5Z"/><line x1="14" y1="34" x2="26" y2="34"/><line x1="14" y1="39" x2="26" y2="39"/><line x1="16" y1="44" x2="24" y2="44"/><line x1="20" y1="1" x2="20" y2="3"/><line x1="5" y1="5" x2="7" y2="7"/><line x1="35" y1="5" x2="33" y2="7"/><line x1="1" y1="18" x2="4" y2="18"/><line x1="39" y1="18" x2="36" y2="18"/></svg> },

  // ── BOOKMARKS ──
  { id:'bk1', x:'94%',  y:'10%',  r: 6,  s:1.0, o:0.25,
    d:<svg width="28" height="50" viewBox="0 0 28 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3,3 25,3 25,47 14,37 3,47"/></svg> },
  { id:'bk2', x:'1%',   y:'80%',  r:-8,  s:1.1, o:0.2,
    d:<svg width="28" height="50" viewBox="0 0 28 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3,3 25,3 25,47 14,37 3,47"/><line x1="9" y1="12" x2="19" y2="12"/></svg> },

  // ── READING GLASSES ──
  { id:'g1',  x:'55%',  y:'4%',   r:-6,  s:1.2, o:0.22,
    d:<svg width="68" height="26" viewBox="0 0 68 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="15" r="11"/><circle cx="50" cy="15" r="11"/><path d="M29 15 C33 11 35 11 39 15"/><line x1="4" y1="10" x2="7" y2="13"/><line x1="64" y1="10" x2="61" y2="13"/></svg> },
  { id:'g2',  x:'12%',  y:'92%',  r: 14, s:1.0, o:0.18,
    d:<svg width="60" height="22" viewBox="0 0 60 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="15" cy="13" r="10"/><circle cx="45" cy="13" r="10"/><path d="M25 13 C29 9 31 9 35 13"/><line x1="3" y1="8" x2="5" y2="10"/><line x1="57" y1="8" x2="55" y2="10"/></svg> },

  // ── STACKED BOOKS ──
  { id:'sb1', x:'84%',  y:'70%',  r:-7,  s:1.3, o:0.22,
    d:<svg width="54" height="52" viewBox="0 0 54 52" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="36" width="40" height="10" rx="1.5"/><rect x="5" y="25" width="44" height="10" rx="1.5"/><rect x="9" y="14" width="36" height="10" rx="1.5"/><rect x="12" y="3" width="30" height="10" rx="1.5"/></svg> },
  { id:'sb2', x:'14%',  y:'55%',  r: 9,  s:1.1, o:0.17,
    d:<svg width="50" height="48" viewBox="0 0 50 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="32" width="38" height="10" rx="1.5"/><rect x="4" y="22" width="42" height="10" rx="1.5"/><rect x="8" y="12" width="34" height="10" rx="1.5"/><rect x="11" y="2" width="28" height="10" rx="1.5"/></svg> },

  // ── SPIRAL NOTEBOOK ──
  { id:'nb1', x:'10%',  y:'12%',  r: 7,  s:1.1, o:0.2,
    d:<svg width="48" height="58" viewBox="0 0 48 58" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="10" y="5" width="34" height="48" rx="2.5"/><path d="M8 5 Q3 5 3 10 Q3 15 8 15 Q13 15 13 10 Q13 5 8 5"/><path d="M8 20 Q3 20 3 25 Q3 30 8 30 Q13 30 13 25 Q13 20 8 20"/><path d="M8 35 Q3 35 3 40 Q3 45 8 45 Q13 45 13 40 Q13 35 8 35"/><line x1="17" y1="18" x2="38" y2="18"/><line x1="17" y1="25" x2="38" y2="25"/><line x1="17" y1="32" x2="38" y2="32"/><line x1="17" y1="39" x2="34" y2="39"/></svg> },

  // ── SPEECH / QUOTE BUBBLE ──
  { id:'q1',  x:'5%',  y:'42%',  r: 6,  s:1.05, o:0.14,
    d:<svg width="52" height="46" viewBox="0 0 52 46" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5 L47 5 Q50 5 50 8 L50 30 Q50 33 47 33 L30 33 L22 42 L22 33 L8 33 Q5 33 5 30 Z"/><path d="M16 17 Q14 12 17 12 Q20 12 20 17 Q20 21 15 23"/><path d="M28 17 Q26 12 29 12 Q32 12 32 17 Q32 21 27 23"/></svg> },
  { id:'q2',  x:'42%',  y:'75%',  r:-12, s:0.9, o:0.15,
    d:<svg width="44" height="38" viewBox="0 0 44 38" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4 L40 4 Q43 4 43 7 L43 26 Q43 29 40 29 L26 29 L18 36 L18 29 L7 29 Q4 29 4 26 Z"/></svg> },

  // ── COFFEE CUP ──
  { id:'c1',  x:'7%',  y:'14%',  r: 5,  s:1.05, o:0.16,
    d:<svg width="44" height="50" viewBox="0 0 44 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 16 L10 44 Q10 46 14 46 L30 46 Q34 46 34 44 L38 16 Z"/><line x1="4" y1="16" x2="40" y2="16"/><path d="M38 22 Q46 22 46 29 Q46 36 38 36"/><path d="M16 6 Q16 1 20 1 Q24 1 24 6 Q24 11 20 11"/><path d="M24 6 Q24 1 28 1 Q32 1 32 6 Q32 11 28 11"/></svg> },

  // ── HEART ──
  { id:'h1',  x:'96%',  y:'52%',  r: 12, s:1.0, o:0.2,
    d:<svg width="36" height="34" viewBox="0 0 36 34" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 30 C18 30 3 20 3 11 A8 8 0 0 1 18 8 A8 8 0 0 1 33 11 C33 20 18 30 18 30Z"/></svg> },

  // ── QUILL / FEATHER ──
  { id:'qf1', x:'25%',  y:'38%',  r:-20, s:1.2, o:0.17,
    d:<svg width="40" height="60" viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 55 C20 55 5 40 5 20 Q5 5 20 3 Q35 5 35 20 C35 35 20 55 20 55Z"/><path d="M20 55 L20 25"/><path d="M8 30 Q15 28 20 25"/><path d="M8 22 Q15 20 20 17"/><path d="M11 15 Q16 13 20 10"/></svg> },

  // ── RULER ──
  { id:'r1',  x:'96%',  y:'30%',  r: 15, s:0.85, o:0.12,
    d:<svg width="160" height="28" viewBox="0 0 160 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="6" width="156" height="16" rx="2"/>{[0,20,40,60,80,100,120,140].map((x,i)=><line key={i} x1={x+10} y1="6" x2={x+10} y2={i%2===0?14:11}/>)}</svg> },

  // ── TINY DECORATIVE DOTS / ASTERISKS ──
  { id:'d1',  x:'35%',  y:'12%',  r: 0,  s:1.0, o:0.3,
    d:<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" y1="2" x2="10" y2="18"/><line x1="2" y1="10" x2="18" y2="10"/><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg> },
  { id:'d2',  x:'64%',  y:'66%',  r: 15, s:0.9, o:0.25,
    d:<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" y1="2" x2="10" y2="18"/><line x1="2" y1="10" x2="18" y2="10"/><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg> },
  { id:'d3',  x:'20%',  y:'32%',  r: 0,  s:0.8, o:0.2,
    d:<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="1" x2="8" y2="15"/><line x1="1" y1="8" x2="15" y2="8"/><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg> },

  // ── SCATTERED LABELS ──
  { id:'lbl1', x:'60%', y:'29%',  r:-8,  s:1.0, o:0.12,
    d:<svg width="80" height="24" viewBox="0 0 80 24" fill="none"><text x="2" y="18" fontFamily="Caveat, cursive" fontSize="20" fontWeight="700" fill="currentColor">READ!</text></svg> },
  { id:'lbl2', x:'28%', y:'50%',  r: 10, s:1.0, o:0.1,
    d:<svg width="100" height="24" viewBox="0 0 100 24" fill="none"><text x="2" y="18" fontFamily="Caveat, cursive" fontSize="20" fontWeight="700" fill="currentColor">BOOKS 📚</text></svg> },
  { id:'lbl3', x:'82%', y:'84%',  r:-5,  s:1.0, o:0.1,
    d:<svg width="110" height="24" viewBox="0 0 110 24" fill="none"><text x="2" y="18" fontFamily="Caveat, cursive" fontSize="20" fontWeight="700" fill="currentColor">page 1...</text></svg> },
  { id:'lbl4', x:'3%',  y:'90%',  r: 7,  s:1.0, o:0.1,
    d:<svg width="80" height="24" viewBox="0 0 80 24" fill="none"><text x="2" y="18" fontFamily="Caveat, cursive" fontSize="20" fontWeight="700" fill="currentColor">✓ done</text></svg> },
]

export default function DoodleBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {ITEMS.map(({ id, x, y, r, s, o, d }) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            left: x, top: y,
            transform: `rotate(${r}deg) scale(${s})`,
            color: 'var(--color-ink)',
            opacity: o,
          }}
        >
          {d}
        </div>
      ))}
    </div>
  )
}