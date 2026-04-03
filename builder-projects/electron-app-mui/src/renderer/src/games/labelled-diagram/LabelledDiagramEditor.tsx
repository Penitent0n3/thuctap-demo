import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'
import { JSX, MouseEvent, useCallback, useRef, useState } from 'react'
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import ImagePicker from '../../components/ImagePicker'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import { LabelledDiagramAppData, LabelledDiagramPoint } from '../../types'

interface Props {
  appData: LabelledDiagramAppData
  projectDir: string
  onChange: (data: LabelledDiagramAppData) => void
}

const BADGE_COLORS = [
  '#f44336', // Red
  '#4caf50', // Green
  '#2196f3', // Blue
  '#ffeb3b', // Yellow
  '#9c27b0', // Purple
  '#ff9800', // Orange
  '#00bcd4', // Cyan
  '#e91e63', // Pink
  '#795548', // Brown
  '#607d8b' // Blue Grey
]

export default function LabelledDiagramEditor({
  appData,
  projectDir,
  onChange
}: Props): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [transform, setTransform] = useState({ scale: 1, positionX: 0, positionY: 0 })
  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { points, imagePath } = appData

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getBadgeColor = (index: number) => {
    return BADGE_COLORS[index % BADGE_COLORS.length]
  }

  const addPoint = useCallback(
    (xPercent: number, yPercent: number) => {
      const id = `point-${Date.now()}`
      const newPoint: LabelledDiagramPoint = {
        id,
        text: `Point ${appData._pointCounter + 1}`,
        xPercent,
        yPercent
      }
      onChange({
        ...appData,
        points: [...points, newPoint],
        _pointCounter: appData._pointCounter + 1
      })
    },
    [appData, points, onChange]
  )

  const updatePoint = useCallback(
    (id: string, patch: Partial<LabelledDiagramPoint>) => {
      onChange({
        ...appData,
        points: points.map((p) => (p.id === id ? { ...p, ...patch } : p))
      })
    },
    [appData, points, onChange]
  )

  const deletePoint = useCallback(
    (id: string) => {
      onChange({
        ...appData,
        points: points.filter((p) => p.id !== id)
      })
    },
    [appData, points, onChange]
  )

  const moveToPoint = useCallback((point: LabelledDiagramPoint) => {
    if (!transformRef.current || !imgRef.current) return

    const { scale } = transformRef.current.instance.transformState
    const imgWidth = imgRef.current.offsetWidth
    const imgHeight = imgRef.current.offsetHeight

    const targetX = (point.xPercent / 100) * imgWidth
    const targetY = (point.yPercent / 100) * imgHeight

    // We want to center the point.
    // Wrapper size:
    const wrapperWidth = wrapperRef.current?.offsetWidth ?? 0
    const wrapperHeight = wrapperRef.current?.offsetHeight ?? 0

    const posX = wrapperWidth / 2 - targetX * scale
    const posY = wrapperHeight / 2 - targetY * scale

    transformRef.current.setTransform(posX, posY, scale)
  }, [])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEntityCreateShortcut({
    onTier1: () => addPoint(50, 50)
  })

  // ── Image Interaction ──────────────────────────────────────────────────────

  const handleImageClick = (e: MouseEvent) => {
    if (!imgRef.current || !wrapperRef.current) return

    // Get click position relative to the wrapper
    const rect = wrapperRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const { scale, positionX, positionY } = transform

    // Convert to image coordinates
    const imgLocalX = (clickX - positionX) / scale
    const imgLocalY = (clickY - positionY) / scale

    const imgWidth = imgRef.current.offsetWidth
    const imgHeight = imgRef.current.offsetHeight

    if (imgWidth === 0 || imgHeight === 0) return

    const xPercent = (imgLocalX / imgWidth) * 100
    const yPercent = (imgLocalY / imgHeight) * 100

    // Clamp to 0-100
    if (xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
      addPoint(xPercent, yPercent)
    }
  }

  // ── Rendering Badges ───────────────────────────────────────────────────────

  const renderBadges = () => {
    if (!imgRef.current || !transform) return null

    const { scale, positionX, positionY } = transform
    const imgWidth = imgRef.current.offsetWidth
    const imgHeight = imgRef.current.offsetHeight

    return points.map((p, index) => {
      const left = (p.xPercent / 100) * imgWidth * scale + positionX
      const top = (p.yPercent / 100) * imgHeight * scale + positionY

      return (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            left,
            top,
            transform: 'translate(-50%, -50%)',
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: getBadgeColor(index),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            border: '2px solid white',
            pointerEvents: 'none', // Allow clicks to pass through to image for moving
            zIndex: 10,
            transition: 'left 0.1s ease-out, top 0.1s ease-out' // Smooth follow
          }}
        >
          {index + 1}
        </Box>
      )
    })
  }

  const { data: imageUrl } = useAssetUrl(projectDir, imagePath)

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* ── Left Sidebar ── */}
      <Box
        sx={{
          width: sidebarCollapsed ? 60 : 300,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          background: '#13161f',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 20
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && (
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Points
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            sx={{ ml: 'auto' }}
          >
            {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        {!sidebarCollapsed && (
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {points.map((p, index) => (
              <Paper
                key={p.id}
                elevation={0}
                onClick={(e) => {
                  // Only move if not clicking inside an input or delete button
                  if (
                    (e.target as HTMLElement).tagName !== 'INPUT' &&
                    !(e.target as HTMLElement).closest('button')
                  ) {
                    moveToPoint(p)
                  }
                }}
                sx={{
                  p: 1.5,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: getBadgeColor(index),
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}
                  >
                    {index + 1}
                  </Box>
                  <TextField
                    size="small"
                    variant="standard"
                    value={p.text}
                    onChange={(e) => updatePoint(p.id, { text: e.target.value })}
                    fullWidth
                    placeholder="Enter point label..."
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontSize: '0.875rem' }
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deletePoint(p.id)}
                    sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="caption" color="text.disabled">
                    X: {p.xPercent.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Y: {p.yPercent.toFixed(1)}%
                  </Typography>
                </Box>
              </Paper>
            ))}

            {points.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
                <Typography variant="body2">No points added yet.</Typography>
                <Typography variant="caption">Click on the image to add a point.</Typography>
              </Box>
            )}

            <Button
              variant="outlined"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => addPoint(50, 50)}
              sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary', mt: 1 }}
            >
              Add Center Point
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Main Viewport ── */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#1a1d26' }}>
        {!imagePath ? (
          <Box
            sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Box sx={{ width: 400, p: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Add Background Image
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Upload an image to start labelling your diagram. Use high-quality diagrams for
                better results.
              </Typography>
              <ImagePicker
                label="Select Diagram Image"
                value={imagePath}
                projectDir={projectDir}
                desiredNamePrefix="diagram"
                onChange={(path) => onChange({ ...appData, imagePath: path })}
              />
            </Box>
          </Box>
        ) : (
          <>
            <Box
              ref={wrapperRef}
              sx={{ width: '100%', height: '100%', position: 'relative' }}
              onDoubleClick={handleImageClick}
            >
              <TransformWrapper
                ref={transformRef}
                initialScale={1}
                minScale={0.1}
                maxScale={10}
                centerOnInit
                onTransformed={(ref) => setTransform(ref.state)}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    {/* Controls overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 24,
                        right: 24,
                        zIndex: 30,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(8px)',
                        p: 0.5,
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <Tooltip title="Zoom In" placement="left">
                        <IconButton size="small" onClick={() => zoomIn()}>
                          <ZoomInIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Zoom Out" placement="left">
                        <IconButton size="small" onClick={() => zoomOut()}>
                          <ZoomOutIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset View" placement="left">
                        <IconButton size="small" onClick={() => resetTransform()}>
                          <RestartAltIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <TransformComponent
                      wrapperStyle={{
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <img
                        ref={imgRef}
                        src={imageUrl}
                        alt="Diagram"
                        style={{
                          pointerEvents: 'auto',
                          userSelect: 'none',
                          maxWidth: 'none' // Allow it to be its natural size
                        }}
                        onLoad={() => {
                          // Initial sync of transform data
                          if (transformRef.current) {
                            setTransform(transformRef.current.state)
                          }
                        }}
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>

              {/* Badges layer - rendered outside TransformComponent but inside wrapper */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  overflow: 'hidden'
                }}
              >
                {renderBadges()}
              </Box>
            </Box>

            {/* Top Toolbar */}
            <Box
              sx={{
                position: 'absolute',
                top: 24,
                left: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                px: 2,
                py: 1,
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 30
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {points.length} Points Added
              </Typography>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
              <Typography variant="caption" color="text.secondary">
                Double click or Use Ctrl+N to add points. Drag to move. Scroll to zoom.
              </Typography>
              <IconButton
                size="small"
                onClick={() => onChange({ ...appData, imagePath: null })}
                color="inherit"
                sx={{ ml: 1, opacity: 0.7, '&:hover': { opacity: 1 } }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
