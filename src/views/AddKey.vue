<template>
    <div class="container mb-5">
      <!-- Deployer Public key section -->
      <h4 class="mt-3">Deployer Public Keys</h4>
      <b-card v-for="pk in publicKeys" :key="pk.Hex" v-show="publicKeys.length > 0">
        <b-row>
          <b-col cols="12" sm="6">
            <h6>{{pk[pk.defaultFormat] | loomAddress}}</h6>
          </b-col>
          <b-col cols="12" sm="3">
            <b-button @click="switchPubKeyType(pk)"> View {{pk.defaultFormat | swapTextBase64AndHexLabel}}</b-button>
          </b-col>
          <b-col cols="12" sm="3">
            <b-badge variant="success">Tier: {{pk.tier}}</b-badge>
          </b-col>
        </b-row>
      </b-card>  
      <!-- Add new key section -->
      <b-card class="my-5">
        <b-row>
          <b-col cols="12" sm="3"><h4>Add New Key</h4></b-col>
          <b-col cols="12" sm="9">
            In order to deploy contracts to PlasmaChain, you need to stake LOOM as payment to the validators.
            <router-link class="text-right" to="/faq">Developer FAQ</router-link>
          </b-col>
        </b-row>
        <div role="group">
          <label for="input-live">Your Loom Public Address</label>
          <b-form-input v-model="newPubKey" class="my-2" placeholder="loom0000000000000000000"></b-form-input>
        </div>
        <p @click="showSeedPhraseModal()" class="text-right text-link"> Generate New Public Address</p><br>
        <seed-phrase-modal ref="seed-phrase-modal"/>
        <label for="input-live"> Amount to Stake </label>
        <div class="tierBlock tierDisplay"> 
          <label v-for="tier in stakeTiers" v-bind:key="tier.value.no" class="radio">
            <input type="radio" v-model="tierSelected" :value="tier.value" />
            <b-card class="tierText"> 
              <b-row>Tier: {{tier.value.no}}</b-row>
              <b-row>Max: {{tier.value.max}} tx/min</b-row>
              <b-row>{{tier.value.amount}} LOOM</b-row>
            </b-card>
          </label>
        </div>
        <b-button class="d-inline-flex" @click="addKey(tierSelected)" :disabled="!tierSelected"> Add Key </b-button>
        <div class="remaining my-3">
          <span class="text-right"> Remaining Balance: {{ loomBalance }} LOOM (</span>
          <router-link class="text-right" :to='{name :"account", query: { action: "deposit" } }'>deposit</router-link>
          <span class="text-right">)</span> 
        </div>
      </b-card>
    </div> 
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { createNamespacedHelpers } from "vuex"
import GeneratePublicKeyModal from "@/components/modals/GeneratePublicKeyModal.vue"
import SeedPhraseModal from "@/components/modals/SeedPhraseModal.vue"
import { DPOSTypedStore } from "@/store/dpos-old"
import { Modal } from "bootstrap-vue"

@Component({
  components: {
    GeneratePublicKeyModal,
    SeedPhraseModal,
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
  ] // TODO: wait for the real data

  tierSelected = ""

   stakeTiers = [
    {
      text: `Tier1: 3000 LOOM`,
      value: {
        no: 1,
        max: 10,
        amount: 3000,
      },
    },
    {
      text: "Tier2: Coming soon",
      value: {
        no: 2,
        max: 20,
        amount: 6000,
      },
      disabled: true,
    },
    {
      text: "Tier3: Coming soon",
      value: {
        no: 3,
        max: 30,
        amount: 9000,
      },
      disabled: true,
    },
  ] // TODO: wait for the real data

  modal(ref: string) {
   return this.$refs[ref] as Modal
  }

  switchPubKeyType(inputKey) {
    inputKey.defaultFormat = inputKey.defaultFormat === "Base64" ? "Hex" : "Base64"
  }

  addKey(tier) {
    alert(tier.no)
  }

  showSeedPhraseModal() {
    this.$root.$emit("bv::show::modal", "seed-phrase-modal")
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
