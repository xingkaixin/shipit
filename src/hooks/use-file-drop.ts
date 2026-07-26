import * as React from "react"

/**
 * Native drag listeners rather than React handlers: drop targets are ordinary
 * containers, and attaching the events imperatively keeps them off the markup.
 */
export function useFileDrop<TElement extends HTMLElement>(
  onDrop: (file: File | null) => void
) {
  const zoneReference = React.useRef<TElement>(null)
  const [isDraggedOver, setIsDraggedOver] = React.useState(false)
  const onDropReference = React.useRef(onDrop)
  onDropReference.current = onDrop

  React.useEffect(() => {
    const zone = zoneReference.current
    if (!zone) {
      return undefined
    }

    const allowDrop = (event: DragEvent) => {
      event.preventDefault()
      setIsDraggedOver(true)
    }
    const leaveDrop = (event: DragEvent) => {
      if (!zone.contains(event.relatedTarget as Node | null)) {
        setIsDraggedOver(false)
      }
    }
    const acceptDrop = (event: DragEvent) => {
      event.preventDefault()
      setIsDraggedOver(false)
      onDropReference.current(event.dataTransfer?.files[0] ?? null)
    }

    zone.addEventListener("dragover", allowDrop)
    zone.addEventListener("dragleave", leaveDrop)
    zone.addEventListener("drop", acceptDrop)

    return () => {
      zone.removeEventListener("dragover", allowDrop)
      zone.removeEventListener("dragleave", leaveDrop)
      zone.removeEventListener("drop", acceptDrop)
    }
  }, [])

  return { zoneReference, isDraggedOver }
}
