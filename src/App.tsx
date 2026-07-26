import { ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"

import { ReleaseEditor } from "@/components/editor/ReleaseEditor"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { useAppearance, type Appearance } from "@/hooks/use-appearance"
import { useI18n, type AppLocale } from "@/i18n/i18n"
import shipitLogo from "../assets/shipit-logo-header.png"

export function App() {
  const { locale, setLocale, t } = useI18n()
  const { appearance, setAppearance } = useAppearance()

  return (
    <div className="flex min-h-svh flex-col bg-workspace lg:h-svh lg:min-h-[680px] lg:overflow-hidden">
      <a
        href="#release-editor"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("app.skipToEditor")}
      </a>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#fdfefb] ring-1 ring-foreground/8">
            <img
              className="size-8 object-contain"
              src={shipitLogo}
              alt=""
              width="32"
              height="32"
              fetchPriority="high"
            />
          </span>
          <div className="min-w-0">
            <h1
              className="font-heading text-[15px] leading-none font-semibold tracking-[-0.02em]"
              translate="no"
            >
              Shipit
            </h1>
            <p className="mt-1.5 hidden truncate text-[11px] leading-none text-muted-foreground sm:block">
              {t("app.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AppearanceControl value={appearance} onChange={setAppearance} />
          <LanguageControl value={locale} onChange={setLocale} />
        </div>
      </header>
      <ReleaseEditor />
    </div>
  )
}

function AppearanceControl({
  value,
  onChange,
}: {
  value: Appearance
  onChange: (appearance: Appearance) => void
}) {
  const { t } = useI18n()

  return (
    <SegmentedControl
      label={t("appearance.label")}
      value={value}
      onChange={onChange}
      options={[
        { value: "system", label: t("appearance.system"), icon: ComputerIcon },
        { value: "light", label: t("appearance.light"), icon: Sun03Icon },
        { value: "dark", label: t("appearance.dark"), icon: Moon02Icon },
      ]}
    />
  )
}

function LanguageControl({
  value,
  onChange,
}: {
  value: AppLocale
  onChange: (locale: AppLocale) => void
}) {
  const { t } = useI18n()

  return (
    <SegmentedControl
      label={t("language.label")}
      value={value}
      onChange={onChange}
      options={[
        { value: "zh-CN", label: t("language.chinese") },
        { value: "en", label: t("language.english") },
      ]}
    />
  )
}

export default App
