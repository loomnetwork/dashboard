<template>
    <b-modal 
    id="transfer-tokens-form-modal"
    ref="modalRef"
    title="Transfer Token"
    @show="resetModal"
    @hide="resetModal">
        <b-card>
            <h6> Token type: {{ state.plasma.tokenSelected }} </h6>
            <h6> Your token balance: {{ balance | tokenAmount }} {{ state.plasma.tokenSelected }} </h6>
            Amount: (max: {{ balance | tokenAmount }} )
            <amount-input :min="1" :max="balance | tokenAmount" v-model="transferAmount" @isError="onAmountError"/>
            Receiver Loom Address:
            <b-input type="text" v-model="receiverAddress" placeholder="Loom Address"></b-input>
            <b-button type="button" @click="transferToken()">Transfer</b-button>
        </b-card>
    </b-modal>
</template>

<script lang="ts">

import { Component, Watch, Vue } from "vue-property-decorator"
import { PlasmaState } from "../../store/plasma/types";
import { DashboardState } from "@/types";
import { plasmaModule } from "../../store/plasma";
import AmountInput from "@/components/AmountInput.vue";
import BN from "bn.js"
import { toBigNumber } from "@/utils"
@Component({
  components: {
    AmountInput,
  }
})

export default class TransferTokensFormModal extends Vue{

    transfer = plasmaModule.transfer
    transferAmount: number = 0
    receiverAddress: string = ""


    get state() : DashboardState {
        return this.$store.state
    }

    get balance(){
      return this.state.plasma.coins[this.state.plasma.tokenSelected].balance
    }

    transferToken(){
      const amount = new BN(""+this.transferAmount).mul(new BN(""+10**18))
      this.transfer({
        symbol: this.state.plasma.tokenSelected,
        tokenAmount: amount,
        to: this.receiverAddress 
      })
      this.$root.$emit("bv::hide::modal", "transfer-tokens-form-modal")
    }

    onAmountError(val){
      console.log('val:', val);
    }

    resetModal(){
      this.receiverAddress = ""
    }
    
}
</script>
<style>

</style>