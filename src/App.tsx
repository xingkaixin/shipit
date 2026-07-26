import { SparklesIcon } from "@hugeicons/core-free-icons"

import { ReleaseEditor } from "@/components/editor/ReleaseEditor"
import { Icon } from "@/components/ui/icon"
import shipitLogo from "../assets/shipit-logo-header.png"

export function App() {
  return (
    <div className="flex min-h-svh flex-col bg-workspace lg:h-svh lg:min-h-[680px] lg:overflow-hidden">
      <a
        href="#release-editor"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        跳到编辑器
      </a>
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 shadow-[0_1px_0_color-mix(in_oklch,var(--border),transparent_25%)] sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fdfefb] ring-1 ring-foreground/7">
            <img
              className="size-10 object-contain"
              src={shipitLogo}
              alt=""
              width="40"
              height="40"
              fetchPriority="high"
            />
          </span>
          <div>
            <p
              className="font-heading text-[15px] leading-none font-semibold tracking-[-0.02em]"
              translate="no"
            >
              Shipit
            </p>
            <p className="mt-1.5 truncate text-[11px] leading-none text-muted-foreground">
              Release Film Maker
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground),transparent_94%)] sm:flex">
          <Icon icon={SparklesIcon} className="size-3.5 text-ring" />5
          秒，把发布变成一个时刻
        </div>
      </header>
      <ReleaseEditor />
    </div>
  )
}

export default App
