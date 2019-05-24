<template>
    <div class="container">
      <!-- Deployer Public key section -->
      <h4 class="mt-3">Deployer Public Keys</h4>
      <b-card v-for="pk in publicKeys" :key="pk.Hex" v-show="publicKeys.length > 0">
        <b-row>
          <b-col cols="12" sm="6">
            <b-form-input v-model="pk[pk.defaultFormat]"></b-form-input>
          </b-col>
          <b-col cols="12" sm="3">
            <b-button @click="switchPubKeyType(pk)"> View {{pk.defaultFormat | swapTextBase64AndHexLabel}}</b-button>
          </b-col>
          <b-col cols="12" sm="3">
            <b-badge href="#" variant="success">Tier: {{pk.tier}}</b-badge>
          </b-col>
        </b-row>
      </b-card>  
      <!-- Add new key section -->
      <b-row class="mt-5" >
        <b-col cols="12" sm="3"><h4>Add New Key</h4></b-col>
        <b-col cols="12" sm="9">
          In order to deploy contracts to PlasmaChain, you need to stake LOOM as payment to the validators.
          <router-link class="text-right" to="/faq">Developer FAQ</router-link>
        </b-col>
      </b-row>
      <div role="group">
        <label for="input-live">Your Loom Public Address</label>
        <b-form-input v-model="newPubKey" class="my-2" placeholder="0x0000000000000000000"></b-form-input>
      </div>
      <p @click="generateNewPublicKey()" class="text-right text-link"> Generate New Public Address</p><br>
      Amount to Stake
      <b-row class="mt-3">
        <b-col v-for="tier in stakeTiers" class="mt-3 mb-3" :key="tier.no">
          <b-button @click="addKey(tier)"> 
            Tier: {{tier.no}} <br> 
            Max: {{tier.max}} tx/min <br>
            Amount: {{tier.amount}} LOOM 
          </b-button>
        </b-col>
      </b-row>
      <generate-public-key-modal :showModal="isShowGenPublicKeyModal" @hide="onHideGenPKModal" />
      <div class="remaining">
        <span class="text-right"> Remaining Balance: {{ loomBalance }} LOOM (</span>
        <router-link class="text-right" :to='{name :"account", query: { action: "deposit" } }'>deposit</router-link>
        <span class="text-right">)</span> 
      </div>
    </div> 
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { createNamespacedHelpers } from "vuex"
import GeneratePublicKeyModal from "@/components/modals/GeneratePublicKeyModal.vue"
import { DPOSTypedStore } from "@/store/dpos-old"

@Component({
  components: {
    GeneratePublicKeyModal,
  },
})

export default class AddKey extends Vue {
  getDappchainLoomBalance = DPOSTypedStore.getDappchainLoomBalance

  isShowGenPublicKeyModal = false
  loomBalance = ""
  pubKeyType = "Hex"
  newPubKey = ""
  publicKeys = [
    {
      Hex: "0x8e577b518b00831480e657d68d4683e686c9d6b2",
      Base64: "jld7UYsAgxSA5lfWjUaD5obJ1rI=",
      tier: 1,
      defaultFormat: "Hex",
    },
    {
      Hex: "0x1c10178d476db5e0f4a22594799e675579d68a1e",
      Base64: "HBAXjUdtteD0oiWUeZ5nVXnWih4=",
      tier: 1,
      defaultFormat: "Hex",
    },
    {
      Hex: "0x7894c25242de46701f54599922086591cc714c0c",
      Base64: "eJTCUkLeRnAfVFmZIghlkcxxTAw=",
      tier: 1,
      defaultFormat: "Hex",
    },
  ]

  stakeTiers = [
    {
      no: 1,
      max: 10,
      amount: 3000,
    },
    {
      no: 2,
      max: 20,
      amount: 6000,
    },
    {
      no: 3,
      max: 30,
      amount: 9000,
    },
  ]

  switchPubKeyType(inputKey) {
    inputKey.defaultFormat = inputKey.defaultFormat === "Base64" ? "Hex" : "Base64"
  }

   addKey(tier) {
    alert("DONE")
  }
   generateNewPublicKey() {
    this.isShowGenPublicKeyModal = true
  }
  onHideGenPKModal() {
    this.isShowGenPublicKeyModal = false
  }
  async mounted() {
    this.loomBalance = await this.getDappchainLoomBalance()
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
}
 .text-link:hover {
  color: #0651a2;
}
.remaining {
  align-self: flex-end;
}
 </style>

