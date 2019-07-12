<template>
  <b-modal lazy id="select-chain-modal" v-model="visible" hide-footer>
    <template slot="modal-title">{{ title }}</template>
    <template slot="modal-header-close">
      <button type="button" class="close" aria-label="Close" @click="resetModal">
        <span aria-hidden="true">&times;</span>
      </button>
    </template>
    <b-form-group :label="label">
      <div class="button-group">
        <div class="chain-option" v-for="chain in chains" :key="chain" @click="onSelect(chain)">
          <p>{{ chain | capitalizeWord }}</p>
          <img :src="`../../assets/${chain}_logo.png`" class="logo" alt>
        </div>
      </div>
    </b-form-group>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import { capitalize } from "@/utils"
import { DashboardState } from "../../types"
import { gatewayModule } from "../../store/gateway"

@Component
export default class SelectChainModal extends Vue {
  @Prop(String) type!: "DEPOSIT" | "WITHDRAW"
  @Prop(String) token!: string

  setShowDepositForm = gatewayModule.setShowDepositForm
  setShowWithdrawForm = gatewayModule.setShowWithdrawForm

  get transferRequest() {
    return this.state.gateway.transferRequest
  }

  get visible() {
    return this.transferRequest.type !== "" && this.transferRequest.chain === ""
  }

  set visible(value) {
    if (value === false) {
      this.resetModal()
    }
  }

  get label() {
    return this.transferRequest.type === "DEPOSIT" ? "From" : "To"
  }

  get title() {
    if (this.transferRequest.type) {
      return capitalize(this.transferRequest.type.toLowerCase())
    }
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get chains(): string[] {
    return this.state.chains
  }

  onSelect(chain: string) {
    gatewayModule.setTransferRequest({
      type: this.transferRequest.type,
      chain,
      token: this.transferRequest.token,
    })
  }

  resetModal() {
    gatewayModule.clearTransferRequest()
  }
}
</script>

<style lang="scss" scoped>
.logo {
  height: 80px;
}
.button-group {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.chain-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  padding: 1em;
  padding-bottom: 1.5em;
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0;
  margin: 1em;
  &:hover {
    cursor: pointer;
    box-shadow: rgba(219, 219, 219, 0.56) 0px 6px 8px 0;
    background-color: rgba(0, 0, 0, 0.01);
  }
}
.footer-button {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
