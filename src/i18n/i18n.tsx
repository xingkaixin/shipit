import * as React from "react"

import { EN_MESSAGES, type MessageKey, ZH_CN_MESSAGES } from "@/i18n/messages"

export const APP_LOCALES = ["en", "zh-CN"] as const
export type AppLocale = (typeof APP_LOCALES)[number]
export type TranslationVariables = Record<string, number | string>

const LOCALE_STORAGE_KEY = "shipit-locale"
const MESSAGES: Record<AppLocale, Record<MessageKey, string>> = {
  en: EN_MESSAGES,
  "zh-CN": ZH_CN_MESSAGES,
}

type I18nContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  t: (key: MessageKey, variables?: TranslationVariables) => string
}

const DEFAULT_CONTEXT: I18nContextValue = {
  locale: "en",
  setLocale: () => undefined,
  t: (key, variables) => translate("en", key, variables),
}

const I18nContext = React.createContext<I18nContextValue>(DEFAULT_CONTEXT)

export function I18nProvider({ children }: React.PropsWithChildren) {
  const [locale, setLocale] = React.useState<AppLocale>(detectInitialLocale)
  const translateCurrentLocale = React.useCallback(
    (key: MessageKey, variables?: TranslationVariables) =>
      translate(locale, key, variables),
    [locale]
  )

  React.useEffect(() => {
    document.documentElement.lang = locale
    document.title = translateCurrentLocale("app.title")
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", translateCurrentLocale("app.description"))
    storeLocale(locale)
  }, [locale, translateCurrentLocale])

  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: translateCurrentLocale,
    }),
    [locale, translateCurrentLocale]
  )

  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n(): I18nContextValue {
  return React.use(I18nContext)
}

export function translate(
  locale: AppLocale,
  key: MessageKey,
  variables: TranslationVariables = {}
): string {
  return MESSAGES[locale][key].replace(
    /\{(\w+)\}/g,
    (placeholder, variable: string) =>
      variable in variables ? String(variables[variable]) : placeholder
  )
}

export function localeFromLanguages(languages: readonly string[]): AppLocale {
  return languages.some((language) => language.toLowerCase().startsWith("zh"))
    ? "zh-CN"
    : "en"
}

function detectInitialLocale(): AppLocale {
  const storedLocale = readStoredLocale()
  if (storedLocale === "en" || storedLocale === "zh-CN") {
    return storedLocale
  }

  return localeFromLanguages(navigator.languages)
}

function readStoredLocale(): string | null {
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY)
  } catch {
    return null
  }
}

function storeLocale(locale: AppLocale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    return
  }
}
