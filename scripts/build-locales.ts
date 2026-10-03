import { mkdir, readFile, writeFile } from "node:fs/promises"
import { Window } from "happy-dom"
import { APP_LOCALES, LOCALES, SITE_URL } from "../src/i18n/locales.ts"
import type { MessageKey } from "../src/i18n/messages.ts"

const template = await readFile("dist/index.html", "utf8")

for (const locale of APP_LOCALES) {
  const { messages, path, ogLocale } = LOCALES[locale]
  const window = new Window({
    settings: {
      disableJavaScriptEvaluation: true,
      disableCSSFileLoading: true,
      disableJavaScriptFileLoading: true,
    },
  })
  const document = window.document
  document.write(template)
  document.documentElement.lang = locale
  document.title = messages["app.title"]
  document
    .querySelector('link[rel="canonical"]')!
    .setAttribute("href", SITE_URL + path)
  for (const element of document.querySelectorAll("[data-guide-message]")) {
    const key = element.getAttribute("data-guide-message") as MessageKey
    if (!(key in messages)) throw new Error(`Missing translation: ${key}`)
    element.textContent = messages[key]
  }
  for (const selector of [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ]) {
    document
      .querySelector(selector)!
      .setAttribute("content", messages["app.description"])
  }
  for (const selector of [
    'meta[property="og:title"]',
    'meta[name="twitter:title"]',
  ]) {
    document
      .querySelector(selector)!
      .setAttribute("content", messages["app.title"])
  }
  document
    .querySelector('meta[property="og:url"]')!
    .setAttribute("content", SITE_URL + path)
  document
    .querySelector('meta[property="og:locale"]')!
    .setAttribute("content", ogLocale)
  document
    .querySelectorAll('meta[property="og:locale:alternate"]')
    .forEach((element) => element.remove())
  for (const alternate of APP_LOCALES.filter((value) => value !== locale)) {
    const meta = document.createElement("meta")
    meta.setAttribute("property", "og:locale:alternate")
    meta.content = LOCALES[alternate].ogLocale
    document.head.append(meta)
  }
  const schemaElement = document.querySelector(
    'script[type="application/ld+json"]'
  )!
  const schema = JSON.parse(schemaElement.textContent)
  schema.description = messages["app.description"]
  schemaElement.textContent = JSON.stringify(schema).replaceAll("<", "\\u003c")
  await mkdir(`dist${path}`, { recursive: true })
  await writeFile(
    `dist${path}index.html`,
    "<!doctype html>\n" + document.documentElement.outerHTML + "\n"
  )
  await window.happyDOM.close()
}
