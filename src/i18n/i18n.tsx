import * as React from "react"

import { EN_MESSAGES, type MessageKey } from "@/i18n/messages"
import {
  LOCALES,
  SITE_URL,
  localeFromPath,
  type AppLocale,
} from "@/i18n/locales"

export { APP_LOCALES, type AppLocale } from "@/i18n/locales"
export type TranslationVariables = Record<string, number | string>

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
  const [locale, setLocale] = React.useState<AppLocale>(() =>
    localeFromPath(window.location.pathname)
  )
  const translateCurrentLocale = React.useCallback(
    (key: MessageKey, variables?: TranslationVariables) =>
      translate(locale, key, variables),
    [locale]
  )

  React.useEffect(() => {
    const syncLocale = () => setLocale(localeFromPath(window.location.pathname))
    window.addEventListener("popstate", syncLocale)
    return () => window.removeEventListener("popstate", syncLocale)
  }, [])

  React.useEffect(() => {
    document.documentElement.lang = locale
    const title = translateCurrentLocale("app.title")
    const description = translateCurrentLocale("app.description")

    document.title = title
    updateMetaContent('meta[name="description"]', description)
    updateMetaContent('meta[property="og:title"]', title)
    updateMetaContent('meta[property="og:description"]', description)
    updateMetaContent('meta[property="og:locale"]', LOCALES[locale].ogLocale)
    const url = SITE_URL + LOCALES[locale].path
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url)
    updateMetaContent('meta[property="og:url"]', url)
    updateMetaContent('meta[name="twitter:title"]', title)
    updateMetaContent('meta[name="twitter:description"]', description)
    const schemaElement = document.querySelector(
      'script[type="application/ld+json"]'
    )
    if (schemaElement?.textContent) {
      const schema = JSON.parse(schemaElement.textContent)
      schema.description = description
      schemaElement.textContent = JSON.stringify(schema).replaceAll(
        "<",
        "\\u003c"
      )
    }
    document
      .querySelectorAll<HTMLElement>("[data-guide-message]")
      .forEach((element) => {
        const key = element.dataset.guideMessage
        if (key && key in EN_MESSAGES) {
          element.textContent = translateCurrentLocale(key as MessageKey)
        }
      })
    if (window.location.pathname !== LOCALES[locale].path) {
      window.history.replaceState(
        window.history.state,
        "",
        LOCALES[locale].path + window.location.search + window.location.hash
      )
    }
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

function updateMetaContent(selector: string, content: string): void {
  document.querySelector(selector)?.setAttribute("content", content)
}
