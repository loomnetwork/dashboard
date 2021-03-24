// PlasmaChain Delegators
import Vue from "vue"
import VueRouter from "vue-router"

import FirstPage from "./views/FirstPage.vue"
import History from "./views/MobileHistory.vue"
import ValidatorList from "@/dpos/views/ValidatorList.vue"
import ValidatorDetail from "@/dpos/views/ValidatorDetail.vue"
import BlockExplorer from "./views/BlockExplorer.vue"
import Analytics from "./views/Analytics.vue"
import MobileAccount from "./views/MobileAccount.vue"
import Help from "./views/Help.vue"
import StakingGuide from "./views/StakingGuide.vue"
import GameAssets from "./views/GameAssets.vue"
import AddKey from "@/whitelist/views/AddKey.vue"
import DepositWithdraw from "./views/DepositWithdraw.vue"
import FeedbackForm from "./views/FeedbackForm.vue"
import ValidatorManagement from "./dpos/views/ValidatorManagement.vue"
import TransferGateway from "./views/TransferGateway.vue"
import { plasmaModule } from "./store/plasma"

Vue.use(VueRouter)

function requireAccount(to, from, next) {
  if (plasmaModule.state.address === "") {
    next("/login?redirect=" + to.path)
  } else {
    next()
  }
}

function loginGuard(to, from, next) {
  if (to.path === "/login" && plasmaModule.state.address) {
    next("/account")
  } else {
    next()
  }
}

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/login",
      name: "firstPage",
      component: FirstPage,
      beforeEnter: loginGuard,
    },
    {
      path: "/account",
      name: "account",
      component: MobileAccount,
      beforeEnter: requireAccount,
    },
    {
      path: "/history",
      name: "history",
      component: History,
      beforeEnter: requireAccount,
    },
    {
      path: "/faq",
      name: "FAQ",
      component: Help,
    },
    {
      path: "/staking-guide",
      name: "Staking Guide",
      component: StakingGuide,
    },
    {
      path: "/wallet",
      name: "depositeWithdraw",
      component: DepositWithdraw,
      beforeEnter: requireAccount,
    },
    {
      path: "/add-key",
      name: "addKey",
      component: AddKey,
      beforeEnter: requireAccount,
    },
    {
      path: "/game-assets",
      name: "gameAssets",
      component: GameAssets,
      beforeEnter: requireAccount,
    },
    {
      path: "/validators",
      name: "validators",
      component: ValidatorList,
    },
    {
      path: "/validator/:index",
      name: "validatorDetail",
      component: ValidatorDetail,
    },
    {
      path: "/blockexplorer",
      name: "blockexplorer",
      component: BlockExplorer,
    },
    {
      path: "/analytics",
      name: "analytics",
      component: Analytics,
    },
    {
      path: "/feedback",
      name: "feedback",
      component: FeedbackForm,
      beforeEnter: requireAccount,
    },
    {
      path: "/validator-management",
      name: "validatorManagement",
      component: ValidatorManagement,
      beforeEnter: requireAccount,
    },
    {
      path: "/transfer-gateway",
      name: "transferGateway",
      component: TransferGateway,
    },
    {
      path: "/analytics",
      name: "analytics",
      component: Analytics,
      beforeEnter: requireAccount,
    },
    {
      path: "/",
      redirect: "/login",
    },
  ],
  scrollBehavior() {
    return {
      x: 0,
      y: 0,
    }
  },
})

export default router
