<template>
  <b-modal
    id="transfer-tokens-form-modal"
    ref="modalRef"
    :title="$t('components.modals.transfer_token_form_modal.title')"
    hide-footer
    @hide="resetModal"
  >
    <b-card>
      <h6>{{ $t('components.modals.transfer_token_form_modal.token_type') }} {{ token }}</h6>
      <h6>{{ $t('components.modals.transfer_token_form_modal.balance') }} {{ balance | tokenAmount(tokenDecimals)}} {{ token }}</h6>
      <div class="input-section">
        <i18n path="components.modals.transfer_token_form_modal.amount">
          <span place="amount"> {{ balance | tokenAmount(tokenDecimals)}} </span>
        </i18n>
        <amount-input
          :min="min"
          :max="balance"
          :round="false"
          :decimals="tokenDecimals"
          :symbol="token"
          v-model="transferWeiAmount"
          @isError="onAmountError"
        />
      </div>
      <div class="input-section">
        <span>{{ $t('components.modals.transfer_token_form_modal.receiver_address') }}</span>
        <input-address
          v-model="receiverAddress"
          chain="loom"
          :blacklist="[ownAddress]"
          :placeholder="$t('input_placeholder.loom_addr')"
          @isValid="isValidAddressFormat"
        />
      </div>
      <b-button type="button" :disabled="valid === false" @click="transferToken()">{{ $t('components.modals.transfer_token_form_modal.transfer') }}</b-button>
    </b-card>
  </b-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator"
import { PlasmaState } from "@/store/plasma/types"
import { DashboardState } from "@/types"
import { plasmaModule } from "@/store/plasma"
import AmountInput from "@/components/AmountInput.vue"
import BN from "bn.js"
import InputAddress from "../InputAddress.vue"
import { ZERO } from "@/utils"

@Component({
  components: {
    AmountInput,
    InputAddress,
  },
})

export default class TransferTokensFormModal extends Vue {

  @Prop({ required: true }) token!: string

  transfer = plasmaModule.transfer
  transferWeiAmount: BN = ZERO
  receiverAddress: string = ""
  amountError = false
  isValidAddress = false
  min = new BN(1)

  get state(): DashboardState {
    return this.$store.state
  }
  get plasma(): PlasmaState {
    return this.state.plasma
  }

  get balance() {
    const balance = this.state.plasma.coins[this.token].balance
    return balance
  }

  get tokenDecimals() {
    return this.state.plasma.coins[this.token].decimals
  }

  get valid() {
    return this.isValidAddress && this.amountError === false
  }

  get ownAddress() {
    return this.plasma.address.replace("0x", "loom").toLowerCase()
  }

  async transferToken() {
    // const amount = new BN(""+this.transferWeiAmount).mul(new BN(""+10**18))
    this.transfer({
      symbol: this.token,
      weiAmount: this.transferWeiAmount,
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
