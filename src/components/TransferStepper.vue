<template>
  <div>
    <b-button v-b-modal.modalPrevent variant="outline-primary" @click="show = !show">{{buttonLabel}}</b-button>
    <b-modal
      id="gateway-transfer"
      title="BootstrapVue"
      v-model="show"
      :busy="true"
      no-close-on-esc
      no-close-on-backdrop
      hide-header-close
      hide-footer
    >
      <template slot="modal-title">{{buttonLabel}}</template>
      <header class="stepper-header">
        <h4 :class="{ active: step == 1 }">
          <i>1</i> Set amount
        </h4>
        <h4 :class="{ active: step == 2 }">
          <i>2</i>
          {{ executionTitle || "Approve transfer"}}
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
                  type="text"
                  :placeholder="'max. ' + balance"
                  v-model="transferAmount"
                  pattern="[1-9]\d*"
                  step="1"
                  @keyup="validateAmount"
                />
              </b-col>
              <b-col>
                <b-btn variant="outline-primary" @click="transferAll">all ({{balance}})</b-btn>
              </b-col>
            </b-row>
          </b-container>
          <div class="error" v-for="e in amountErrors" :key="e">- {{e}}</div>
          <footer style="display:flex">
            <b-btn @click="show = false">Cancel</b-btn>
            <span style="flex:1"></span>
            <b-btn @click="startTransfer" variant="primary" :disabled="amountErrors.length > 0">Next</b-btn>
          </footer>
        </form>
      </div>
      <div v-else-if="step==2" class="approve-transfer">
        <div v-if="approvalPromise" class="pending">
          <b-spinner variant="primary" label="Spinning"/>
          <p>
            <slot name="pendingMessage"></slot>
          </p>
        </div>
        <div v-else-if="hasTransferFailed" class="failure">
          <p>
            <slot name="failureMessage">{{errorMessage}}</slot>
          </p>
          <b-btn @click="retryTransfer">Retry</b-btn>
        </div>
      </div>
      <div v-else-if="step==3" class="complete-transfer">
        <div v-if="!resolveTxSuccess || txSuccessPromise" class="pending">
          <b-spinner variant="primary" label="Spinning"/>
          <p>
            <slot name="confirmingMessage">Approval detected.</slot>
            <br>
            <a
              target="_blank"
              v-if="txHash"
              :href="etherscanApprovalUrl"
              class="hash"
            >View on EtherScan</a>
          </p>
          <b-btn
            v-if="txSuccessPromise === null"
            @click="reset"
            variant="outline-primary"
          >new transfer</b-btn>
        </div>
        <div v-else-if="resolveTxSuccess" class="failure">
          <p>
            <slot name="successTxt">Transaction sent:</slot>
            <br>
            <a
              target="_blank"
              v-if="txHash"
              :href="etherscanDepositUrl"
              class="hash"
            >View on EtherScan</a>
          </p>
          <p>
            Mining transaction, please access the
            <router-link to="/history">history page</router-link>to see the progress.
          </p>
          <b-btn v-if="txSuccessPromise === null" @click="hide" variant="outline-primary">close</b-btn>
        </div>
      </div>
    </b-modal>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator"
import { createNamespacedHelpers, Store } from "vuex"
import { DashboardState } from "../types"

@Component
export default class TransferStepper extends Vue {

  @Prop({ required: true })
  balance!: number
  @Prop({ required: true })
  transferAction!: (amount) => Promise<any>
  @Prop({ required: true })
  resolveTxSuccess!: (amount, tx) => Promise<any>
  @Prop({ required: false })
  executionTitle: string = ""
  @Prop({ required: false })
  buttonLabel: string = ""

  show = false
  errorMessage = ""
  step = 1
  transferAmount = 1
  tx = null
  txHash = ""
  etherscanApprovalUrl = ""
  etherscanDepositUrl = ""
  // {Promise} approval/execution promise
  approvalPromise: Promise<any> | null = null
  // set to true when approvalPromise fails
  hasTransferFailed = false
  txSuccessfull = false
  // only used when resolveTxSuccess is provided
  txSuccessPromise: Promise<any> | null = null
  etherscanTxUrl: string = ""

  amountErrors: string[] = []

  get gatewayBusy() {
    return (this.$store as Store<DashboardState>).state.DPOS.gatewayBusy
  }

