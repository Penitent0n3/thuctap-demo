import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { TransformComponent, TransformWrapper, useTransformComponent } from 'react-zoom-pan-pinch'
import { LabelledDiagramPoint } from '../../../types'

interface ImageViewerProps {
  imagePath: string
  projectDir: string
  points: LabelledDiagramPoint[]
  selectedPointId: string | null
  onImageDoubleClick: (xPercent: number, yPercent: number) => void
  onPointDrag: (id: string, xPercent: number, yPercent: number) => void
  getPointColor: (index: number) => { bg: string; text: string }
  onAddPointAtCenter: (xPercent: number, yPercent: number) => void
  onShowWarning: (message: string | null) => void
  onSelectPoint: (id: string) => void
}

interface DraggablePointProps {
  point: LabelledDiagramPoint
  index: number
  isSelected: boolean
  getPointColor: (index: number) => { bg: string; text: string }
  onDragEnd: (id: string, xPercent: number, yPercent: number) => void
  onSelect: (id: string) => void
  /** Transform state from the library — provided by the overlay parent */
  transformState: {
    positionX: number
    positionY: number
    contentRenderedWidth: number
    contentRenderedHeight: number
  }
}

/** Extract solid rgb(r, g, b) from an rgba(...) color string */
function solidColor(rgba: string): string {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  return m ? `rgb(${m[1]}, ${m[2]}, ${m[3]})` : rgba
}

/** Compute the overlay (wrapper-relative) pixel position for a point */
function computePointPosition(
  xPercent: number,
  yPercent: number,
  positionX: number,
  positionY: number,
  contentRenderedWidth: number,
  contentRenderedHeight: number
): { x: number; y: number } {
  return {
    x: positionX + (xPercent / 100) * contentRenderedWidth,
    y: positionY + (yPercent / 100) * contentRenderedHeight
  }
}

const BADGE_SIZE = 32
const HALF_BADGE = BADGE_SIZE / 2 // 16

