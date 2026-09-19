import * as React from "react"

import {
  EN_MESSAGES,
  JA_MESSAGES,
  type MessageKey,
  ZH_CN_MESSAGES,
} from "@/i18n/messages"

type LocaleDefinition = {
  messages: Record<MessageKey, string>
  ogLocale: string
}

const LOCALES = {
  en: { messages: EN_MESSAGES, ogLocale: "en_US" },
  "zh-CN": { messages: ZH_CN_MESSAGES, ogLocale: "zh_CN" },
  ja: { messages: JA_MESSAGES, ogLocale: "ja_JP" },
} as const satisfies Record<string, LocaleDefinition>

export const APP_LOCALES = Object.keys(LOCALES) as readonly AppLocale[]
export type AppLocale = keyof typeof LOCALES
export type TranslationVariables = Record<string, number | string>

const LOCALE_STORAGE_KEY = "shipit-locale"
const FALLBACK_LOCALE: AppLocale = "en"

type I18nContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  t: (key: MessageKey, variables?: TranslationVariables) => string
}

const DEFAULT_CONTEXT: I18nContextValue = {
  locale: FALLBACK_LOCALE,
  setLocale: () => undefined,
  t: (key, variables) => translate(FALLBACK_LOCALE, key, variables),
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
    const title = translateCurrentLocale("app.title")
    const description = translateCurrentLocale("app.description")

    document.title = title
    updateMetaContent('meta[name="description"]', description)
    updateMetaContent('meta[property="og:title"]', title)
    updateMetaContent('meta[property="og:description"]', description)
    updateMetaContent('meta[property="og:locale"]', LOCALES[locale].ogLocale)
    updateMetaContent('meta[name="twitter:title"]', title)
    updateMetaContent('meta[name="twitter:description"]', description)
    document
      .querySelectorAll<HTMLElement>("[data-guide-message]")
      .forEach((element) => {
        const key = element.dataset.guideMessage
        if (key && key in EN_MESSAGES) {
          element.textContent = translateCurrentLocale(key as MessageKey)
        }
      })
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
  return LOCALES[locale].messages[key].replace(
    /\{(\w+)\}/g,
    (placeholder, variable: string) =>
      variable in variables ? String(variables[variable]) : placeholder
  )
}

export function localeFromLanguages(languages: readonly string[]): AppLocale {
  for (const language of languages) {
    const matched = APP_LOCALES.find(
      (locale) => languageTag(locale) === languageTag(language)
    )
    if (matched) {
      return matched
    }
  }

  return FALLBACK_LOCALE
}

function languageTag(language: string): string {
  return language.toLowerCase().split("-")[0]
}

function detectInitialLocale(): AppLocale {
  const storedLocale = APP_LOCALES.find(
    (locale) => locale === readStoredLocale()
  )
  if (storedLocale) {
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

function updateMetaContent(selector: string, content: string): void {
  document.querySelector(selector)?.setAttribute("content", content)
}
