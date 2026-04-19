import { useEffect, useRef, useState } from 'react'
import rough from 'roughjs'

export default function RoughBox({
  children,
  roughness = 1.0,
  strokeWidth = 1.8,
  stroke = null,   // null = auto-read from CSS var(--color-ink)
  fill = 'none',
  fillStyle = 'solid',
  fillWeight = 1,
  className = '',
  style = {},
  as: Tag = 'div',
  padding = '1rem',
  shadow = true,
}) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setDims({
        w: Math.round(entry.contentRect.width),
        h: Math.round(entry.contentRect.height),
      })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || dims.w < 4) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    const rc = rough.svg(svg)
    // Resolve ink color from CSS variable if no explicit stroke provided
    const cssInk = getComputedStyle(document.documentElement).getPropertyValue('--color-ink').trim() || '#1a1a1a'
    const resolvedStroke = stroke ?? cssInk
    const shape = rc.rectangle(3, 3, dims.w - 6, dims.h - 6, {
      roughness,
      strokeWidth,
      stroke: resolvedStroke,
      fill,
      fillStyle,
      fillWeight,
      hachureAngle: -41,
      hachureGap: 7,
      bowing: 0.8,
    })
    svg.appendChild(shape)
  }, [dims, roughness, strokeWidth, stroke, fill, fillStyle, fillWeight])

  return (
    <Tag
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        padding,
        boxShadow: shadow && fill !== 'none' ? '4px 4px 0 var(--color-ink)' : 'none',
        ...style,
      }}
    >
      {/* SVG border — z-index 0, BEHIND content */}
      <svg
        ref={svgRef}
        width={dims.w || '100%'}
        height={dims.h || '100%'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,           /* ← behind children */
          pointerEvents: 'none',
          overflow: 'visible',
        }}
        aria-hidden="true"
      />
      {/* Content — always above SVG */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </Tag>
  )
}