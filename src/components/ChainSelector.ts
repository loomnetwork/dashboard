import { Component, Prop, Vue, Emit } from "vue-property-decorator"

@Component
export default class ChainSelector extends Vue {
  @Prop({ required: true }) allowedUrls // prettier-ignore
  @Prop({ required: true }) serverUrl // prettier-ignore

  chainUrl = this.serverUrl

  @Emit("urlClicked")
  onUrlClicked(url: string) {
    this.chainUrl = url
  }

  @Emit("urlInput")
  setUrl(url: string) {
    // this comment is just for avoiding empty warn
  }
}
