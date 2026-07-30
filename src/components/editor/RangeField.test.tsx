// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { RangeField } from "@/components/editor/RangeField"

describe("RangeField", () => {
  it("emits numeric slider values", () => {
    const onChange = vi.fn<(value: number) => void>()

    render(
      <RangeField
        id="size"
        label="Size"
        valueLabel="100%"
        value={1}
        minimum={0.7}
        maximum={1.2}
        step={0.05}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("slider", { name: "Size" }), {
      target: { value: "1.2" },
    })

    expect(onChange).toHaveBeenCalledWith(1.2)
  })
})
