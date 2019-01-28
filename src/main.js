/* eslint-disable no-undef  */
import BootstrapVue from 'bootstrap-vue'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import VueProgressBar from 'vue-progressbar'
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'
import Vue from 'vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'swiper/dist/css/swiper.css'

import ApiClient from './services/faucet-api'
import Contract from './services/contract'

// import App from './App.vue'
import Faucet from './views/Faucet.vue'
import router from './faucet-router'
import store from './store'

require('./assets/scss/main.scss')

const progressBarOptions = {
  color: '#52c3ff',
  failedColor: '#874b4b',
  thickness: '4px',
  autoFinish: false
}

const api = new ApiClient()
const contract = new Contract()

const debugMode = process.env.NODE_ENV !== 'production'
const log = (message = '', object) => {
  if (debugMode) console.log(message, object)
}

Object.defineProperty(Vue.prototype, '$api', { value: api })
Object.defineProperty(Vue.prototype, '$contract', { value: contract })
Object.defineProperty(Vue.prototype, '$log', { value: log })

Vue.use(VueProgressBar, progressBarOptions)
Vue.use(BootstrapVue)
Vue.use(VueAwesomeSwiper, {})
Vue.config.productionTip = false

export default new Vue({
  router,
  store,
  render: h => h(Faucet),
  mounted() {
    document.dispatchEvent(new Event('render-event'))
  }
}).$mount('#app')

if (!debugMode) {
  Raven.config('https://46e40f8393dc4d63833d13c06c9fe267@sentry.io/1279387')
    .addPlugin(RavenVue, Vue)
    .install()
}
