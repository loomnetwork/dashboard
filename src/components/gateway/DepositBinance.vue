<template>
  <b-modal id="deposit-binance">
    <!-- <template slot="modal-title">Deposit</template> -->
    <div class="deposit-container">
      <h3>Deposit to Plasmachain from Binance</h3>
      <span class="step" v-if="!isProcessTransaction">Step {{ step }} of 2</span>
      <div class="content" v-if="step === 1">
        <div class="description">Please go to <a :href="`https://binance.org/en/balances`">https://binance.org/en/balances</a> and fill in the form</div>
        <div class="deposit-form">
          <p>Select token</p>
          <b-form-select v-model="selected">
            <option :value="null">Please select an option</option>
            <option value="a">Option A</option>
            <option value="b" disabled>Option B (disabled)</option>
          </b-form-select>
          <p>Gateway Address</p>
          <b-form-input placeholder="Gateway Address"></b-form-input>
          <p>Amount to send</p>
          <b-form-input placeholder="Amount"></b-form-input>
          <p>Memo</p>
          <b-form-textarea rows="3" placeholder="Memo text"></b-form-textarea>
          <div class="space-between">
            <p>Fee: 0.00000 BNB</p>
            <p>Available: 0.0000000</p>
          </div>
        </div>
      </div>
      <div class="content to-left mb-3" v-else-if="step === 2">
        <p>Transaction hash from</p>
        <a href="https://testnet.binance.org/en/transactionHistory">https://testnet.binance.org/en/transactionHistory</a>
        <b-form-input v-model="txHash" placeholder="txHash"></b-form-input>
      </div>
      <div class="content" v-else-if="step === 3">
        <img src="../../assets/loomy-running.gif" class="loomy_running" alt="">
        <h4>Please be patient, Loomy is on it!</h4>
        <h4 style="color: #919598;">This may take several minutes.</h4>
        <h4 style="color: #e11f61;">Please don't close or refresh your browser!</h4>
      </div>
      <div class="content" v-else-if="step === 4">
        <p>transaction Complete</p>
      </div>
    </div>
    <div slot="modal-footer" class="w-100 space-between" :class="{ hide: isProcessTransaction }">
      <b-button @click="onBack">{{ backButtonText }}</b-button>
      <b-button variant="primary" @click="onNext">Next</b-button>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import { capitalize } from "@/utils"

@Component
export default class DepositBinance extends Vue {
  step: number = 1
  txHash: string = ""

  isProcessTransaction = false

  get backButtonText() {
    return this.step === 1 ? "Cancel" : "Back"
  }
  onBack() {
    if (this.step === 1) {
      this.$root.$emit("bv::hide::modal", "deposit-binance") // Hide modal
    } else {
      this.step -= 1 // Decrease step
    }
  }
  onNext() {
    this.step += 1 // Increment step
    if (this.step === 3) {
      // Making transaction
      this.isProcessTransaction = true
      setTimeout(() => {
        this.step += 1
      }, 5000)
    }
  }
}
</script>

<style lang="scss" scoped>
h3 {
  color: #3b4248;
  font-weight: 600;
  font-size: 24px;
  text-align: center;
}

h4 {
  color: #4d4ccd;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 1rem;
}

p {
  color: gray;
  margin: 16px 0 4px 4px;
}

.to-left {
  justify-content: flex-start !important;
  align-items: flex-start !important;
}

.loomy_running {
  width: 30%;
  margin: 18px;
}

.deposit-form {
  margin: 1em 0;
  width: 100%;
}

.description {
  font-size: 16px;
  color: #333a40;
}

.flex-column {
  display: flex;
  flex-direction: column;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.step {
  font-size: 16px;
  color: #919598;
  text-align: center;
  margin: 1em;
}
.button-group {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.token-option {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.space-between {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.deposit-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.hide {
  display: none;
}
</style>
