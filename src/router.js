// PlasmaChain Delegators
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'


import FirstPage from './views/FirstPage.vue'
import MyDelegations from './views/MyDelegations.vue'
import History from './views/MobileHistory.vue'
import Redelegate from './views/Redelegate.vue'
import ValidatorList from './views/ValidatorList.vue'
import ValidatorDetail from './views/ValidatorDetail.vue'
import BlockExplorer from './views/BlockExplorer.vue'
import Analytics from './views/Analytics.vue'
import MobileAccount from './views/MobileAccount.vue'
import Help from './views/Help.vue'
import DepositWithdraw from './views/DepositWithdraw.vue'

import { loadLocale, isLocaleSupported } from './i18n'

Vue.use(VueRouter)

async function setRouteLocale(to, from) {
  const { query, hash } = to
  if (to.params.locale && isLocaleSupported(to.params.locale)) {
    const { locale } = to.params
    await loadLocale(locale)
    await store.dispatch('setLocale', locale)
  } else if (from.params.locale && isLocaleSupported(from.params.locale)) {
    return { path: '/' + from.params.locale + to.path, query, hash }
  } else if (store.getters.locale) {
    return { path: '/' + store.getters.locale + to.path, query, hash }
  }
  return undefined
}

const LocaleComponent = Vue.extend({
  template: '<router-view />',
  async beforeRouteEnter(to, from, next) {
    let nextRoute
    try {
      nextRoute = await setRouteLocale(to, from)
    } catch (err) {
      next(err)
      return
    }
    if (nextRoute === undefined) {
      next(vm => {
        if (to.meta.title) {
          document.title = to.meta.title(to, vm)
        }
      })
    } else {
      next(nextRoute)
    }
  },
  async beforeRouteUpdate(to, from, next) {
    let nextRoute
    try {
      nextRoute = await setRouteLocale(to, from)
    } catch (err) {
      next(err)
      return
    }
    if (nextRoute === undefined) {
      if (to.meta.title) {
        document.title = to.meta.title(to, this)
      }
      next()
    } else {
      next(nextRoute)
    }
  }
})

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
    path: '/:locale?',
    component: LocaleComponent,
    children: [
      {
        path: 'login',
        name: 'firstPage',
        component: FirstPage
      },
      {
        path: 'account',
        name: 'account',
        component: MobileAccount,
        meta: {
          requireLogIn: true,
          requireDeps: true
        }
      },
      {
        path: 'history',
        name: 'history',
        component: History,
        meta: {
          requireLogIn: true,
          requireDeps: true
        }      
      },      
      {
        path: 'redelegate',
        name: 'redelegate',
        component: Redelegate,
        meta: {
          requireLogIn: true,
          requireDeps: true
        }      
      },
      {
        path: 'deposit-withdraw',
        name: 'depositeWithdraw',
        component: DepositWithdraw,
        meta: {
          requireLogIn: true,
          requireLoomChain : ['ethCoin']
        }
      },
      {
        path: 'faq',
        name: 'FAQ',
        component: Help,  
      }, 
      {
        path: 'validators',
        name: 'validators',
        component: ValidatorList,
        meta: {
          requireDeps: true
        },
      },
      {
        path: 'validator/:index',
        name: 'validatorDetail',
        component: ValidatorDetail,
        meta: {
          requireDeps: true
        }
      },
      {
        path: 'blockexplorer',
        name: 'blockexplorer',
        component: BlockExplorer
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: Analytics
      },
      {
        path: '/',
        redirect: '/analytics'
      }
    ],
  }
  ],
  scrollBehavior() {
    return {
      x: 0,
      y: 0
    }
  }
  


})
router.beforeEach(async (to, from, next) => {

  if (to.meta.requireLoomChain && store.state.userIsLoggedIn) {
    await store.dispatch('DappChain/init', { contractNames: to.meta.requireLoomChain })
  }

  next()
})

export default router