  validateAmount() {

    const errors: string[] = []
    const num = parseInt("" + this.transferAmount, 10)
    const int = Math.floor(num)
    if (!/^[1-9]\d*$/.test("" + this.transferAmount)) {
      errors.push("Please enter a valid amount.")
    }
    if (int !== num) {
      errors.push("Only round amounts allowed.")
    }
    if (int < 1) {
      errors.push("At least 1 loom")
    }
    if (int > this.balance) {
      errors.push("Not enough funds in your account")
    }
    this.amountErrors = errors
  }

  startTransfer() {
    console.log("initiating transfer " + this.transferAmount)

    this.approvalPromise = this.transferAction(this.transferAmount)
      .then(
        (tx) => this.transferExecuted(tx),
        (error) => this.transferFailed(error),
      )
    this.step = 2
  }

  hide() {
    this.$root.$emit("bv::hide::modal", "gateway-transfer")
  }

  transferAll() {
    this.transferAmount = Math.floor(this.balance)
    this.amountErrors = []
  }

  transferExecuted(tx) {
    if (tx) {
      this.tx = tx
      this.txHash = tx.hash
      this.etherscanApprovalUrl = `https://etherscan.io/tx/${this.txHash}`
      if (this.resolveTxSuccess) {
        // resolved of deposit
        this.txSuccessPromise = this.resolveTxSuccess(this.transferAmount, tx)
        this.txSuccessPromise.then(() => {
          this.etherscanDepositUrl = `https://etherscan.io/tx/${this.txHash}`
          this.transferSuccessful()
        }, console.error)

      } else {
        // resolved of withdraw
        // this will call afterWithdrawalDone() of myAccount page
        this.$emit("withdrawalDone")
      }
      this.step = 3
    } else {
      // withdraw fail: in IF case of executeWithdrawal()
      this.transferFailed(new Error("signature, amount didn't get update yet."))
    }

  }

  transferFailed(error) {
    if (error.message.includes("User denied")) {
      this.errorMessage = "You rejected the transaction"
      // this will call afterWithdrawalFailed() of myAccount page
      this.$emit("withdrawalFailed")
      if (this.resolveTxSuccess) {
        // set to true only deposit case, this will shoe retry button
        this.hasTransferFailed = true
      }
    } else if (error.message.includes("signature, amount didn't get update yet") ||
      this.resolveTxSuccess === undefined
    ) {
      // this will call afterWithdrawalFailed() of myAccount page
      this.$emit("withdrawalFailed")
    } else if (error.message.includes("Ledger") || error.message.includes("U2F")) {
      this.errorMessage = "Please update your Ledger firmware AND enable Contract Data setting on your device."
      console.error("transferFailed", error)
      this.hasTransferFailed = true
    } else {
      this.errorMessage = "Transfer failed for unknown reason..."
      console.error("transferFailed", error)
      this.hasTransferFailed = true
      // report to sentry
    }
    this.hide()
    this.reset()
    this.approvalPromise = null
  }

  retryTransfer() {
    this.hasTransferFailed = false
    console.log(this.transferAmount)
    this.startTransfer()
  }

  transferSuccessful() {
    this.txSuccessPromise = null
    this.txSuccessfull = true
  }

  reset() {
    this.step = 1
    this.transferAmount = 1
    this.hasTransferFailed = false
    this.tx = null
    this.txHash = ""
    this.etherscanTxUrl = ""
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
    > i {
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
  > .spinner-border {
    margin-right: 12px;
  }
  > p {
    margin-top: 4px;
  }
}
.hash {
  font-family: monospace;
  font-size: 16px;
  text-decoration: underline;
}
input:invalid {
  border: 1px solid red;
  color: red;
}
.error {
  color: red;
}

// Medium devices (tablets, 768px and up)
// todo make this mobile first
@media (max-width: 767px) {
  #gateway-transfer > .modal-dialog {
    width: 100vw;
    height: 100vh;
    margin: 0;
    bottom: 0;
    > .modal-content {
      height: 100vh;
      width: 100vw;
    }
    .modal-body {
      display: flex;
      flex-direction: column;
    }
  }
  #gateway-transfer .modal {
    padding: 0 !important;
  }
  #gateway-transfer .modal-dialog {
    max-width: 100%;
    height: 100%;
    margin: 0;
  }
  #gateway-transfer .modal-content {
    border: 0;
    border-radius: 0;
    min-height: 100%;
    height: auto;
  }
  .stepper-header {
    display: block;

    > h4 {
      width: auto;
    }
    > h4:not(.active) {
      display: none;
    }
  }
}
</style>
