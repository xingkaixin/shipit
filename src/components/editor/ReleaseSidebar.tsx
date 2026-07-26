import type * as React from "react"
import {
  Film01Icon,
  PaintBoardIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"

import { ContentSettings } from "@/components/editor/ContentSettings"
import { OutputSettingsPanel } from "@/components/editor/OutputSettingsPanel"
import { StyleSettings } from "@/components/editor/StyleSettings"
import { Icon } from "@/components/ui/icon"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LogoImageState } from "@/hooks/use-logo-image"
import type { OutputCapabilityState } from "@/hooks/use-output-capability"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import type { ReleaseDraft } from "@/video/release-video"

type ReleaseSidebarProps = {
  draft: ReleaseDraft
  logoState: LogoImageState
  outputCapability: OutputCapabilityState
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function ReleaseSidebar({
  draft,
  logoState,
  outputCapability,
  dispatch,
}: ReleaseSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col border-b bg-background lg:border-r lg:border-b-0">
      <div className="px-5 pt-5 pb-4 sm:px-6">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          发布影片
        </p>
        <h1 className="font-heading text-xl font-semibold tracking-[-0.025em] text-balance">
          制作发布短片
        </h1>
      </div>

      <Tabs defaultValue="content" className="min-h-0 flex-1 gap-0">
        <div className="border-b px-5 pb-4 sm:px-6">
          <TabsList className="grid h-[52px] w-full grid-cols-3 group-data-horizontal/tabs:h-[52px] sm:h-10 sm:group-data-horizontal/tabs:h-10">
            <TabsTrigger value="content">
              <Icon icon={Settings02Icon} data-icon="inline-start" />
              内容
            </TabsTrigger>
            <TabsTrigger value="style">
              <Icon icon={PaintBoardIcon} data-icon="inline-start" />
              样式
            </TabsTrigger>
            <TabsTrigger value="output">
              <Icon icon={Film01Icon} data-icon="inline-start" />
              输出
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="content"
          className="scrollbar-thin overscroll-contain px-5 py-6 sm:px-6 lg:overflow-y-auto"
        >
          <ContentSettings
            draft={draft}
            logoState={logoState}
            dispatch={dispatch}
          />
        </TabsContent>
        <TabsContent
          value="style"
          className="scrollbar-thin overscroll-contain px-5 py-6 sm:px-6 lg:overflow-y-auto"
        >
          <StyleSettings draft={draft} dispatch={dispatch} />
        </TabsContent>
        <TabsContent
          value="output"
          className="scrollbar-thin overscroll-contain px-5 py-6 sm:px-6 lg:overflow-y-auto"
        >
          <OutputSettingsPanel
            draft={draft}
            outputCapability={outputCapability}
            dispatch={dispatch}
          />
        </TabsContent>
      </Tabs>
    </aside>
  )
}
