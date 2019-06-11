<template>
  <b-modal id="deposit-binance">
    <!-- <template slot="modal-title">Deposit</template> -->
    <div class="deposit-container">
      <h3>Deposit to Plasmachain from Binance</h3>
      <span class="step">Step {{ step }} of 2</span>
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
        </div>
      </div>
      <div class="content" v-else-if="step === 2">
        <p>Transaction hash from</p>
        <p>Link</p>
        <b-form-input v-model="txHash" placeholder="txHash"></b-form-input>
      </div>
      <div class="content" v-else-if="step === 3">
        <p>While fetching event from transaction hash</p>
      </div>
      <div class="content" v-else-if="step === 4">
        <p>transaction Complete</p>
      </div>
    </div>
    <div slot="modal-footer" class="w-100 footer-button" :class="{ hide: isProcessTransaction }">
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
      }, 2000)
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

p {
  color: gray;
  margin: 16px 0 4px 4px;
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
.footer-button {
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
