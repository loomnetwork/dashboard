/* eslint-disable no-undef  */
// PlasmaChain Delegators
import BootstrapVue from "bootstrap-vue"
import VueProgressBar from "vue-progressbar"
import Raven from "raven-js"
import RavenVue from "raven-js/plugins/vue"
import Vue from "vue"
import { sync } from "vuex-router-sync"
import Progress from "vue-multiple-progress"
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

import debug from "debug"

import { initFilters } from "./filters"
import { ethereumModule } from "./store/ethereum"
import { isMobile } from "./utils"
import production from "./config/production"
import stage from "./config/stage"
import dev from "./config/dev"
import local from "./config/local"

// tslint:disable-next-line: no-var-requires
require("./assets/scss/main.scss")

const progressBarOptions = {
  color: "#52c3ff",
  failedColor: "#874b4b",
  thickness: "4px",
  autoFinish: false,
}

const debugMode = process.env.NODE_ENV !== "production"
const log = (message = "", object) => {
  if (debugMode) console.log(message, object)
}

// Object.defineProperty(Vue.prototype, '$log', { value: log })

Vue.use(VueProgressBar, progressBarOptions)
Vue.use(BootstrapVue)
Vue.use(Autocomplete)
Vue.use(Progress)
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
      dashboardStore.setEnvs([production, stage, dev])
      // default
      await dashboardStore.setEnv(stage)
    }

    // do not auto connect if mobile or more than one environement config is present
    if (!isMobile() ||
      this.$store.state.envs.length > 1) return

    document.dispatchEvent(new Event("render-event"))

    // @ts-ignore
    if ((window.web3 && window.web3.currentProvider.isTrust) ||
      // @ts-ignore
      !!window.imToken ||
      // @ts-ignore
      (window.web3 && window.web3.currentProvider.isMetaMask) ||
      // @ts-ignore
      (window.web3 && window.web3.isCobo)
    ) {
      ethereumModule.setWalletType("metamask")
    }
  },
}).$mount("#app")

// set available envs
if (window.location.host === "dashboard.dappchains.com") {
  Raven.config("https://46e40f8393dc4d63833d13c06c9fe267@sentry.io/1279387")
    .addPlugin(RavenVue, Vue)
    .install()
}
// todo should store key/project elsewhere (vault?)
// Sentry.init({
//   dsn: debugMode ? null : 'https://7e893bd9be0942a0977eb2120b7722d4@sentry.io/1394913"',
//   integrations: [new Sentry.Integrations.Vue({
//     Vue,
//     attachProps: true
//   })]
// })
