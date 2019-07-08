<template>
  <b-modal
    id="deposit-binance"
    lazy
    @hidden="resetModal"
    v-model="visible"
    :title="title"
    no-close-on-esc
    no-close-on-backdrop
    :hide-header-close="step === 3"
  >
    <!-- <template slot="modal-title">Deposit</template> -->
    <div class="deposit-container">
      <div class="content" v-if="step === 1">
        <div class="description">
          Please go to
          <a :href="`https://binance.org/en/balances`">https://binance.org/en/balances</a> and fill in the form as shown below.
        </div>
        <div class="deposit-form">
          <p>Send Asset</p>
          <div class="flex-row my-4">
            <div class="yellow-line"></div>
            <div class="gray-line"></div>
          </div>
          <p>Select Asset</p>
          <b-form-select v-model="form.selected" :options="form.options"></b-form-select>
          <p>Gateway Address</p>
          <b-form-input placeholder="Gateway Address" :value="form.gateway" disabled></b-form-input>
          <p>Amount to send</p>
          <b-form-input placeholder="Amount" value="enter the deposit amount " disabled></b-form-input>
          <p>Memo</p>
          <b-form-textarea rows="3" placeholder="Memo text" disabled v-model="form.memo"></b-form-textarea>
        </div>
      </div>
      <div class="content" v-else-if="step === 2">
        <p>Once the transaction is processed on binance, your balance on plasmachain will be updated.</p>
      </div>
    </div>
    <div slot="modal-footer" class="w-100 space-between">
      <b-button @click="onBack">{{ backButtonText }}</b-button>
      <b-button :class="{ hide: step >= 2 }" variant="primary" @click="onNext">Next</b-button>
      <b-button :class="{ hide: step < 2 }" variant="primary" @click="visible = false">Close</b-button>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import { capitalize, formatToLoomAddress } from "@/utils"
import { DashboardState } from "../../types"

@Component
export default class DepositBinance extends Vue {

  step: number = 1
  get form() {
    const token = this.transferRequest.token
    return {
      selected: token,
      options: [
        { value: token, text: token, disabled: true },
      ],
      gateway: "<plasma account on binanxe>",
      memo: formatToLoomAddress(this.state.plasma.address),
    }

  }

  get state(): DashboardState {
    return this.$store.state
  }

  get transferRequest() {
    return this.state.gateway.transferRequest
  }

  get visible() {
    return this.transferRequest.chain === "binance"
      && this.transferRequest.type === "DEPOSIT"
  }
  get title() {
    return this.step === 4 ? "Success" : "Deposit to Plasmachain from Binance"
  }

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
  }
  resetModal() {
    this.step = 1
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

a {
  color: #4d4ccd;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 1rem;
}

p {
  color: gray;
  margin: 16px 0 4px 4px;
}

.yellow-line {
  width: 60px;
  height: 3px;
  margin-right: 10px;
  background-color: #f0b90a;
}
.gray-line {
  width: 60px;
  height: 3px;
  background-color: #dfe2e7;
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
  margin: 1.5em 0;
  width: 100%;
  padding: 0 1em 1em 1em;
  background-color: rgba(240, 185, 11, 0.08);
  border-radius: 8px;
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0;
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
  @extend .flex-column;
  justify-content: space-around;
}
.token-option {
  @extend .flex-column;
  align-items: center;
}
.space-between {
  @extend .flex-row;
  justify-content: space-between;
}
.content {
  @extend .flex-column;
  justify-content: center;
  align-items: center;
}
.deposit-container {
  @extend .flex-column;
  width: 100%;
}
.hide {
  display: none;
}
.form-control:disabled {
  background-color: white;
  cursor: text;
}
</style>
