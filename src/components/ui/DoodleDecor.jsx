// All SVG strokes and inline colours now use CSS custom properties
// so they automatically flip between light & dark when the cord is pulled.

export const Star = ({ size = 20, opacity = 0.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)"
    strokeWidth="2.2" strokeLinecap="round" style={{ display:'inline-block', opacity, flexShrink:0 }}>
    <polygon points="12,2 14.5,9 22,9 16,13.5 18.5,20.5 12,16 5.5,20.5 8,13.5 2,9 9.5,9"/>
  </svg>
)

export const Arrow = ({ rotate = 0, size = 44, opacity = 0.45 }) => (
  <svg width={size} height={size * 0.45} viewBox="0 0 64 28"
    fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'inline-block', transform:`rotate(${rotate}deg)`, opacity, flexShrink:0 }}>
    <path d="M4 14 Q28 8 56 14"/><polyline points="46,7 56,14 46,21"/>
  </svg>
)

export const Zigzag = ({ opacity = 0.28 }) => (
  <svg viewBox="0 0 800 14" fill="none" style={{ width:'100%', display:'block', opacity }}>
    <path d="M0,8 L20,2 L40,8 L60,2 L80,8 L100,2 L120,8 L140,2 L160,8 L180,2 L200,8 L220,2 L240,8 L260,2 L280,8 L300,2 L320,8 L340,2 L360,8 L380,2 L400,8 L420,2 L440,8 L460,2 L480,8 L500,2 L520,8 L540,2 L560,8 L580,2 L600,8 L620,2 L640,8 L660,2 L680,8 L700,2 L720,8 L740,2 L760,8 L780,2 L800,8"
      stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ScribbleUnderline = ({ children, style = {} }) => (
  <span style={{ position:'relative', display:'inline-block', ...style }}>
    {children}
    <svg viewBox="0 0 100 10" preserveAspectRatio="none"
      style={{ position:'absolute', bottom:-5, left:0, width:'100%', height:10, overflow:'visible' }}>
      <path d="M0,7 Q25,2 50,6 Q75,10 100,5" stroke="var(--color-ink)" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
    </svg>
  </span>
)

export const CircleAround = ({ children, style = {} }) => (
  <span style={{ position:'relative', display:'inline-block', padding:'2px 10px', ...style }}>
    {children}
    <svg viewBox="0 0 120 46" preserveAspectRatio="none"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible', pointerEvents:'none' }}>
      <ellipse cx="60" cy="23" rx="57" ry="20" stroke="var(--color-ink)" strokeWidth="2.5" fill="none" strokeDasharray="6 3"/>
    </svg>
  </span>
)

export const DashedDivider = ({ opacity = 0.2 }) => (
  <div style={{
    height:'1.5px',
    background:`repeating-linear-gradient(90deg, var(--color-ink) 0, var(--color-ink) 10px, transparent 10px, transparent 18px)`,
    opacity,
    margin:'1.5rem 0',
  }}/>
)

export const SectionHeader = ({ children, emoji, subtitle, style = {} }) => (
  <div style={{ marginBottom:'2rem', ...style }}>
    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
      {emoji && <span style={{ fontSize:'2rem' }}>{emoji}</span>}
      <h2 style={{
        fontFamily:'var(--font-sketch)',
        fontSize:'clamp(1.8rem, 4vw, 2.6rem)',
        fontWeight:700,
        color:'var(--color-ink)',
        display:'inline-block',
        position:'relative',
      }}>
        {children}
        <svg viewBox="0 0 300 10" preserveAspectRatio="none"
          style={{ position:'absolute', bottom:-6, left:0, width:'100%', height:10, overflow:'visible', opacity:0.5 }}>
          <path d="M0,7 Q75,2 150,6 Q225,10 300,5" stroke="var(--color-ink)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      </h2>
      <Star size={20} opacity={0.5}/>
    </div>
    {subtitle && (
      <p style={{ fontFamily:'var(--font-study)', fontSize:'1rem', color:'var(--color-pencil)', marginTop:'0.4rem' }}>
        {subtitle}
      </p>
    )}
  </div>
)

export const SketchCard = ({ children, rotate = 0, hover = true, style = {}, padding = '1.4rem' }) => (
  <div style={{
    background:'var(--color-paper)',
    border:'2.5px solid var(--color-ink)',
    borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
    boxShadow:'5px 5px 0 var(--color-ink)',
    padding,
    transform:`rotate(${rotate}deg)`,
    transition: hover ? 'transform 0.15s ease, box-shadow 0.15s ease' : 'none',
    position:'relative',
    ...style,
  }}
    onMouseEnter={hover ? e => { e.currentTarget.style.transform='rotate(0deg) scale(1.03)'; e.currentTarget.style.boxShadow='7px 7px 0 var(--color-ink)'; } : undefined}
    onMouseLeave={hover ? e => { e.currentTarget.style.transform=`rotate(${rotate}deg)`; e.currentTarget.style.boxShadow='5px 5px 0 var(--color-ink)'; } : undefined}
  >
    {children}
  </div>
)

export const SketchInput = ({ label, type = 'text', value, onChange, placeholder, autoComplete, name, rows }) => (
  <div style={{ marginBottom:'1.4rem' }}>
    {label && (
      <label style={{
        display:'block',
        fontFamily:'var(--font-sketch)',
        fontSize:'1.05rem',
        fontWeight:600,
        color:'var(--color-pencil)',
        marginBottom:'0.3rem',
      }}>{label}</label>
    )}
    {rows ? (
      <textarea
        value={value} onChange={onChange} placeholder={placeholder}
        rows={rows} name={name}
        style={{
          width:'100%', background:'transparent',
          border:'2px solid var(--color-ink)',
          borderRadius:'15px 255px 15px 225px / 225px 15px 255px 15px',
          padding:'0.5rem 0.8rem',
          fontFamily:'var(--font-body)', fontSize:'1rem', color:'var(--color-ink)',
          outline:'none', resize:'vertical',
          boxShadow:'3px 3px 0 var(--color-ink)',
        }}
      />
    ) : (
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete} name={name}
        style={{
          width:'100%', background:'transparent', border:'none',
          borderBottom:'2.5px solid var(--color-ink)',
          padding:'0.45rem 0.2rem',
          fontFamily:'var(--font-body)', fontSize:'1.05rem', color:'var(--color-ink)', outline:'none',
        }}
        onFocus={e => (e.target.style.borderBottomWidth = '3px')}
        onBlur={e  => (e.target.style.borderBottomWidth = '2.5px')}
      />
    )}
  </div>
)

