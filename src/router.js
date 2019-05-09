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

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'firstPage',
      component: FirstPage
    },
    {
      path: '/account',
      name: 'account',
      component: MobileAccount,
      meta: {
        requireLogIn: true,
        requireDeps: true
      }
    },
    {
      path: '/history',
      name: 'history',
      component: History,
      meta: {
        requireLogIn: true,
        requireDeps: true
      }      
    },      
    {
      path: '/redelegate',
      name: 'redelegate',
      component: Redelegate,
      meta: {
        requireLogIn: true,
        requireDeps: true
      }      
    },
    {
      path: '/faq',
      name: 'FAQ',
      component: Help,  
    }, 
    {
      path: '/validators',
      name: 'validators',
      component: ValidatorList,
      meta: {
        requireDeps: true
      },
    },
    {
      path: '/validator/:index',
      name: 'validatorDetail',
      component: ValidatorDetail,
      meta: {
        requireDeps: true
      }
    },
    {
      path: '/blockexplorer',
      name: 'blockexplorer',
      component: BlockExplorer
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: Analytics
    },
    {
      path: '/',
      redirect: '/analytics'
    },
    {
      path: '/blockexplorer',
      name: 'blockexplorer',
      component: BlockExplorer
    },
    {
      path: '/',
      redirect: '/account'
    }
  ],
  scrollBehavior() {
    return {
      x: 0,
      y: 0
    }
  }
})

export default router
