<template>
  <b-modal
    lazy
    id="deposit-form"
    title="BootstrapVue"
    v-model="visible"
    :busy="true"
    no-close-on-esc
    no-close-on-backdrop
    hide-header-close
    hide-footer
  >
    <template slot="modal-title">Approve deposit</template>
    <div v-if="!status">
      <form>
        <b-container style="margin: 16px 0;padding: 0;">
          <b-row>
            <b-col>
              <b-form-input
                type="number"
                :placeholder="'Max. ' + userBalance.mainnetBalance"
                :max="userBalance.mainnetBalance"
                :min="1"
                v-model="transferAmount"
                pattern="[1-9]\d*"
                step="1"
                @keyup="validateAmount"
              />
            </b-col>
            <b-col>
              <b-btn
                variant="outline-primary"
                @click="depositAll"
              >{{ $t("transfer_all", {amount: userBalance.mainnetBalance}) }}</b-btn>
            </b-col>
          </b-row>
        </b-container>
        <div class="error" v-for="e in amountErrors" :key="e">- {{e}}</div>
        <footer style="display:flex">
          <b-btn @click="close()">Cancel</b-btn>
          <span style="flex:1"></span>
          <b-btn @click="sendApproval" variant="primary" :disabled="amountErrors.length > 0">Confirm</b-btn>
        </footer>
      </form>
    </div>
    <div v-else-if="status === 'sending'">
      <p class="lead">{{ $t("components.gateway.approval.sending") }}</p>
    </div>
    <div v-else-if="status === 'failed'">
      <p class="lead">{{ $t("components.gateway.approval.failure") }}</p>
      <b-btn @click="close" variant="primary">Close</b-btn>
    </div>
    <div v-else-if="status === 'sent'">
      <p class="lead">{{ $t("components.gateway.approval.sent") }}</p>
      <b-btn @click="close" variant="primary">Close</b-btn>
    </div>
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { ethers } from "ethers"

import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from 'vuex-class'
import { formatToCrypto } from '@/utils';

const dposModule = namespace('DPOS')

@Component
export default class DepositForm extends Vue {

  @dposModule.State("userBalance")
  userBalance: {
    loomBalance: any,
    mainnetBalance: any,
  }

  @dposModule.State("showDepositForm")
  showDepositForm: boolean

  @dposModule.Mutation("setShowDepositForm")
  setShowDepositForm

  @dposModule.Action("approveDeposit")
  approveDeposit: Function

  // vue returns either number or empty string for input number
  transferAmount: number | "" = ""
  amountErrors: string[] = []

  status: string = ''


  get visible() {
    console.log('showDepositForm', this.showDepositForm)
    return this.showDepositForm
  }

  set visible(val) {
    if (val === false) {
      this.setShowDepositForm(false)
      this.status = ''
      this.transferAmount = ""
      this.amountErrors.length === 0
    }
  }

  close() {
     this.visible = false
  }

  depositAll() {
    this.transferAmount = Number.parseInt("" + this.userBalance.mainnetBalance, 10)
  }

  validateAmount() {
    const errors: string[] = []
    const input = this.transferAmount
    if (input === "") {
      return errors.push('Invalid amount')
    }
    const int = Number.parseInt("" + input, 10)
    if (int != input) errors.push('Only round amounts allowed')
    if (int < 1) errors.push('At least 1 loom')
    if (int > this.userBalance.mainnetBalance) errors.push('Not enough funds in your account')
    this.amountErrors = errors
  }

  async sendApproval(bvModalEvt) {
    this.validateAmount()
    if (this.amountErrors.length) return
    // Prevent modal from closing
    bvModalEvt.preventDefault()
    this.status = "sending"
    try {
      await this.approveDeposit("" + this.transferAmount)
      this.status = "sent"
    } catch (e) {
      this.status = "failed"
      // todo tell the user about it
      console.error(e)
    }
  }

}
</script>