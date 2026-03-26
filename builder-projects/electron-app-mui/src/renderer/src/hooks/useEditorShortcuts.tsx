import { useEffect, useRef } from 'react'

// ── useEditorShortcuts ────────────────────────────────────────────────────────
/**
 * Registers Ctrl+N / Ctrl+Shift+N / Ctrl+Shift+Alt+N keyboard shortcuts.
 * onTier(1) = Ctrl+N (smallest unit)
 * onTier(2) = Ctrl+Shift+N (mid unit)
 * onTier(3) = Ctrl+Shift+Alt+N (highest unit)
 */

export function useEditorShortcuts(onTier: (tier: 1 | 2 | 3) => void): void {
  const cbRef = useRef(onTier)

  useEffect(() => {
    cbRef.current = onTier
  }, [onTier])

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey
      if (!ctrl || e.key.toLowerCase() !== 'n') return
      // Skip if focus is inside a text input/textarea to avoid hijacking typing
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault()
      if (e.shiftKey && e.altKey) cbRef.current(3)
      else if (e.shiftKey) cbRef.current(2)
      else cbRef.current(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
