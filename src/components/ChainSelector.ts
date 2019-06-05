import { Component, Vue } from "vue-property-decorator"
import { dashboardStore } from "@/store"
import { ethereumModule } from "@/store/ethereum"
import { plasmaModule } from "@/store/plasma"
import { DashboardState } from "@/types"

@Component
export default class ChainSelector extends Vue {
  // @Prop({ required: true }) allowedUrls // prettier-ignore
  // @Prop({ required: true }) serverUrl // prettier-ignore

  // addChainUrl = DPOSTypedStore.addChainUrl

  setEnv(env) {
    dashboardStore.setEnv(env)
  }

  get envName() {
    return this.$store.state.envName
  }

  set envName(name) {
    console.log("name", name)
    dashboardStore.setEnv(name)
    ethereumModule.setEnv(name)
    plasmaModule.setEnv(name)
  }

  get envs() {
    console.log("get envs", this.$store.state.envs)
    return (this.$store.state as DashboardState).envs
  }
}
