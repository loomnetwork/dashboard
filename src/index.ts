/* eslint-disable no-undef  */
// PlasmaChain Delegators
import BootstrapVue from "bootstrap-vue"
import VueAwesomeSwiper from "vue-awesome-swiper"
import VueProgressBar from "vue-progressbar"
import Raven from "raven-js"
import RavenVue from "raven-js/plugins/vue"
import Vue from "vue"
import { sync } from "vuex-router-sync"
import * as Sentry from "@sentry/browser"
import Progress from "vue-multiple-progress"

import moment from "moment"
import durationFormatSetup from "moment-duration-format"

import FontAwesome from "@fortawesome/fontawesome"
import BrandsFontAwesome from "@fortawesome/fontawesome-free-brands"
import SolidFontAwesome from "@fortawesome/fontawesome-free-solid"
import RegularFontAwesome from "@fortawesome/fontawesome-free-regular"
import FontAwesomeIcon from "@fortawesome/vue-fontawesome"
import Autocomplete from "v-autocomplete"

import "v-autocomplete/dist/v-autocomplete.css"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import "swiper/dist/css/swiper.css"
import "animate.css/animate.css"

import { i18n } from "./i18n"
import App from "./App.vue"
import router from "./router"
import { store } from "./store"

durationFormatSetup(moment)

import { initFilters } from "./filters"

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
Vue.use(VueAwesomeSwiper, {})
Vue.use(Autocomplete)
Vue.use(Progress)
// FontAwesome.library.add(BrandsFontAwesome, SolidFontAwesome, RegularFontAwesome)
Vue.component("fa", FontAwesomeIcon)
Vue.config.productionTip = false

sync(store, router)

Vue.filter("interval", (value) => {
  if (!value) return ""
  // @ts-ignore
  return moment.duration(value, "seconds").format()
})

initFilters()

export default new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
  mounted() {
    document.dispatchEvent(new Event("render-event"))
  },
}).$mount("#app")

if (!debugMode) {
  Raven.config("https://46e40f8393dc4d63833d13c06c9fe267@sentry.io/1279387")
    .addPlugin(RavenVue, Vue)
    .install()
}

// when an address is plasma
// take the user to the account page
store.watch(
  (s) => s.plasma.address,
  (address) => {
    if (address !== "") {
      router.push("account")
    } else {
      router.push("/")
    }
  },
)
// todo should store key/project elsewhere (vault?)
// Sentry.init({
//   dsn: debugMode ? null : 'https://7e893bd9be0942a0977eb2120b7722d4@sentry.io/1394913"',
//   integrations: [new Sentry.Integrations.Vue({
//     Vue,
//     attachProps: true
//   })]
// })
