
import * as Sentry from "@sentry/browser"
import * as SentryIntegrations from "@sentry/integrations"
import BootstrapVue from "bootstrap-vue"
import Vue from "vue"
import { sync } from "vuex-router-sync"
import VueClipboard from "vue-clipboard2"

import FontAwesome from "@fortawesome/fontawesome"
import BrandsFontAwesome from "@fortawesome/fontawesome-free-brands"
import SolidFontAwesome from "@fortawesome/fontawesome-free-solid"
import RegularFontAwesome from "@fortawesome/fontawesome-free-regular"
import FontAwesomeIcon from "@fortawesome/vue-fontawesome"
import Autocomplete from "v-autocomplete"

import "v-autocomplete/dist/v-autocomplete.css"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import "animate.css/animate.css"

import { i18n } from "./i18n"
import App from "./App.vue"
import router from "./router"
import { store, dashboardStore } from "./store"

import { initFilters } from "./filters"
import { ethereumModule } from "./store/ethereum"
import { isMobile } from "./utils"
import production from "./config/production"
import extDev from "./config/ext-dev"
import dev from "./config/dev"
import local from "./config/local"

// tslint:disable-next-line: no-var-requires
require("./assets/scss/main.scss")

Vue.use(BootstrapVue)
Vue.use(Autocomplete)
Vue.use(VueClipboard)

FontAwesome.library.add(BrandsFontAwesome, SolidFontAwesome, RegularFontAwesome)
Vue.component("fa", FontAwesomeIcon)
Vue.config.productionTip = false

sync(store, router)

initFilters()

export default new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
  async beforeMount() {

    // set available envs
    if (window.location.host === "dashboard.dappchains.com" || window.location.host === "wallet.loomx.io") {
      dashboardStore.setEnvs([production])
      await dashboardStore.setEnv(production)
    } else {
      console.log("multiple envs")
      const userSelected = localStorage.getItem("selectedConfig")
      const multipleEnvs = [production, extDev, dev]

      dashboardStore.setEnvs(multipleEnvs)

      if (userSelected) {
        // if user has already selected a config before
        const selectedEnv = multipleEnvs.find((env) => env.name === userSelected)!
        await dashboardStore.setEnv(selectedEnv)
      } else {
        // default
        await dashboardStore.setEnv(extDev)
      }
    }

    // do not auto connect if mobile or more than one environement config is present
    if (!isMobile() ||
      this.$store.state.envs.length > 1) return

    document.dispatchEvent(new Event("render-event"))

  },
}).$mount("#app")

// todo should store key/project elsewhere (vault?)
Sentry.init({
  dsn: undefined, // set this to allow Sentry to send events, otherwise it won't do anything
  environment: window.location.hostname,
  integrations: [
    new SentryIntegrations.Dedupe(),
    new SentryIntegrations.Vue({
      Vue,
      attachProps: true,
    })],
})
