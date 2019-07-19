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
        This is the first time you are accessing the dashboard with this account.
        <br />Choose weither to map to a new loom account or an existing one.
      </p>
      <b-form-group>
        <b-form-radio
          v-model="mappingChoice"
          name="mapping-existing"
          value="existing"
        >Map to an existing loom account</b-form-radio>
        <b-form-radio
          v-model="mappingChoice"
          name="mapping-choice"
          value="generate"
        >Create a new account</b-form-radio>
      </b-form-group>
      <div v-if="mappingChoice === 'existing'">
        <div class="mb-2">
          <label style="margin:0">Ethereum address</label>
          <code>{{$store.state.ethereum.address}}</code>
        </div>
        <b-form-input
          id="input-formatter"
          v-model="privateKey"
          placeholder="Loom private key (base64)"
          aria-describedby="input-formatter-help"
          :state="isPKValid"
        ></b-form-input>
        <b-form-text
          id="input-formatter-help"
        >The private key is used to sign the mapping and is then discarded.</b-form-text>
      </div>
    </div>
    <template slot="modal-footer">
      <b-button variant="primary" @click="createMapping" :disabled="validInput === false">Continue</b-button>
    </template>
  </b-modal>
</template>
<script lang="ts">
import { Component, Watch, Vue, Prop, Provide } from "vue-property-decorator"
import InputAddress from "@/components/InputAddress.vue"
import { gatewayModule } from '../../store/gateway';
import { DashboardState } from '../../types';
import { Address } from 'loom-js';
import { formatFromLoomAddress } from '../../utils';

@Component({
  components: {
    InputAddress,
  },
})
export default class AccountMappingModal extends Vue {

  get state(): DashboardState {
    return this.$store.state
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


}
</script>