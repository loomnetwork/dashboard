<template>
    <div>
        <header class="stepper-header">
            <h4 :class="{ active: step == 1 }">Select amount</h4>
            <h4 :class="{ active: step == 2 }">Approve transfer</h4>
            <h4 w:class="{ active: step == 3 }">Complete transfer</h4>
        </header>
    <div v-if="step==1" class="set-amount">
        <b-form-input type="number" :placeholder="'max. ' + balance" v-model="transferAmount" :max="balance" class="w-100"/>
        <i>TODO show gas required and maybe wallet ether balance?</i>
        <b-btn @click="startTransfer">Transfer</b-btn>
    </div>
    <div v-else-if="step==2" class="approve-transfer" >
        <div v-if="approvalPromise"><b-spinner variant="primary" label="Spinning" /> <p>Please approve the transfer on your wallet</p></div>
        <div v-esle-if="hasApprovalFailed" class="failure">
            <p>The approval failed</p>
            <b-btn @click="retryApproval">Retry</b-btn>
        </div>
    </div>
    <div v-else-if="step==3" class="complete-transfer"  >
        <p>Approval detected</p>
        <a :href="etherscanTxUrl">{{txHash}}</a>
        <b-spinner variant="primary" label="Spinning" /><p> Waiting for Ethereum confirmation.<p>
    </div>
</template>

<script>
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component({
  props: ['balance', 'transferAction', 'confirmationAction']
})
export default class TransferStepper extends Vue {

    @Prop({required:true})
    transferAction

    @Prop({required:true})
    balance

    step = 1
    transferAmount = balance
    hasApprovalFailed = false

    // {Promise}
    approvalPromise

    startTransfer() {
        this.approvalPromise = 
            transferAction(transferAmount).then(
                (txHash) => this.transferApproved(txHash),
                (error) => this.approvalFailed(error),
            )
        step = 2
    }

    transferApproved(txHash) {
        this.txHash = txHash
        this.etherscanUrl = `https://etherscan.io/tx/${txHash}`
        step = 3
    }

    approvalFailed(error) {
        this.hasApprovalFailed = true
    }

    retryApproval() {
        this.hasApprovalFailed = false
        this.startTransfer()
    }
}
</script>

<style lang="scss" scoped>
    .stepper-header {
        display: flex;
        > h4 {
            &.active {
                font-weight: 700;
            }
        }
    }
</style>
