// PlasmaChain Delegators
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'

import FirstPage from './views/FirstPage.vue'
import MyAccount from './views/MyAccount.vue'
import MyDelegations from './views/MyDelegations.vue'
import History from './views/MobileHistory.vue'
import Redelegate from './views/Redelegate.vue'
import ValidatorList from './views/ValidatorList.vue'
import ValidatorDetail from './views/ValidatorDetail.vue'
import CandidateList from './views/CandidateList.vue'
import CandidateDetail from './views/CandidateDetail.vue'
import BlockExplorer from './views/BlockExplorer.vue'
import MobileAccount from './views/MobileAccount.vue'
import Rewards from './views/Rewards.vue'
import Help from './views/Help.vue'

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
        path: 'delegations',
        name: 'delegations',
        component: MyDelegations,
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
        path: 'rewards',
        name: 'rewards',
        component: Rewards,
        meta: {
          requireLogIn: true,
          requireDeps: true
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
        path: 'candidates',
        name: 'candidates',
        component: CandidateList
      },
      {
        path: 'candidate',
        name: 'candidateDetail',
        component: CandidateDetail
      },
      {
        path: 'blockexplorer',
        name: 'blockexplorer',
        component: BlockExplorer
      },
      {
        path: '/',
        redirect: '/account'
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

  if(to.meta.requireLogIn && !sessionStorage.getItem('privatekey')) {

    if(to.name !== 'account') {
      store.dispatch('setError', "Login required")
    }

    next('/login')
    return
  }

  next()

})

// router.afterEach((to, from, next) => {
// })

export default router
