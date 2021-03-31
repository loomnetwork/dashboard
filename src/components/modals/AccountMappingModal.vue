<template>
  <b-modal
    id="account-mapping-modal"
    title="New Account"
    v-model="visible"
    no-close-on-esc
    no-close-on-backdrop
    hide-header-close
  >
    <div>
      <p>
        {{ $t('components.modals.account_mapping_modal.description') }}
        <br />{{ $t('components.modals.account_mapping_modal.choose') }}
      </p>
      <b-form-group>
        <b-form-radio
          v-model="mappingChoice"
          name="mapping-choice"
          value="generate"
        >{{ $t('components.modals.account_mapping_modal.new_account') }}</b-form-radio>        
        <b-form-radio
          v-model="mappingChoice"
          name="mapping-existing"
          value="existing"
        >{{ $t('components.modals.account_mapping_modal.map_to') }}</b-form-radio>
      </b-form-group>
      <div v-if="mappingChoice === 'existing'">
        <div class="mb-2">
          <label style="margin:0">{{ foreignNetworkName }} address</label><br>
          <code>{{$store.state.ethereum.address}}</code>
        </div>
        <div class="mb-2">
          <label style="margin:0">Loom address</label><br>
          <code v-if="!isPKValid">-</code>
          <code v-else>{{loomAddress | loomAddress}}</code>
        </div>
        <b-form-input
          id="input-formatter"
          v-model="privateKey"
          :placeholder="$t('input_placeholder.loom_private_base64')"
          aria-describedby="input-formatter-help"
          :state="isPKValid"
        ></b-form-input>
        <b-form-text
          id="input-formatter-help"
        >{{ $t('components.modals.account_mapping_modal.input_help') }}</b-form-text>
      </div>
    </div>
    <template slot="modal-footer">
      <b-button variant="primary" @click="createMapping" :disabled="validInput === false">{{ $t('button.continue') }}</b-button>
    </template>
  </b-modal>
</template>
<script lang="ts">
import { Component, Watch, Vue, Prop, Provide } from "vue-property-decorator"
import InputAddress from "@/components/InputAddress.vue"
import { gatewayModule } from "../../store/gateway"
import { DashboardState } from "../../types"
import { Address, CryptoUtils, LocalAddress } from "loom-js"
import { formatFromLoomAddress } from "../../utils"

@Component({
  components: {
    InputAddress,
  },
})
export default class AccountMappingModal extends Vue {

  get state(): DashboardState {
    return this.$store.state
  }

  get foreignNetworkName() {
    return this.state.ethereum.genericNetworkName
  }

  get visible() {
    return this.state.gateway.requireMapping === true
  }

  set visible(value) {
    // do nothing as state hundles this
  }

  mappingChoice: string = ""

  privateKey: string = ""

  // naive
  keyRegex = /^[A-Za-z0-9+/]{84}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

  get isPKValid() {
    return this.privateKey === "" ? null : this.keyRegex.test(this.privateKey)
  }

  get validInput() {
    return this.mappingChoice === "generate" ||
      (this.mappingChoice === "existing" && this.isPKValid === true)
  }

  createMapping() {
    // clear clip board
    this.$copyText(" ")
    const { chainId } = this.state.plasma
    if (this.mappingChoice === "generate") {
      gatewayModule.createMapping("")
    } else if (this.mappingChoice === "existing") {
      gatewayModule.createMapping(this.privateKey)
    }
  }

  get loomAddress() {
    const pk = CryptoUtils.B64ToUint8Array(this.privateKey)
    const pubKey = CryptoUtils.publicKeyFromPrivateKey(pk)
    const address = LocalAddress.fromPublicKey(pubKey).toString()
    return address
  }
}
</script>