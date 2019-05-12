
export const LocaleStore = {
    state: {
      locale: sessionStorage.getItem('locale') || 'en'
    },
    getters: {
      locale(state) {
        return state.locale
      }
    },
    mutations: {
      setLocale(state, locale) {
        state.locale = locale
        sessionStorage.setItem('locale', locale)
      }
    },
    actions: {
      setLocale({ commit }, locale) {
        commit('setLocale', locale)
      }
    }
  }