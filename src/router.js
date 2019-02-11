// PlasmaChain Delegators
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'

import FirstPage from './views/FirstPage.vue'
import MyAccount from './views/MyAccount.vue'
import MyDelegations from './views/MyDelegations.vue'
import ValidatorList from './views/ValidatorList.vue'
import ValidatorDetail from './views/ValidatorDetail.vue'
import CandidateList from './views/CandidateList.vue'
import CandidateDetail from './views/CandidateDetail.vue'
import BlockExplorer from './views/BlockExplorer.vue'
import Rewards from './views/Rewards.vue'
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
      component: MyAccount,
      meta: {
        requireLogIn: true,
        requireDeps: true
      }
    },
    {
      path: '/delegations',
      name: 'delegations',
      component: MyDelegations,
      meta: {
        requireLogIn: true,
        requireDeps: true
      }      
    },
    {
      path: '/rewards',
      name: 'rewards',
      component: Rewards,
      meta: {
        requireLogIn: true
      }   
    },    
    {
      path: '/help',
      name: 'help',
      component: Help,  
    }, 
    {
      path: '/validators',
      name: 'validators',
      component: ValidatorList,
      meta: {
        requireDeps: true
      }
    },
    {
      path: '/validator',
      name: 'validatorDetail',
      component: ValidatorDetail,
      meta: {
        requireDeps: true
      }
    },
    {
      path: '/candidates',
      name: 'candidates',
      component: CandidateList
    },
    {
      path: '/candidate',
      name: 'candidateDetail',
      component: CandidateDetail
    },
    {
      path: '/blockexplorer',
      name: 'BlockExplorer',
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

router.beforeEach(async (to, from, next) => {

  if(to.meta.requireLogIn && !localStorage.getItem('privatekey')) {

    if(to.name !== 'account') {
      store.dispatch('setError', "Login required")
    }

    next('/login')
    return
  }

  if(to.name === 'validatorDetail' && !to.params.info) {
    next('/validators')
    return
  }

  if(to.name === 'account' || to.name === 'delegations' || to.name === "rewards" || to.name === "validators" || to.name === "validatorDetail" && store.state.userIsLoggedIn) {
    store.commit('DPOS/setShowSidebar', true)
  } else {
    store.commit('DPOS/setShowSidebar', false)
  }

})

// router.afterEach((to, from, next) => {
// })

export default router
