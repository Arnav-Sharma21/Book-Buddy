import { useEffect, useRef, useCallback, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

/* ─── Verlet rope physics ─────────────────────────────────────── */
const SEGMENTS   = 22       // rope segment count — more = more sag/swing
const GRAVITY    = 0.48     // downward acceleration per tick
const DAMPING    = 0.982    // velocity damping (air resistance)
const ITERATIONS = 24       // constraint-solving iterations per frame
const SEG_LEN    = 13       // natural length of each segment (px)
const ROPE_LEN   = SEGMENTS * SEG_LEN   // ≈ 286px total natural length

function makeRope(anchorX, anchorY) {
  return Array.from({ length: SEGMENTS + 1 }, (_, i) => ({
    x:  anchorX,
    y:  anchorY + i * SEG_LEN,
    ox: anchorX,
    oy: anchorY + i * SEG_LEN,
    pinned: i === 0,
  }))
}

function stepRope(points, dt) {
  for (const p of points) {
    if (p.pinned) continue
    const vx = (p.x - p.ox) * DAMPING
    const vy = (p.y - p.oy) * DAMPING
    p.ox = p.x
    p.oy = p.y
    p.x += vx
    p.y += vy + GRAVITY * dt * dt
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 0; i < points.length - 1; i++) {
      const a  = points[i]
      const b  = points[i + 1]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d  = Math.sqrt(dx * dx + dy * dy) || 0.001
      const diff = (d - SEG_LEN) / d * 0.5
      const ox = dx * diff
      const oy = dy * diff
      if (!a.pinned) { a.x += ox; a.y += oy }
      if (!b.pinned) { b.x -= ox; b.y -= oy }
    }
    // keep anchor pinned
    points[0].x = points[0].ox
    points[0].y = points[0].oy
  }
}

/* ─── Constants ──────────────────────────────────────────────── */
const PULL_THRESHOLD = 50   // px the tip must travel downward to count as a pull
const GRAB_RADIUS    = 48   // px radius around knob to start grabbing
const CANVAS_W       = 140  // fixed canvas width (centred)
const CANVAS_H       = ROPE_LEN + 120

