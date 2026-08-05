// @vitest-environment happy-dom

import { cleanup, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

function pressKey(key: string, target: EventTarget, meta = false) {
  target.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: key === "Space" ? " " : key,
      code: key === "Space" ? "Space" : `Digit${key}`,
      metaKey: meta,
      bubbles: true,
    })
  )
}

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})

describe("useKeyboardShortcuts", () => {
  it("runs the handler for a plain key pressed outside any control", () => {
    const openPanel = vi.fn<() => void>()
    renderHook(() => useKeyboardShortcuts({ "3": openPanel }))

    pressKey("3", document.body)

    expect(openPanel).toHaveBeenCalledOnce()
  })

  it("leaves Space to a focused button but still switches panels", () => {
    const play = vi.fn<() => void>()
    const openPanel = vi.fn<() => void>()
    renderHook(() => useKeyboardShortcuts({ Space: play, "3": openPanel }))
    const button = document.createElement("button")
    document.body.append(button)

    pressKey("Space", button)
    pressKey("3", button)

    expect(play).not.toHaveBeenCalled()
    expect(openPanel).toHaveBeenCalledOnce()
  })

  it("keeps plain keys inside fields but allows modifier combos", () => {
    const openPanel = vi.fn<() => void>()
    const exportVideo = vi.fn<() => void>()
    renderHook(() =>
      useKeyboardShortcuts({ "3": openPanel, "mod+Enter": exportVideo })
    )
    const input = document.createElement("input")
    document.body.append(input)

    pressKey("3", input)
    pressKey("Enter", input, true)

    expect(openPanel).not.toHaveBeenCalled()
    expect(exportVideo).toHaveBeenCalledOnce()
  })
})