function DraggablePoint({
  point,
  index,
  isSelected,
  getPointColor,
  onDragEnd,
  onSelect,
  transformState
}: DraggablePointProps): React.ReactElement {
  const pointRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: point.xPercent, y: point.yPercent })
  const pointColor = getPointColor(index)
  const ringColor = solidColor(pointColor.bg)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onSelect(point.id)
      setIsDragging(true)
      setShowTooltip(false)
      setDragPosition({ x: point.xPercent, y: point.yPercent })
    },
    [point.id, point.xPercent, point.yPercent, onSelect]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      const content = pointRef.current?.closest('.react-transform-component')
      if (!content) return

      const contentRect = content.getBoundingClientRect()
      const newPercentX = Math.max(
        0,
        Math.min(100, ((e.clientX - contentRect.left) / contentRect.width) * 100)
      )
      const newPercentY = Math.max(
        0,
        Math.min(100, ((e.clientY - contentRect.top) / contentRect.height) * 100)
      )
      setDragPosition({ x: newPercentX, y: newPercentY })
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      setIsDragging(false)
      onDragEnd(point.id, dragPosition.x, dragPosition.y)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: false })
    window.addEventListener('mouseup', handleMouseUp, { passive: false })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, point.id, dragPosition.x, dragPosition.y, onDragEnd])

  const displayX = isDragging ? dragPosition.x : point.xPercent
  const displayY = isDragging ? dragPosition.y : point.yPercent

  const { x: badgeX, y: badgeY } = computePointPosition(
    displayX,
    displayY,
    transformState.positionX,
    transformState.positionY,
    transformState.contentRenderedWidth,
    transformState.contentRenderedHeight
  )

  return (
    <div
      ref={pointRef}
      style={{
        position: 'absolute',
        left: badgeX,
        top: badgeY,
        width: 0,
        height: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging || isSelected ? 1000 : 100
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => {
        if (!isDragging) {
          setShowTooltip(true)
          setIsHovered(true)
        }
      }}
      onMouseLeave={() => {
        setShowTooltip(false)
        setIsHovered(false)
      }}
    >
      {/* ── Pulsing Ring (selected point) ───────────────────────────── */}
      {isSelected && (
        <motion.div
          style={{
            position: 'absolute',
            borderRadius: '50%',
            border: `3px solid ${ringColor}`,
            pointerEvents: 'none',
            // Start at BADGE_SIZE centered on anchor
            width: BADGE_SIZE,
            height: BADGE_SIZE,
            left: -HALF_BADGE,
            top: -HALF_BADGE
          }}
          animate={{
            width: [BADGE_SIZE, BADGE_SIZE, BADGE_SIZE + 24],
            height: [BADGE_SIZE, BADGE_SIZE, BADGE_SIZE + 24],
            left: [-HALF_BADGE, -HALF_BADGE, -(HALF_BADGE + 12)],
            top: [-HALF_BADGE, -HALF_BADGE, -(HALF_BADGE + 12)],
            opacity: [0, 0.9, 0]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      )}

      {/* ── Point Badge ─────────────────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute',
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          left: -HALF_BADGE,
          top: -HALF_BADGE,
          borderRadius: '50%',
          background: pointColor.bg,
          color: pointColor.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          boxShadow:
            isDragging || isSelected
              ? '0 0 0 3px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.4)'
              : '0 2px 6px rgba(0,0,0,0.4)',
          border: isSelected ? '2px solid #fff' : '2px solid rgba(255,255,255,0.3)',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        animate={isHovered && !isDragging ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{
          duration: 0.8,
          repeat: isHovered && !isDragging ? Infinity : 0,
          ease: 'easeInOut'
        }}
      >
        {index + 1}
      </motion.div>

      {/* ── Tooltip on hover ────────────────────────────────────────── */}
      {showTooltip && point.text && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: HALF_BADGE + 4,
            transform: 'translateX(-50%)',
            display: 'inline-block',
            maxWidth: 200,
            px: 1.5,
            py: 0.75,
            bgcolor: 'rgba(0,0,0,0.85)',
            color: '#fff',
            borderRadius: 1,
            fontSize: '0.8rem',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          {point.text}
        </Box>
      )}
    </div>
  )
}

/**
 * Points overlay rendered as a sibling of TransformComponent inside
 * TransformWrapper. This means badges are NOT subject to the content's
 * CSS transform — they render at true screen-pixel size and position.
 */
function PointsOverlay({
  points,
  selectedPointId,
  onSelectPoint,
  onPointDrag,
  getPointColor
}: {
  points: LabelledDiagramPoint[]
  selectedPointId: string | null
  onSelectPoint: (id: string) => void
  onPointDrag: (id: string, xPercent: number, yPercent: number) => void
  getPointColor: (index: number) => { bg: string; text: string }
}): React.ReactElement | null {
  // Subscribe to every transform change — causes re-render on zoom/pan
  const transformData = useTransformComponent(({ instance }) => {
    const content = instance.contentComponent
    const { scale, positionX, positionY } = instance.transformState

    let contentRenderedWidth = 0
    let contentRenderedHeight = 0
    if (content && scale > 0) {
      try {
        const rect = content.getBoundingClientRect()
        contentRenderedWidth = rect.width
        contentRenderedHeight = rect.height
      } catch {
        // content not in DOM yet
      }
    }

    return { positionX, positionY, contentRenderedWidth, contentRenderedHeight }
  })

  // Don't render until we have valid dimensions
  if (transformData.contentRenderedWidth === 0 || transformData.contentRenderedHeight === 0) {
    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    >
      {points.map((point, pointIndex) => (
        <DraggablePoint
          key={point.id}
          point={point}
          index={pointIndex}
          isSelected={point.id === selectedPointId}
          getPointColor={getPointColor}
          onDragEnd={onPointDrag}
          onSelect={onSelectPoint}
          transformState={transformData}
        />
      ))}
    </div>
  )
}

export function ImageViewer({
  imagePath,
  projectDir,
  points,
  selectedPointId,
  onImageDoubleClick,
  onPointDrag,
  getPointColor,
  onAddPointAtCenter,
  onShowWarning,
  onSelectPoint
}: ImageViewerProps): React.ReactElement {
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    const loadUrl = async () => {
      try {
        const url = await window.electronAPI.resolveAssetUrl(projectDir, imagePath)
        if (mounted) setImageUrl(url)
      } catch {
        /* ignore */
      }
    }
    loadUrl()
    return () => {
      mounted = false
    }
  }, [projectDir, imagePath])

  const handleImageDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.draggable-point')) return

      const wrapper = e.currentTarget.closest('.react-transform-wrapper')
      if (!wrapper) return
      const content = wrapper.querySelector('.react-transform-component')
      if (!content) return

      const contentRect = content.getBoundingClientRect()
      const xPercent = Math.max(
        0,
        Math.min(100, ((e.clientX - contentRect.left) / contentRect.width) * 100)
      )
      const yPercent = Math.max(
        0,
        Math.min(100, ((e.clientY - contentRect.top) / contentRect.height) * 100)
      )
      onImageDoubleClick(xPercent, yPercent)
    },
    [onImageDoubleClick]
  )

  const handleAddPointAtCenter = useCallback(() => {
    if (!transformComponentRef.current || !wrapperRef.current) {
      onShowWarning('Cannot determine view center')
      return
    }

    const wrapper = wrapperRef.current
    const content = wrapper.querySelector('.react-transform-component')
    if (!content) {
      onShowWarning('Cannot determine view center')
      return
    }

    const wrapperRect = wrapper.getBoundingClientRect()
    const contentRect = content.getBoundingClientRect()

    const relativeX =
      (wrapperRect.left + wrapperRect.width / 2 - contentRect.left) / contentRect.width
    const relativeY =
      (wrapperRect.top + wrapperRect.height / 2 - contentRect.top) / contentRect.height

    if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
      onShowWarning(
        'The center of the view is outside the image. Zoom or pan to show the image center.'
      )
      return
    }

    onAddPointAtCenter(relativeX * 100, relativeY * 100)
  }, [onAddPointAtCenter, onShowWarning])

  useEffect(() => {
    const handleCustomEvent = () => handleAddPointAtCenter()
    window.addEventListener('labelled-diagram-add-point-center', handleCustomEvent)
    return () => window.removeEventListener('labelled-diagram-add-point-center', handleCustomEvent)
  }, [handleAddPointAtCenter])

  return (
    <TransformWrapper
      ref={transformComponentRef}
      initialScale={1}
      minScale={1}
      maxScale={5}
      centerOnInit
      limitToBounds={true}
      doubleClick={{ disabled: true }}
      panning={{
        disabled: false,
        velocityDisabled: true,
        allowLeftClickPan: true,
        allowRightClickPan: false,
        allowMiddleClickPan: false
      }}
      wheel={{ step: 0.2, disabled: false }}
    >
      <TransformComponent
        wrapperStyle={{ width: '100%', height: '100%', cursor: 'default' }}
        wrapperClass="image-viewer-wrapper"
        contentClass="image-viewer-content"
      >
        <div
          ref={wrapperRef}
          style={{ position: 'relative', display: 'inline-block' }}
          onDoubleClick={handleImageDoubleClick}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Diagram"
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                userSelect: 'none',
                pointerEvents: 'auto'
              }}
            />
          )}
        </div>
      </TransformComponent>

      {/* Points rendered OUTSIDE the transform, as a sibling */}
      <PointsOverlay
        points={points}
        selectedPointId={selectedPointId}
        onSelectPoint={onSelectPoint}
        onPointDrag={onPointDrag}
        getPointColor={getPointColor}
      />
    </TransformWrapper>
  )
}