/* ─── Component ──────────────────────────────────────────────── */
export default function LampCord() {
  const { dark, toggle } = useTheme()

  const canvasRef    = useRef(null)
  const ropeRef      = useRef(null)
  const rafRef       = useRef(null)
  const lastTRef     = useRef(null)
  const grabRef      = useRef(null)
  const pullStartY   = useRef(null)
  const pullMaxY     = useRef(null)   // tracks furthest-down position during drag
  const hoverRef     = useRef(false)

  const [glowing,  setGlowing]  = useState(false)
  const [everPulled, setEverPulled] = useState(() => {
    try { return !!localStorage.getItem('bb-cord-pulled') } catch { return false }
  })

  /* ── anchor: top-centre of the canvas ── */
  const anchorX = CANVAS_W / 2
  const anchorY = 18   // a couple px inside canvas, below the ceiling cap

  /* ── init rope once ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = CANVAS_W
    canvas.height = CANVAS_H
    ropeRef.current = makeRope(anchorX, anchorY)
  }, [])

  /* ── animation loop ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = (t) => {
      if (lastTRef.current == null) lastTRef.current = t
      const dt = Math.min((t - lastTRef.current) / 16, 3)
      lastTRef.current = t

      if (ropeRef.current) stepRope(ropeRef.current, dt)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawRope(ctx, ropeRef.current, dark, hoverRef.current)

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [dark])

  /* ── cursor interaction helpers ── */
  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top
    return { x: cx, y: cy }
  }

  const nearTip = (pos) => {
    const r   = ropeRef.current
    if (!r) return false
    const tip = r[r.length - 1]
    const dx  = pos.x - tip.x
    const dy  = pos.y - tip.y
    return Math.sqrt(dx * dx + dy * dy) < GRAB_RADIUS
  }

  const onPointerMove = useCallback((e) => {
    const pos  = getPos(e)
    const near = nearTip(pos)
    hoverRef.current = near
    if (canvasRef.current) {
      canvasRef.current.style.cursor = grabRef.current?.active ? 'grabbing' : (near ? 'grab' : 'default')
    }

    if (!grabRef.current?.active) return
    const r   = ropeRef.current
    if (!r) return
    const tip = r[r.length - 1]
    tip.x += (pos.x - tip.x) * 0.45
    tip.y += (pos.y - tip.y) * 0.45
    // track the furthest-down position
    if (tip.y > (pullMaxY.current ?? 0)) pullMaxY.current = tip.y
  }, [])

  const onPointerDown = useCallback((e) => {
    const pos = getPos(e)
    if (!nearTip(pos)) return
    grabRef.current    = { active: true }
    pullStartY.current = ropeRef.current[ropeRef.current.length - 1].y
    pullMaxY.current   = pullStartY.current
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
    e.currentTarget?.setPointerCapture?.(e.pointerId)
  }, [])

  const onPointerUp = useCallback(() => {
    if (!grabRef.current?.active) return
    grabRef.current.active = false
    if (canvasRef.current) canvasRef.current.style.cursor = 'default'
    // use max travel distance reached during the drag (not tip position at release)
    const travel = (pullMaxY.current ?? 0) - (pullStartY.current ?? 0)
    if (travel > PULL_THRESHOLD) {
      setGlowing(true)
      toggle()
      setEverPulled(true)
      try { localStorage.setItem('bb-cord-pulled', '1') } catch {}
      setTimeout(() => setGlowing(false), 950)
    }
    pullStartY.current = null
    pullMaxY.current   = null
  }, [toggle])

  /* ── glow-burst top position (relative to viewport) ── */
  const glowTop = CANVAS_H - 30

  return (
    <>
      {/* Light-burst flash when pulled */}
      {glowing && (
        <div
          aria-hidden="true"
          style={{
            position:     'fixed',
            top:          `${glowTop}px`,
            right:        '8px',
            width:        '220px',
            height:       '220px',
            borderRadius: '50%',
            background:   dark
              ? 'radial-gradient(circle, rgba(255,235,130,0.6) 0%, rgba(255,200,50,0.15) 55%, transparent 75%)'
              : 'radial-gradient(circle, rgba(40,25,0,0.28) 0%, transparent 70%)',
            zIndex:       9998,
            pointerEvents:'none',
            animation:    'cordGlowBurst 0.95s ease-out forwards',
          }}
        />
      )}

      {/* "pull me" hint — only shown until first pull, fades automatically */}
      {!everPulled && (
        <div
          aria-hidden="true"
          className="lamp-cord-hint"
          style={{ top: `${CANVAS_H + 4}px`, right: '52px', left: 'auto', transform: 'none' }}
        >
          pull ↑
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{
          position:      'fixed',
          top:           0,
          right:         '48px',
          width:         `${CANVAS_W}px`,
          height:        `${CANVAS_H}px`,
          zIndex:        9999,
          pointerEvents: 'auto',
          touchAction:   'none',
          cursor:        'default',
        }}
        aria-label="Lamp cord — pull down to toggle dark / light mode"
        role="button"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => { hoverRef.current = false }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggle()
            setEverPulled(true)
            try { localStorage.setItem('bb-cord-pulled', '1') } catch {}
            e.preventDefault()
          }
        }}
      />
    </>
  )
}

