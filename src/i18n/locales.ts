import { EN_MESSAGES, JA_MESSAGES, ZH_CN_MESSAGES } from "./messages.ts"

export const SITE_URL = "https://shipit.xingkaixin.me"

export const LOCALES = {
  en: { messages: EN_MESSAGES, path: "/", ogLocale: "en_US" },
  "zh-CN": { messages: ZH_CN_MESSAGES, path: "/zh-cn/", ogLocale: "zh_CN" },
  ja: { messages: JA_MESSAGES, path: "/ja/", ogLocale: "ja_JP" },
} as const

export type AppLocale = keyof typeof LOCALES
export const APP_LOCALES = Object.keys(LOCALES) as readonly AppLocale[]

export function localeFromPath(path: string): AppLocale {
  return APP_LOCALES.find((locale) => LOCALES[locale].path === path) ?? "en"
}