export const ScribbleButton = ({ children, onClick, primary = false, small = false, disabled = false, type = 'button', style = {} }) => (
  <button
    type={type} onClick={onClick} disabled={disabled}
    style={{
      fontFamily:'var(--font-sketch)',
      fontSize: small ? '1rem' : '1.15rem',
      fontWeight:700,
      border:'2.5px solid var(--color-ink)',
      borderRadius:'255px 15px 225px 15px / 15px 225px 15px 255px',
      padding: small ? '0.3rem 1rem' : '0.55rem 1.6rem',
      background: primary ? 'var(--color-ink)' : 'var(--color-paper)',
      color: primary ? 'var(--color-paper)' : 'var(--color-ink)',
      boxShadow: primary ? '4px 4px 0 var(--color-pencil)' : '4px 4px 0 var(--color-ink)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.65 : 1,
      display:'inline-flex', alignItems:'center', gap:'0.4rem',
      transition:'transform 0.1s, box-shadow 0.1s',
      whiteSpace:'nowrap',
      ...style,
    }}
    onMouseEnter={!disabled ? e => { e.currentTarget.style.transform='translate(-2px,-2px)'; e.currentTarget.style.boxShadow= primary ? '6px 6px 0 var(--color-pencil)' : '6px 6px 0 var(--color-ink)'; } : undefined}
    onMouseLeave={!disabled ? e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow= primary ? '4px 4px 0 var(--color-pencil)' : '4px 4px 0 var(--color-ink)'; } : undefined}
    onMouseDown={!disabled ? e => { e.currentTarget.style.transform='translate(2px,2px)'; e.currentTarget.style.boxShadow= primary ? '2px 2px 0 var(--color-pencil)' : '2px 2px 0 var(--color-ink)'; } : undefined}
    onMouseUp={!disabled ? e => { e.currentTarget.style.transform='translate(-2px,-2px)'; } : undefined}
  >
    {children}
  </button>
)