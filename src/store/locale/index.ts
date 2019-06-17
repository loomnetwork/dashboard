
import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"

export interface LocaleState {
  locale: string
}

const builder = getStoreBuilder<DashboardState>().module(
  "locale",
  {
    locale: sessionStorage.getItem("locale") || "en",
  } as LocaleState,
)
const stateGetter = builder.state()

function setLocale(state: LocaleState, locale: string) {
  state.locale = locale
  sessionStorage.setItem("locale", locale)
}

export const LocaleStore = {
  get state() { return stateGetter()},
  setLocale: builder.commit(setLocale),
}
