<template>
  <div>
    <header class="stepper-header">
      <h4 :class="{ active: step == 1 }">
        <i>1</i> Select amount
      </h4>
      <h4 :class="{ active: step == 2 }">
        <i>2</i> Approve transfer
      </h4>
      <h4 :class="{ active: step == 3 }">
        <i>3</i> Complete transfer
      </h4>
    </header>
    <div v-if="step==1" class="set-amount">
      <b-container style="margin: 16px 0;padding: 0;">
        <b-row>
          <b-col>
            <b-form-input
              type="number"
              :placeholder="'max. ' + balance"
              v-model="transferAmount"
              :max="balance"
            />
          </b-col>
          <b-col>
            <b-button variant="outline-primary" @click="transferAmount = balance">all</b-button>
          </b-col>
        </b-row>
      </b-container>
      <b-btn @click="startTransfer" variant="primary">Transfer</b-btn>
    </div>
    <div v-else-if="step==2" class="approve-transfer">
      <div v-if="approvalPromise">
        <b-spinner variant="primary" label="Spinning"/>
        <p>Please approve the transfer on your wallet</p>
      </div>
      <div v-else-if="hasApprovalFailed" class="failure">
        <p>The approval failed (timeout or user rejected)</p>
        <b-btn @click="retryApproval">Retry</b-btn>
      </div>
    </div>
    <div v-else-if="step==3" class="complete-transfer">
      <p>Approval detected</p>
      <a :href="etherscanTxUrl">{{txHash}}</a>
      <b-spinner variant="primary" label="Spinning"/>
      <p>Waiting for Ethereum confirmation.</p>
      <p></p>
    </div>
  </div>
</template>
<script>
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component({
  props: ["balance", "requireApproval", "transferAction"]
})
export default class TransferStepper extends Vue {
  //@Prop({ required: true })
  //transferAction;

  step = 1;

  transferAmount;
  hasApprovalFailed = false;

  // {Promise}
  approvalPromise = null;

  startTransfer() {
    this.approvalPromise = this.transferAction(this.transferAmount).then(
      txHash => this.transferApproved(txHash),
      error => this.approvalFailed(error)
    );
    this.step = 2;
  }

  transferApproved(txHash) {
    this.txHash = txHash;
    this.etherscanUrl = `https://etherscan.io/tx/${txHash}`;
    this.step = 3;
  }

  approvalFailed(error) {
    this.hasApprovalFailed = true;
  }

  retryApproval() {
    this.hasApprovalFailed = false;
    this.startTransfer();
  }
}
</script>
<style lang="scss">
.stepper-header {
  display: flex;
  > h4 {
    font-size: 1em;
    width: 30%;

    &.active {
      font-weight: 700;
    }
  }
}
</style>
