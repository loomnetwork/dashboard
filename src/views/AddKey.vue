<template>
  <div class="container mb-5">
    <!-- Deployer Public key section -->
    <h4 class="mt-3">Deployer Public Keys</h4>
    <div v-if="publicKeys.length > 0">
      <b-card v-for="(pk, index) in publicKeys" :key="pk.hex">
        <b-row>
          <b-col cols="12" sm="6">
            <h6>{{pk[pk.defaultFormat] | loomAddress}}</h6>
          </b-col>
          <b-col cols="12" sm="3">
            <b-button
              @click="switchPubKeyType(index)"
            >View {{pk.defaultFormat | swapTextBase64AndHexLabel}}</b-button>
          </b-col>
          <b-col cols="12" sm="3">
            <b-badge variant="success">Tier: {{pk.tier}}</b-badge>
          </b-col>
        </b-row>
      </b-card>
    </div>
    <div v-else class="mt-3">You have no deployer address.</div>
    <!-- Add new key section -->
    <b-card class="my-5">
      <b-row>
        <b-col cols="12" sm="3">
          <h4>Add New Key</h4>
        </b-col>
        <b-col cols="12" sm="9">
          In order to deploy contracts to PlasmaChain, you need to stake LOOM as payment to the validators.
          <router-link class="text-right" to="/faq">Developer FAQ</router-link>
        </b-col>
      </b-row>
      <div role="group">
        <label for="input-live">Your Loom Public Address</label>
        <input-address
          v-model="newPublicAddress"
          :placeholder="'loom0000000000000000000000000000000000000000'"
          @isValid="isValidAddressFormat"
        />
      </div>
      <p @click="showSeedPhraseModal()" class="text-right text-link">Generate New Public Address</p>
      <br>
      <seed-phrase-modal ref="seed-phrase-modal"/>
      <label for="input-live">Amount to Stake</label>
      <div class="tierBlock tierDisplay">
        <label v-for="tier in tiers" v-bind:key="tier.id" class="radio">
          <input type="radio" v-model="tierSelected" :value="tier">
          <b-card class="tierText">
            <b-row>Tier: {{tier.id}}</b-row>
            <b-row>Name: {{tier.name}}</b-row>
            <b-row>Fee: {{tier.fee}} LOOM</b-row>
          </b-card>
        </label>
      </div>
      <b-button
        class="d-inline-flex"
        @click="addKey(tierSelected)"
        :disabled="Object.keys(tierSelected).length == 0 || !newPublicAddress || !isValidAddress"
        v-model="loomAddress"
      >Add Key</b-button>
      <div class="remaining my-3">
        <span class="text-right">Remaining Balance: {{ loomBalance }} LOOM (</span>
        <router-link
          class="text-right"
          :to='{name :"depositeWithdraw", query: { action: "deposit" } }'
        >deposit</router-link>
        <span class="text-right">)</span>
      </div>
    </b-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { createNamespacedHelpers } from "vuex"
import SeedPhraseModal from "@/components/modals/SeedPhraseModal.vue"
import { BModal } from "bootstrap-vue"
import { CommonTypedStore } from "@/store/common"
import { whiteListModule } from "@/store/whitelist"
import { WhiteListState, Tier, DeployerAddress } from "@/store/whitelist/types"
import { plasmaModule } from "@/store/plasma"
import { formatFromLoomAddress } from "@/utils"
import { formatTokenAmount } from "@/filters"
import { Address } from "loom-js"
import InputAddress from "@/components/InputAddress.vue"

@Component({
  components: {
    SeedPhraseModal,
    InputAddress,
  },
})

export default class AddKey extends Vue {
  setErrorMsg = CommonTypedStore.setErrorMsg
  addDeployerAsync = whiteListModule.addDeployerAsync
  getDeployersAsync = whiteListModule.getDeployersAsync
  isShowGenPublicKeyModal = false
  newPublicAddress = ""
  tierSelected: Tier | {} = {}
  setShowLoadingSpinner = CommonTypedStore.setShowLoadingSpinner
  isValidAddress = false
  loomAddress = "loom0000000000000000000000000000000000000000"

  modal(ref: string) {
    return this.$refs[ref] as BModal
  }

  switchPubKeyType(inputKey) {
    this.publicKeys[inputKey].defaultFormat = this.publicKeys[inputKey].defaultFormat === "hex" ? "base64" : "hex"
  }

  get state(): WhiteListState {
    return this.$store.state.whiteList
  }

  get loomBalance() {
    const loomBalanceBN = plasmaModule.state.coins.LOOM.balance
    return formatTokenAmount(loomBalanceBN)
  }

  get tiers() {
    return this.state.tiers
  }

  get publicKeys() {
    return this.state.userDeployersAddress
  }

  async addKey(tier: Tier) {
    if (parseFloat(this.loomBalance!) < tier.fee) {
      this.setErrorMsg("Your balance isn't enough. Please deposit first.")
      return
    }

    const loomAddress = formatFromLoomAddress(this.newPublicAddress)
    if (this.publicKeys.filter((address) => address.hex === loomAddress).length > 0) {
      this.setErrorMsg("This address is already exists in your deployer list.")
      return
    }

    this.setShowLoadingSpinner(true)
    const result = await this.addDeployerAsync({ deployer: loomAddress, tier })
    this.setShowLoadingSpinner(false)
    this.newPublicAddress = ""
  }

  isValidAddressFormat(isValid) {
    this.isValidAddress = isValid
  }

  showSeedPhraseModal() {
    this.$root.$emit("bv::show::modal", "seed-phrase-modal")
  }

  async mounted() {
    await this.getDeployersAsync()
  }
}
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
}
.text-right {
  text-align: right !important;
}
.text-link {
  font-style: italic;
  color: #007bff;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
    color: #0651a2;
  }
}
.remaining {
  align-self: flex-end;
}
.tierBlock {
  margin: 20px;
}
.tierBlock input {
  display: none;
}
.tierBlock label {
  margin-right: 50px;
  display: inline-block;
  cursor: pointer;
}
.tierDisplay .tierText {
  display: block;
  padding: 5px 25px 5px 25px;
  border: 2px solid #ddd;
  border-radius: 5px;
  position: relative;
  transition: all 0.25s linear;
}
.tierDisplay .radio input:checked + .tierText {
  background-color: #fff;
  box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.1);
  color: #ffc107;
  border-color: #ffc107;
}
</style>
