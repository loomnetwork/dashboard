<template>
  <b-modal
    id="transfer-tokens-form-modal"
    ref="modalRef"
    title="Transfer Token"
    hide-footer
    @hide="resetModal"
  >
    <b-card>
      <h6>Token type: {{ this.plasma.selectedToken }}</h6>
      <h6>Your token balance: {{ balance }} {{ this.plasma.selectedToken }}</h6>
      <div class="input-section">
        <span>Amount: (max: {{ balance }} )</span>
        <amount-input
          :min="1"
          :max="Number(balance)"
          :round="false"
          v-model="transferAmount"
          @isError="onAmountError"
        />
      </div>
      <div class="input-section">
        <span>Receiver Loom Address:</span>
        <input-address
          v-model="receiverAddress"
          placeholder="'Loom Address'"
          @isValid="isValidAddressFormat"
        />
      </div>
      <b-button type="button" @click="transferToken()">Transfer</b-button>
    </b-card>
  </b-modal>
</template>

<script lang="ts">

import { Component, Watch, Vue, Prop } from "vue-property-decorator"
import { PlasmaState } from "../../store/plasma/types";
import { DashboardState } from "@/types";
import { plasmaModule } from "../../store/plasma";
import AmountInput from "@/components/AmountInput.vue";
import BN from "bn.js"
import { toBigNumber, ZERO } from "@/utils"
import { formatTokenAmount } from "@/filters"
import InputAddress from "../InputAddress.vue";

@Component({
  components: {
    AmountInput,
    InputAddress
  }
})

export default class TransferTokensFormModal extends Vue {

  transfer = plasmaModule.transfer
  transferAmount: BN = ZERO
  receiverAddress: string = ""
  amountError = false
  isValidAddress = false

  get state(): DashboardState {
    return this.$store.state
  }
  get plasma(): PlasmaState {
    return this.state.plasma
  }

  get balance() {
    const balance = this.state.plasma.coins[this.plasma.selectedToken].balance
    return formatTokenAmount(balance)
  }

  async transferToken() {
    //const amount = new BN(""+this.transferAmount).mul(new BN(""+10**18))
    this.transfer({
      symbol: this.plasma.selectedToken,
      weiAmount: this.transferAmount,
      to: this.receiverAddress.replace("loom", "0x"),
    })
    this.$root.$emit("bv::hide::modal", "transfer-tokens-form-modal")
  }

  onAmountError(val) {
    this.amountError = val
  }

  resetModal() {
    this.receiverAddress = ""
    this.isValidAddress = false
  }

  isValidAddressFormat(isValid) {
    this.isValidAddress = isValid

  }
}
</script>
<style scoped>
.input-section {
  margin: 16px 0;
}
</style>
