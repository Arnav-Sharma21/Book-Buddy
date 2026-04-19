import { useEffect, useRef } from 'react'
import rough from 'roughjs'
import { motion } from 'framer-motion'

const VARIANTS = {
  default:  { stroke: '#1a1a1a', fill: 'none',     color: '#1a1a1a', shadow: '#1a1a1a' },
  primary:  { stroke: '#1a1a1a', fill: '#1a1a1a',  color: '#f8f5ee', shadow: '#555'    },
  danger:   { stroke: '#1a1a1a', fill: 'none',     color: '#1a1a1a', shadow: '#1a1a1a' },
  ghost:    { stroke: '#6b6b6b', fill: 'none',     color: '#6b6b6b', shadow: 'none'    },
}

export default function SketchButton({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  className = '',
  disabled = false,
}) {
  const btnRef   = useRef(null)
  const svgRef   = useRef(null)
  const cfg = VARIANTS[variant] || VARIANTS.default

  useEffect(() => {
    const btn = btnRef.current
    const svg = svgRef.current
    if (!btn || !svg) return

    const draw = () => {
      const { width, height } = btn.getBoundingClientRect()
      if (!width) return
      svg.setAttribute('width', width)
      svg.setAttribute('height', height)
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const rc = rough.svg(svg)
      const rect = rc.rectangle(2, 2, width - 4, height - 4, {
        roughness: 1.0,
        strokeWidth: 1.8,
        stroke: cfg.stroke,
        fill: cfg.fill,
        fillStyle: 'solid',
        bowing: 0.9,
      })
      svg.appendChild(rect)
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(btn)
    return () => ro.disconnect()
  }, [variant])

  return (
    <motion.button
      ref={btnRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { x: -2, y: -2 } : {}}
      whileTap={!disabled   ? { x: 1.5, y: 1.5 } : {}}
      className={`relative inline-flex items-center gap-2 px-5 py-2 cursor-pointer select-none bg-transparent
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
      style={{
        color: cfg.color,
        fontFamily: 'var(--font-sketch)',
        fontSize: '1.05rem',
        boxShadow: cfg.shadow !== 'none' ? `3px 3px 0 ${cfg.shadow}` : 'none',
        transition: 'box-shadow 0.1s',
      }}
    >
      <svg
        ref={svgRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          pointerEvents: 'none', overflow: 'visible',
        }}
        aria-hidden="true"
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </motion.button>
  )
}