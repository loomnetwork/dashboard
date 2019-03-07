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
          <form>
      <b-container style="margin: 16px 0;padding: 0;">
        <b-row>
          <b-col>
            <b-form-input
              type="number"
              :placeholder="'max. ' + balance"
              v-model="transferAmount"
              :max="balance"
              :min="1"
              pattern="[1-9]\d*"
              step="1"
              @keyup="validateAmount"
            />
          </b-col>
          <b-col>
            <b-btn variant="outline-primary" @click="transferAmount = Math.floor(balance)">all ({{balance}})</b-btn>
          </b-col>
        </b-row>
      </b-container>
      <b-btn @click="startTransfer" variant="primary" :disabled="amountErrors.length > 0">Transfer</b-btn>
      &nbsp;<span class="error" v-for="e in amountErrors" :key="e">- {{e}} </span>
        </form>
    </div>
    <div v-else-if="step==2" class="approve-transfer">
      <div v-if="approvalPromise" class="pending">
        <b-spinner variant="primary" label="Spinning"/>
        <p><slot name="pendingMessage"></slot></p>
      </div>
      <div v-else-if="hasTransferFailed" class="failure">
        <p><slot name="failureMessage">{{errorMessage}}</slot></p>
        <b-btn @click="retryTransfer">Retry</b-btn>
      </div>
    </div>
    <div v-else-if="step==3" class="complete-transfer">
      <div v-if="!resolveTxSuccess || txSuccessPromise" class="pending">
        <b-spinner variant="primary" label="Spinning"/>
        <p>
          <slot name="confirmingMessage">Approval detected.</slot>
          <a target="_blank" :href="etherscanApprovalUrl" class="hash">{{txHash}}</a>
        </p>
        <b-btn v-if="txSuccessPromise === null" @click="reset" variant="outline-primary">new transfer</b-btn>
      </div>
      <div v-else-if="resolveTxSuccess" class="failure">
        <p><slot name="successTxt">Transaction sent:</slot><br/>
        Tx: <a target="_blank" :href="etherscanDepositUrl" class="hash">{{txHash}}</a></p>
        <b-btn v-if="txSuccessPromise === null" @click="reset" variant="outline-primary">new transfer</b-btn>
      </div>
    </div>
  </div>
</template>
<script>
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import { createNamespacedHelpers } from 'vuex'

const DPOSStore = createNamespacedHelpers('DPOS')


@Component({
  props: [
    "balance",          // number
    "transferAction",   // function (amount) => Promise<TransactionReceipt>
    "resolveTxSuccess", // function (TransactionReceipt) => Promise<void>
    "executionTitle"
  ],
  computed: {
    ...DPOSStore.mapState([
      'gatewayBusy',
    ]),
  }
})
export default class TransferStepper extends Vue {
  errorMessage = ''
  step = 1;
  transferAmount = 1;
  tx = null;
  txHash = ''
  etherscanApprovalUrl = ''
  etherscanDepositUrl = ''
  // {Promise} approval/execution promise
  approvalPromise = null;
  // set to true when approvalPromise fails
  hasTransferFailed = false;
  txSuccessfull = false
  // only used when resolveTxSuccess is provided
  txSuccessPromise = null;

  amountErrors = []

  validateAmount() {
    const errors = []
    const num = new Number(this.transferAmount)
    const int = Math.floor(num)
    if (int != num) {
      errors.push('Only round amounts allowed')
    }
    if (int < 1) {
      errors.push('At least 1 loom')
    }
    if (int > this.balance) {
      errors.push('Mot enough funds in your account')
    }
    this.amountErrors = errors
  }


  startTransfer() {
    console.log("initiating transfer " + this.transferAmount)
    this.approvalPromise = this.transferAction(this.transferAmount).then(
      async (tx) => {
        this.transferExecuted(tx)
      },
      error => this.transferFailed(error)
    );
    this.step = 2;
  }

  transferExecuted(tx) {
    if (tx) {
      this.tx = tx
      this.txHash = tx.hash
      this.etherscanApprovalUrl = `https://etherscan.io/tx/${tx.hash}`
      
      if (this.resolveTxSuccess) {
        // resolved of deposit
        this.txSuccessPromise = this.resolveTxSuccess(this.transferAmount, tx )        
        this.txSuccessPromise.then((tx) => {
          this.etherscanDepositUrl = `https://etherscan.io/tx/${tx.hash}`
          this.transferSuccessful(), console.error
        })

      } else {
        // resolved of withdraw
        this.$emit('withdrawalDone'); //this will call afterWithdrawalDone() of myAccount page
      }
      this.step = 3;
    } else {
      // withdraw fail: in IF case of executeWithdrawal()
      this.transferFailed(new Error("signature, amount didn't get update yet."))
    }

  }

  transferFailed(error) {
    if (error.message.includes("User denied transaction signature")) {
      this.errorMessage = "You rejected the transaction"
      this.$emit('withdrawalFailed'); //this will call afterWithdrawalFailed() of myAccount page 
      if (this.resolveTxSuccess) {
        // set to true only deposit case, this will shoe retry button
        this.hasTransferFailed = true;
      }
    } 
    else if(error.message.includes("signature, amount didn't get update yet") || this.resolveTxSuccess == undefined) {
      this.$emit('withdrawalFailed'); //this will call afterWithdrawalFailed() of myAccount page      
    }
    else {
      this.errorMessage = "Transfer failed for unknown reason..."
      console.error('transferFailed',error)
      this.hasTransferFailed = true;
      // report to sentry
    }
    
    this.approvalPromise = null;
   
    
  }

  retryTransfer() {
    this.hasTransferFailed = false;
    console.log(this.transferAmount)
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
input:invalid {
  border: 1px solid red;
  color: red;

}
.error {
  color: red;
}
</style>
