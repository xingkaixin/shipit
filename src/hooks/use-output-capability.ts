import * as React from "react"

import type { OutputSettings } from "@/video/release-video"

export type OutputCapabilityState =
  | { status: "checking" }
  | { status: "supported"; storage: "memory" | "file" }
  | { status: "unsupported" }
  /** The probe itself failed, so nothing is known about this configuration. */
  | { status: "unknown" }

/**
 * Only positive evidence that the browser cannot encode the configuration
 * blocks an export. When the probe could not run, the export itself is the
 * better answer: it reports a typed error instead of refusing to start.
 */
export function isOutputExportable(state: OutputCapabilityState): boolean {
  return state.status === "supported" || state.status === "unknown"
}

export function useOutputCapability(
  output: OutputSettings
): OutputCapabilityState {
  const [state, setState] = React.useState<OutputCapabilityState>({
    status: "checking",
  })

  React.useEffect(() => {
    let isCurrentCheck = true
    setState({ status: "checking" })

    void checkOutputCapability(output).then((nextState) => {
      if (isCurrentCheck) {
        setState(nextState)
      }
    })

    return () => {
      isCurrentCheck = false
    }
  }, [output])

  return state
}

async function checkOutputCapability(
  output: OutputSettings
): Promise<OutputCapabilityState> {
  try {
    const { canEncodeOutput } = await import("@/video/video-encoding-support")
    const isSupported = await canEncodeOutput(output)
    if (!isSupported) {
      return { status: "unsupported" }
    }

    return {
      status: "supported",
      storage:
        output.resolution === "4k" &&
        typeof navigator.storage?.getDirectory === "function"
          ? "file"
          : "memory",
    }
  } catch (error) {
    console.error("[video-capability] Check failed", error)
    return { status: "unknown" }
  }
}
