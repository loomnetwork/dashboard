<template>
  <div>
    <header class="stepper-header">
      <h4 :class="{ active: step == 1 }">
        <i>1</i> Select amount
      </h4>
      <h4 :class="{ active: step == 2 }">
        <i>2</i> {{ executionTitle || "Approve transfer"}}
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
              :min="0"
              step="1"
            />
          </b-col>
          <b-col>
            <b-btn variant="outline-primary" @click="transferAmount = balance">all ({{balance}})</b-btn>
          </b-col>
        </b-row>
      </b-container>
      <b-btn @click="startTransfer" variant="primary" :disabled="!transferAmount ||transferAmount <= 0 || transferAmount > balance ">Transfer</b-btn>
    </div>
    <div v-else-if="step==2" class="approve-transfer">
      <div v-if="approvalPromise" class="pending">
        <b-spinner variant="primary" label="Spinning"/>
        <p><slot name="pendingMessage"></slot></p>
      </div>
      <div v-else-if="hasTransferFailed" class="failure">
        <p><slot name="failureMessage">The approval failed (timeout or user rejected)</slot></p>
        <b-btn @click="retryTransfer">Retry</b-btn>
      </div>
    </div>
    <div v-else-if="step==3" class="complete-transfer">
      <div v-if="!resolveTxSuccess || txSuccessPromise" class="pending">
        <b-spinner variant="primary" label="Spinning"/>
        <p><slot name="confirmingMessage">Approval detected. Waiting for Ethereum confirmation.</slot>
        Tx: <a :href="etherscanTxUrl" class="hash">{{txHash}}</a></p>
        <b-btn v-if="txSuccessPromise === null" @click="reset" variant="outline-primary">new transfer</b-btn>
      </div>
      <div v-else-if="resolveTxSuccess" class="failure">
        <p><slot name="successTxt">Transaction succeeded.</slot><br/>
        Tx: <a :href="etherscanTxUrl" class="hash">{{txHash}}</a></p>
        <b-btn v-if="txSuccessPromise === null" @click="reset" variant="outline-primary">new transfer</b-btn>
      </div>
    </div>
  </div>
</template>
<script>
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component({
  props: [
    "balance",          // number
    "transferAction",   // function (amount) => Promise<TransactionReceipt>
    "resolveTxSuccess", // function (TransactionReceipt) => Promise<void>
    "executionTitle"
  ]
})
export default class TransferStepper extends Vue {

  step = 1;
  transferAmount = 0;
  tx = null;
  txHash = ''
  etherscanTxUrl = ''
  // {Promise} approval/execution promise
  approvalPromise = null;
  // set to true when approvalPromise fails
  hasTransferFailed;
  txSuccessfull = false
  // only used when resolveTxSuccess is provided
  txSuccessPromise = null;

  startTransfer() {
    console.log("initiating transfer " + this.transferAmount)
    this.approvalPromise = this.transferAction(this.transferAmount).then(
      tx => this.transferExecuted(tx),
      error => this.transferFailed(error)
    );
    this.step = 2;
  }

  transferExecuted(tx) {
    console.log("transfer executed " + tx.hash)
    this.tx = tx
    this.txHash = tx.hash
    this.etherscanTxUrl = `https://etherscan.io/tx/${tx.hash}`
    if (this.resolveTxSuccess) {
      this.txSuccessPromise = this.resolveTxSuccess( tx )
      this.txSuccessPromise.then(() => this.transferSuccessful(), console.error)
    }
    this.step = 3;
  }

  transferFailed(error) {
    console.error('transferFailed',error)
    this.approvalPromise = null;
    this.hasTransferFailed = true;
  }

  retryTransfer() {
    this.hasTransferFailed = false;
    this.startTransfer();
  }

  transferSuccessful() {
    this.txSuccessPromise = null;
    this.txSuccessfull = true
  }

  reset() {
    this.step = 1
    this.transferAmount = 0
    this.hasTransferFailed = false
    this.tx = null;
    this.txHash = '';
    this.etherscanTxUrl = ''
    this.approvalPromise = null
    this.txSuccessPromise = null
    this.txSuccessfull = false

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
    >i {
        font-style: normal;
        display: inline-block;
        width: 21px;
        text-align: center;
        border-radius: 12px;
        border: 1px solid;
        height: 21px;
        font-size: 14px;
        line-height: 20px;
        margin-right: 4px;
    }
  }
}
.pending {
    display: flex;
    flex-wrap: wrap;
    margin: 12px 0;
    border-top: 1px solid #ededed;
    padding: 24px 12px;
    >.spinner-border {
      margin-right: 12px
    }
    >p {
          margin-top: 4px;
    }
}
.hash {
  font-family: monospace;font-size: 16px;text-decoration: underline;
}
</style>
