import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

import Faucet from './views/Faucet.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Faucet',
      component: Faucet
      // meta: {
      //   requireLogIn: true
      // }
    }
  ],
  scrollBehavior() {
    return {
      x: 0,
      y: 0
    }
  }
})

router.beforeEach((to, from, next) => {
  // Mimi : This code is doesn't work, not sure why
  if (!store.state.userIsLoggedIn && localStorage.getItem('accessToken')) {
    store.dispatch('logIn', { token: localStorage.getItem('accessToken') })
  }

  if (to.meta.requireLogIn && !store.state.userIsLoggedIn) {
    next('/')
  }
  next()
})

// router.afterEach((to, from, next) => {
// })

export default router
