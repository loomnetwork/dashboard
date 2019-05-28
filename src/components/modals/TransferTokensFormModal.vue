<template>
    <b-modal 
    id="transfer-tokens-form-modal"
    ref="modalRef">
        <b-card>
            <h6> Token type: {{ state.plasma.tokenSelected }} </h6>
            <h6> Your token balance: {{balance | tokenAmount}} </h6>
            Amount: (max: {{balance | tokenAmount}} )
            <b-input type="number" v-model="transferAmount" :max="balance" :min="1"></b-input> 
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
@Component({

})

export default class TransferTokensFormModal extends Vue{

    transfer = plasmaModule.transfer
    transferAmount: number = 0
    receiverAddress: string = ""

    get state() : DashboardState {
        return this.$store.state
    }

    get balance(){
      console.log(this.state.plasma.coins.eth);
      return this.state.plasma.coins[this.state.plasma.tokenSelected].balance
    }

    transferToken(){
      this.transfer({
        symbol: this.state.plasma.tokenSelected,
        tokenAmount: this.transferAmount,
        to: this.receiverAddress 
      })
      console.log(this.balance)
      this.$root.$emit("bv::hide::modal", "transfer-tokens-form-modal")
    }
    
}
</script>
<style>

</style>
