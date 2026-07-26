import { describe, expect, it } from "vitest"

import {
  clamp,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  progress,
} from "@/video/animation"

describe("animation helpers", () => {
  it("clamps progress to the requested interval", () => {
    expect(clamp(-1)).toBe(0)
    expect(clamp(0.4)).toBe(0.4)
    expect(clamp(2)).toBe(1)
  })

  it("maps a time range to normalized progress", () => {
    expect(progress(1, 1, 2)).toBe(0)
    expect(progress(2, 1, 2)).toBe(0.5)
    expect(progress(4, 1, 2)).toBe(1)
  })

  it("keeps easing endpoints stable", () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeOutBack(0)).toBeCloseTo(0)
    expect(easeOutBack(1)).toBe(1)
  })
})
