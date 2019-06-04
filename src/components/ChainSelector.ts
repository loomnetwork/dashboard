import { Component, Prop, Vue, Emit } from "vue-property-decorator"
import { DPOSTypedStore, addChainUrl } from "@/store/dpos-old"
import { dashboardStore } from "@/store"

@Component
export default class ChainSelector extends Vue {
  @Prop({ required: true }) allowedUrls // prettier-ignore
  @Prop({ required: true }) serverUrl // prettier-ignore

  addChainUrl = DPOSTypedStore.addChainUrl

  setEnv(env) {
    dashboardStore.setEnv(env)
  }

  set envName(name) {
    dashboardStore.setEnv(name)
  }

  get chainUrl() {
    // plasma.setEnvironment("production")
    // ethereum.setEnvironment("production")
    // or we could put therese
    return this.$store.state.plasma.networkId || 0
  }
}
