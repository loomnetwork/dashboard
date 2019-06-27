import Vue from "vue"
import VueI18n from "vue-i18n"
import defaultMessage from "./locales/en.json"
import Axios from "axios"

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: { en: defaultMessage },
})

const loadedLocales = ["en"]

export const supportedLocales = [
  { key: "en", localizedName: "English", localizedShortName: "EN" },
  { key: "zh", localizedName: "中文", localizedShortName: "中文" },
  { key: "es", localizedName: "Español", localizedShortName: "ES" },
  { key: "ja", localizedName: "日本語 ", localizedShortName: "日本" },
  { key: "th", localizedName: "ภาษาไทย", localizedShortName: "ไทย" },
  { key: "ko", localizedName: "조선말/한국어", localizedShortName: "한국어" },
  { key: "hi", localizedName: "हिन्दी", localizedShortName: "हिन्दी" },
]

export function isLocaleSupported(localeKey) {
  return !!supportedLocales.find((locale) => locale.key === localeKey)
}

export async function loadLocale(locale) {
  console.log("LOCALE ", locale)
  if (i18n.locale !== locale) {
    if (loadedLocales.indexOf(locale) === -1) {
      const msgs = await require(`./locales/${locale}.json`)
      i18n.setLocaleMessage(locale, msgs)
      loadedLocales.push(locale)
    }
    i18n.locale = locale
  }
}
