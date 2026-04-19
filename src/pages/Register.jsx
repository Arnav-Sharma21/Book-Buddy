import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import rough from 'roughjs'
import { auth, db } from '../services/firebase'
import { toast } from 'react-toastify'
import DoodleBackground from '../components/ui/DoodleBackground'
import { Star, Arrow, SketchInput, ScribbleButton, DashedDivider } from '../components/ui/DoodleDecor'
import { MailIcon, PencilIcon, SparkleIcon, NotebookIcon } from '../components/ui/DoodleIcons'

function RoughCard({ children }) {
  const containerRef = useRef(null)
  const svgRef       = useRef(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const dimsRef = useRef({ w: 0, h: 0 })

  const redraw = () => {
    const svg = svgRef.current
    const d = dimsRef.current
    if (!svg || d.w < 4) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    const rc = rough.svg(svg)
    const style = getComputedStyle(document.documentElement)
    const inkColor   = style.getPropertyValue('--color-ink').trim()   || '#1a1a1a'
    const paperColor = style.getPropertyValue('--color-paper').trim() || '#f8f5ee'
    svg.appendChild(rc.rectangle(4, 4, d.w - 8, d.h - 8, {
      roughness: 1.2, strokeWidth: 2.5, stroke: inkColor, fill: paperColor, fillStyle: 'solid', bowing: 0.9,
    }))
  }

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width)
      const h = Math.round(e.contentRect.height)
      dimsRef.current = { w, h }
      setDims({ w, h })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => { redraw() }, [dims])

  // Redraw when theme changes (data-theme attribute on <html>)
  useEffect(() => {
    const mo = new MutationObserver(() => redraw())
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ position:'relative', width:'100%', maxWidth:480, boxShadow:'7px 7px 0 var(--color-ink)' }}>
      <svg ref={svgRef} width={dims.w} height={dims.h}
        style={{ position:'absolute', top:0, left:0, zIndex:0, pointerEvents:'none', overflow:'visible' }} aria-hidden="true"/>
      <div style={{ position:'relative', zIndex:1, padding:'2.5rem 2.2rem' }}>{children}</div>
    </div>
  )
}

export default function Register() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || { pathname: '/dashboard' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim())          return toast.error('Please enter your name')
    if (password !== confirm)  return toast.error("Passwords don't match!")
    if (password.length < 6)   return toast.error('Password must be 6+ chars')
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: name })
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid, displayName: name, email,
        createdAt: new Date().toISOString(), preferredGenres: [],
      })
      toast.success('Notebook created!')
      navigate(from.pathname + (from.search || ''), { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position:'relative' }}>
      <DoodleBackground />
      <div style={{ position:'relative', zIndex:1, minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1.5rem' }}>
        <motion.div
          initial={{ opacity:0, y:32, rotate:-2 }}
          animate={{ opacity:1, y:0,  rotate:-1 }}
          transition={{ type:'spring', stiffness:200, damping:22 }}
          style={{ width:'100%', maxWidth:480 }}
        >
          <RoughCard>
            {/* decorations */}
            <div style={{ position:'absolute', top:-20, right:-14, display:'flex', gap:'0.4rem', zIndex:2 }}>
              <Star size={28} opacity={0.7}/><Star size={20} opacity={0.5}/>
            </div>
            <div style={{ position:'absolute', top:20, left:-30, zIndex:2 }}>
              <Arrow rotate={-30} size={40} opacity={0.4}/>
            </div>

            {/* header */}
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <motion.div animate={{ rotate:[-3,3,-3] }} transition={{ repeat:Infinity, duration:4, ease:'easeInOut' }}
                style={{ display:'inline-block', marginBottom:'0.6rem' }}>
                <svg width="54" height="62" viewBox="0 0 54 62" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="3" width="36" height="54" rx="4" fill="var(--color-ink)"/>
                  <rect x="13" y="3" width="28" height="54" rx="3" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2"/>
                  <line x1="19" y1="19" x2="35" y2="19"/><line x1="19" y1="26" x2="35" y2="26"/>
                  <line x1="19" y1="33" x2="29" y2="33"/>
                  <rect x="7" y="3" width="7" height="54" rx="3.5" fill="var(--color-ink)"/>
                </svg>
              </motion.div>
              <h1 style={{ fontFamily:'var(--font-sketch)', fontSize:'2.9rem', fontWeight:700, color:'var(--color-ink)', lineHeight:1.05, marginBottom:'0.3rem' }}>
                New Notebook
              </h1>
              <p style={{ fontFamily:'var(--font-study)', fontSize:'1.05rem', color:'var(--color-pencil)' }}>
                Begin your reading journey <SparkleIcon size={16} style={{ verticalAlign:'middle', marginLeft:'0.2rem' }}/>
              </p>
              <svg viewBox="0 0 300 10" fill="none" style={{ width:'80%', margin:'0.5rem auto 0', display:'block' }}>
                <motion.path d="M4,6 Q75,2 150,6 Q225,10 296,6" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" fill="none"
                  initial={{ pathLength:0 }} animate={{ pathLength:1 }} transition={{ duration:0.9, delay:0.3 }}/>
              </svg>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <SketchInput label={<><PencilIcon size={14} style={{marginBottom:'-2px'}}/> Name</>}             type="text"     value={name}     onChange={e=>setName(e.target.value)}     placeholder="Your name"       autoComplete="name"/>
              <SketchInput label={<><MailIcon size={14} style={{marginBottom:'-2px'}}/> Email</>}            type="email"    value={email}    onChange={e=>setEmail(e.target.value)}    placeholder="your@email.com"  autoComplete="email"/>
              <SketchInput label="Password"         type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="········"        autoComplete="new-password"/>
              <SketchInput label="Confirm Password" type="password" value={confirm}  onChange={e=>setConfirm(e.target.value)}  placeholder="Repeat password" autoComplete="new-password"/>

              <ScribbleButton type="submit" primary disabled={loading} style={{ width:'100%', justifyContent:'center', fontSize:'1.25rem', padding:'0.7rem', marginTop:'0.5rem' }}>
                {loading ? 'Creating notebook…' : 'Start your notebook →'}
              </ScribbleButton>
            </form>

            <DashedDivider/>

            <p style={{ textAlign:'center', fontFamily:'var(--font-study)', fontSize:'1.05rem', color:'var(--color-pencil)' }}>
              Already have one?{' '}
              <Link to="/login" style={{ fontFamily:'var(--font-sketch)', fontSize:'1.15rem', fontWeight:700, color:'var(--color-ink)', textDecoration:'none', borderBottom:'2.5px solid var(--color-ink)', paddingBottom:'1px' }}>
                Log in
              </Link>
            </p>
          </RoughCard>
        </motion.div>
      </div>
    </div>
  )
}