import { Component, Prop, Vue, Emit } from "vue-property-decorator"
import { DPOSTypedStore, addChainUrl } from "@/store/dpos-old"

@Component
export default class ChainSelector extends Vue {
  @Prop({ required: true }) allowedUrls // prettier-ignore
  @Prop({ required: true }) serverUrl // prettier-ignore

  addChainUrl = DPOSTypedStore.addChainUrl

  get chainUrl() {
    return (DPOSTypedStore.state.networkId || 0)
  }

}