/* ─── Canvas draw ────────────────────────────────────────────── */
function drawRope(ctx, points, isDark, isHover) {
  if (!points || points.length < 2) return

  /* colour palette adapts to theme */
  const cordMain  = isDark ? '#b09870' : '#6b5030'
  const cordShade = isDark ? '#7a6448' : '#3d2a12'
  const cordHi    = isDark ? 'rgba(255,245,200,0.22)' : 'rgba(255,255,255,0.28)'
  const inkColor  = isDark ? '#d4b87a' : '#2a1a08'
  const tipFill   = isDark ? '#ffe890' : '#1c1005'
  const tipStroke = isDark ? '#c8a050' : '#3a2008'

  /* ── draw ceiling mount / cap ── */
  const ax = points[0].x
  const ay = points[0].y
  // outer cap
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(ax - 14, 0, 28, 20, [0, 0, 8, 8])
  ctx.fillStyle   = isDark ? '#2a2018' : '#e0d5c0'
  ctx.strokeStyle = isDark ? '#8a7450' : '#3a2a10'
  ctx.lineWidth   = 2
  ctx.fill()
  ctx.stroke()
  // bolt dots on cap
  ctx.fillStyle = isDark ? '#6a5838' : '#8a7050'
  ctx.beginPath(); ctx.arc(ax - 6, 10, 2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(ax + 6, 10, 2, 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  /* ── rope shadow (offset) ── */
  ctx.save()
  ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.12)'
  ctx.lineWidth   = 7
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0].x + 2, points[0].y + 2)
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2 + 2
    const my = (points[i].y + points[i + 1].y) / 2 + 2
    ctx.quadraticCurveTo(points[i].x + 2, points[i].y + 2, mx, my)
  }
  ctx.lineTo(points[points.length - 1].x + 2, points[points.length - 1].y + 2)
  ctx.stroke()
  ctx.restore()

  /* ── main rope body ── */
  ctx.save()
  ctx.strokeStyle = cordMain
  ctx.lineWidth   = 5
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2
    const my = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my)
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
  ctx.stroke()
  ctx.restore()

  /* ── rope edge shading (darker side stripe) ── */
  ctx.save()
  ctx.strokeStyle = cordShade
  ctx.lineWidth   = 2
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.globalAlpha = 0.55
  ctx.beginPath()
  ctx.moveTo(points[0].x + 2, points[0].y)
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2 + 2
    const my = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x + 2, points[i].y, mx, my)
  }
  ctx.lineTo(points[points.length - 1].x + 2, points[points.length - 1].y)
  ctx.stroke()
  ctx.restore()

  /* ── rope highlight (bright left edge) ── */
  ctx.save()
  ctx.strokeStyle = cordHi
  ctx.lineWidth   = 1.5
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0].x - 1.5, points[0].y)
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2 - 1.5
    const my = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x - 1.5, points[i].y, mx, my)
  }
  ctx.lineTo(points[points.length - 1].x - 1.5, points[points.length - 1].y)
  ctx.stroke()
  ctx.restore()

  /* ── rope twist stripes ── */
  ctx.save()
  ctx.strokeStyle = isDark ? 'rgba(255,230,140,0.09)' : 'rgba(200,160,80,0.2)'
  ctx.lineWidth   = 1.8
  ctx.setLineDash([5, 9])
  ctx.lineDashOffset = 3
  ctx.lineCap     = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2
    const my = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my)
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
  ctx.stroke()
  ctx.restore()

  /* ── pull knob / handle ── */
  const tip = points[points.length - 1]

  // hover glow halo
  if (isHover) {
    ctx.save()
    const halo = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 28)
    halo.addColorStop(0, isDark ? 'rgba(255,230,80,0.45)' : 'rgba(120,80,20,0.22)')
    halo.addColorStop(1, 'transparent')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(tip.x, tip.y, 28, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // knob glow (always subtle)
  ctx.save()
  const grd = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 18)
  grd.addColorStop(0, isDark ? 'rgba(255,215,60,0.3)' : 'rgba(90,55,10,0.12)')
  grd.addColorStop(1, 'transparent')
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.arc(tip.x, tip.y, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // knob body (slightly elongated pill shape)
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(tip.x, tip.y, 11, 13, 0, 0, Math.PI * 2)
  ctx.fillStyle   = tipFill
  ctx.strokeStyle = tipStroke
  ctx.lineWidth   = 2.5
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  // knob vertical ribbing
  for (let r = -2; r <= 2; r += 2) {
    ctx.save()
    ctx.strokeStyle = isDark ? 'rgba(180,130,30,0.5)' : 'rgba(255,255,255,0.3)'
    ctx.lineWidth   = 0.8
    ctx.beginPath()
    ctx.moveTo(tip.x + r, tip.y - 9)
    ctx.lineTo(tip.x + r, tip.y + 9)
    ctx.stroke()
    ctx.restore()
  }

  // knob highlight
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(tip.x - 3, tip.y - 4, 3.5, 4.5, -0.4, 0, Math.PI * 2)
  ctx.fillStyle = isDark ? 'rgba(255,255,220,0.55)' : 'rgba(255,255,255,0.5)'
  ctx.fill()
  ctx.restore()

  // knob notch (hook groove at top)
  ctx.save()
  ctx.strokeStyle = tipStroke
  ctx.lineWidth   = 1.5
  ctx.beginPath()
  ctx.arc(tip.x, tip.y - 13, 4.5, Math.PI, 0)
  ctx.stroke()
  ctx.restore()
}
