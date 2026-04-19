/**
 * LampCord — physics-simulated hanging cord that toggles dark/light mode.
 *
 * Physics: Verlet integration with constraint relaxation.
 * Canvas is pointer-events:none; all events are on window so the rope
 * never blocks page interaction.
 */
import { useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../../context/ThemeContext'

// ── Constants ──────────────────────────────────────────────────────────
const NODES         = 22
const ROPE_PX       = 190
const SEG_LEN       = ROPE_PX / NODES
const GRAVITY       = 0.36
const DAMPING       = 0.984
const ITERATIONS    = 20
const CURSOR_RADIUS = 70
const CURSOR_FORCE  = 3.6
const PULL_THRESHOLD = 85   // px to pull before triggering toggle
const HANDLE_R      = 13

export default function LampCord() {
  const { dark, toggle } = useTheme()

  const canvasRef  = useRef(null)
  const nodesRef   = useRef([])
  const dragRef    = useRef(null)   // { active, startY, cx, cy }
  const pullFlash  = useRef(0)
  const rafRef     = useRef(null)
  const mouseRef   = useRef({ x: -999, y: -999 })
  const darkRef    = useRef(dark)
  darkRef.current  = dark

  // ── Init rope nodes ────────────────────────────────────────────────
  const initNodes = useCallback((ax, ay) => {
    nodesRef.current = Array.from({ length: NODES + 1 }, (_, i) => ({
      x: ax, y: ay + i * SEG_LEN,
      px: ax, py: ay + i * SEG_LEN,
      locked: i === 0,
    }))
    nodesRef.current._hint = 160
  }, [])

  // ── Physics step ──────────────────────────────────────────────────
  const step = useCallback(() => {
    const ns = nodesRef.current
    const { x: mx, y: my } = mouseRef.current
    const drag = dragRef.current

    // Integrate
    for (let i = 1; i < ns.length; i++) {
      const n = ns[i]
      const vx = (n.x - n.px) * DAMPING
      const vy = (n.y - n.py) * DAMPING
      n.px = n.x; n.py = n.y
      n.x += vx; n.y += vy + GRAVITY

      // Cursor repulsion (not while dragging)
      if (!drag?.active) {
        const dx = n.x - mx, dy = n.y - my
        const d = Math.hypot(dx, dy)
        if (d < CURSOR_RADIUS && d > 0.01) {
          const f = (CURSOR_RADIUS - d) / CURSOR_RADIUS * CURSOR_FORCE
          n.x += (dx / d) * f; n.y += (dy / d) * f
        }
      }
    }

    // Pin dragged handle
    if (drag?.active) {
      const hn = ns[ns.length - 1]
      hn.x = drag.cx; hn.y = drag.cy
      hn.px = drag.cx; hn.py = drag.cy
    }

    // Constraint relaxation
    for (let it = 0; it < ITERATIONS; it++) {
      for (let i = 0; i < ns.length - 1; i++) {
        const a = ns[i], b = ns[i + 1]
        const dx = b.x - a.x, dy = b.y - a.y
        const d = Math.hypot(dx, dy) || 0.0001
        const diff = (d - SEG_LEN) / d * 0.5
        const isDragHandle = drag?.active && i + 1 === ns.length - 1
        if (!a.locked) { a.x += dx * diff; a.y += dy * diff }
        if (!isDragHandle) { b.x -= dx * diff; b.y -= dy * diff }
      }
    }
  }, [])

  // ── Draw ──────────────────────────────────────────────────────────
  const draw = useCallback((ctx, W, H) => {
    ctx.clearRect(0, 0, W, H)
    const ns     = nodesRef.current
    const isDark = darkRef.current
    const flash  = pullFlash.current > 0
    if (ns.length < 2) return

    const ropeColor    = isDark ? 'rgba(210,195,155,0.88)' : 'rgba(55,40,18,0.78)'
    const handleColor  = flash
      ? (isDark ? '#fff8cc' : '#ffd966')
      : (isDark ? '#e0c97a' : '#a87e38')
    const handleStroke = isDark ? '#f0e0a8' : '#7a5520'
    const glowColor    = isDark ? 'rgba(255,220,100,0.6)' : 'rgba(255,180,50,0.45)'

    // Flash glow pass
    if (flash) {
      ctx.save()
      ctx.shadowColor = glowColor; ctx.shadowBlur = 32
      ctx.strokeStyle = glowColor; ctx.lineWidth = 7
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(ns[0].x, ns[0].y)
      for (let i = 1; i < ns.length; i++) ctx.lineTo(ns[i].x, ns[i].y)
      ctx.stroke(); ctx.restore()
      pullFlash.current--
    }

    // Rope (smooth catmull-like using midpoints)
    ctx.save()
    ctx.strokeStyle = ropeColor; ctx.lineWidth = 3.8
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(ns[0].x, ns[0].y)
    for (let i = 0; i < ns.length - 1; i++) {
      const mx2 = (ns[i].x + ns[i + 1].x) / 2
      const my2 = (ns[i].y + ns[i + 1].y) / 2
      ctx.quadraticCurveTo(ns[i].x, ns[i].y, mx2, my2)
    }
    ctx.lineTo(ns[ns.length - 1].x, ns[ns.length - 1].y)
    ctx.stroke(); ctx.restore()

    // Cord texture — small knotted marks every few nodes
    ctx.save()
    ctx.strokeStyle = isDark ? 'rgba(160,140,100,0.45)' : 'rgba(35,22,8,0.25)'
    ctx.lineWidth = 5.5
    for (let i = 3; i < ns.length; i += 5) {
      ctx.beginPath()
      ctx.moveTo(ns[i].x - 2, ns[i].y)
      ctx.lineTo(ns[i].x + 2, ns[i].y)
      ctx.stroke()
    }
    ctx.restore()

    // Handle bulb
    const hn = ns[ns.length - 1]
    ctx.save()
    if (flash) { ctx.shadowColor = glowColor; ctx.shadowBlur = 24 }

    // Outer ring glow
    ctx.beginPath()
    ctx.arc(hn.x, hn.y, HANDLE_R + 4, 0, Math.PI * 2)
    ctx.strokeStyle = isDark ? 'rgba(255,220,80,0.2)' : 'rgba(180,130,50,0.18)'
    ctx.lineWidth = 5; ctx.stroke()

    // Main ball
    ctx.beginPath()
    ctx.arc(hn.x, hn.y, HANDLE_R, 0, Math.PI * 2)
    ctx.fillStyle = handleColor
    ctx.fill()
    ctx.strokeStyle = handleStroke
    ctx.lineWidth = 2.2; ctx.stroke()

    // Shine spot
    ctx.beginPath()
    ctx.arc(hn.x - 4, hn.y - 4, 4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.42)'
    ctx.fill()
    ctx.restore()

    // Tooltip hint
    if (ns._hint > 0) {
      const alpha = Math.min(1, ns._hint / 60) * (ns._hint > 30 ? 1 : ns._hint / 30)
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.font = `13px 'Patrick Hand', cursive`
      ctx.fillStyle = isDark ? 'rgba(230,210,165,0.9)' : 'rgba(70,50,20,0.75)'
      ctx.textAlign = 'left'
      ctx.fillText('↓ pull me!', hn.x + HANDLE_R + 8, hn.y + 5)
      ctx.restore()
      ns._hint--
    }
  }, [])

  // ── RAF loop ──────────────────────────────────────────────────────
  const loop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    step(); draw(ctx, canvas.width, canvas.height)
    rafRef.current = requestAnimationFrame(loop)
  }, [step, draw])

  // ── Setup canvas + resize ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      initNodes(window.innerWidth / 2, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [initNodes, loop])

  // ── Mouse / touch tracking ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
      if (dragRef.current?.active) {
        dragRef.current.cx = e.clientX - r.left
        dragRef.current.cy = e.clientY - r.top
      }

      // Cursor feedback near handle
      const ns = nodesRef.current
      if (!ns.length) return
      const hn = ns[ns.length - 1]
      const near = Math.hypot((e.clientX - r.left) - hn.x, (e.clientY - r.top) - hn.y) < HANDLE_R + 20
      document.body.style.cursor = near ? 'grab' : ''
    }

    const onTouchMove = (e) => {
      const t = e.touches[0]
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: t.clientX - r.left, y: t.clientY - r.top }
      if (dragRef.current?.active) {
        dragRef.current.cx = t.clientX - r.left
        dragRef.current.cy = t.clientY - r.top
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  // ── Click / drag ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onMouseDown = (e) => {
      const r  = canvas.getBoundingClientRect()
      const cx = e.clientX - r.left
      const cy = e.clientY - r.top
      const ns = nodesRef.current
      if (!ns.length) return
      const hn = ns[ns.length - 1]
      if (Math.hypot(cx - hn.x, cy - hn.y) < HANDLE_R + 18) {
        dragRef.current = { active: true, startY: cy, cx, cy }
        document.body.style.cursor = 'grabbing'
      }
    }

    const onTouchStart = (e) => {
      const t  = e.touches[0]
      const r  = canvas.getBoundingClientRect()
      const cx = t.clientX - r.left
      const cy = t.clientY - r.top
      const ns = nodesRef.current
      if (!ns.length) return
      const hn = ns[ns.length - 1]
      if (Math.hypot(cx - hn.x, cy - hn.y) < HANDLE_R + 24) {
        dragRef.current = { active: true, startY: cy, cx, cy }
      }
    }

    const onUp = (e) => {
      if (!dragRef.current?.active) return
      const { startY } = dragRef.current
      const r   = canvas.getBoundingClientRect()
      let cy
      if (e.changedTouches) {
        cy = e.changedTouches[0].clientY - r.top
      } else {
        cy = e.clientY - r.top
      }
      dragRef.current = null
      document.body.style.cursor = ''
      if (cy - startY >= PULL_THRESHOLD) {
        pullFlash.current = 40
        setTimeout(() => toggle(), 60)
      }
    }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend',   onUp)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend',   onUp)
    }
  }, [toggle])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
      aria-hidden="true"
    />
  )
}
