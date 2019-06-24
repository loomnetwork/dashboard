<template>
  <main class="container">
    <header>
      <h1>Deploy to Plasmachain</h1>
      <b-button
        class="help"
        :class="{active:showHelp}"
        variant="outline-info"
        pill
        size="sm"
        @click="showHelp =!showHelp"
      >?</b-button>
    </header>
    <section>
      <b-alert fade :show="showHelp">
        <p>In order to deploy contracts to PlasmaChain, you need to white list your deployment keys. You can manage your keys bellow, whitelist an existing key or generate a new one.</p>
        <p>Adding a key requires you to stake tokens by choosing a tier.</p>
      </b-alert>
      <b-card class="deployer-keys mb-4" no-body>
        <header>
          <b-card-title>Deployer Public Keys</b-card-title>
          <b-button-group size="sm">
            <b-button
              variant="outline-primary"
              :class="{active: keyViewMode ==='hex'}"
              @click="keyViewMode = 'hex'"
            >Hex</b-button>
            <b-button
              variant="outline-primary"
              :class="{active: keyViewMode ==='base64'}"
              @click="keyViewMode = 'base64'"
            >Base64</b-button>
          </b-button-group>
        </header>
        <b-card-body>
          <p
            v-if="publicKeys.length === 0"
            class="mt-3"
          >You have no deployer address yet. Use the form bellow to add one</p>
        </b-card-body>
        <b-list-group class="deployer-keys" flush>
          <b-list-group-item v-for="pk in publicKeys" :key="pk.hex" class="flex-column">
            <div class="flex-row my-2">
              <address class="key hex" v-if="keyViewMode === 'hex'">
                <span @click="showCollapse(pk.hex)">{{pk.hex | loomAddress}}</span>
                <fa icon="paste" @click="copyAddress(pk.hex)" class="icon-copy"/>
              </address>
              <div class="key" v-else>{{pk.base64}}</div>
              <b-badge variant="success">Tier {{pk.tier + 1}}</b-badge>
            </div>
            <b-collapse :id="pk.hex">
              <div class="collapse-content">
                {{deployedContract[pk.hex]}}
              </div>
            </b-collapse>
          </b-list-group-item>
        </b-list-group>
      </b-card>

      <b-alert variant="warning" :show="balanceTooLow" style="max-width: 600px;">
        <h5 class="alert-heading">LOOM balance low.</h5>
        <p>Whitelisting keys requires at least 10 LOOM. Your balance is {{ loomBalance }} LOOM</p>
        <footer style="display: flex;justify-content: flex-end;">
          <b-button variant="primary" @click="goDeposit">Deposit more LOOM to Plasmachain</b-button>
        </footer>
      </b-alert>

      <!-- Add new key section -->
      <b-card class="my-5 add-key-form" style="max-width: 600px;" no-body>
        <b-card-header>Add New Key</b-card-header>

        <b-card-body>
          <p
            @click.stop.prevent="showSeedPhraseModal"
            class="text-right text-link"
            style="position: absolute;right: 20px;"
          >Generate New Key</p>
          <b-form-group
            id="da-input-group"
            label="Your Loom Public Address"
            label-for="deployer-address-input"
            description="Use an existing address or creare a new one by clicking on generate new key"
          >
            <input-address
              id="deployer-address-input"
              v-model="newPublicAddress"
              chain="any"
              :placeholder="'loom0000000000000000000000000000000000000000'"
              @isValid="isValidAddressFormat"
            />
          </b-form-group>
          <b-form-group
            label="Select a tier"
            label-for="whitelist-tier-input"
            description="In order to deploy contracts to PlasmaChain, you need to stake LOOM as payment to the validators."
          >
            <div class="tier-options">
              <label
                v-for="tier in tiers"
                :key="tier.tierId"
                class="radio tier"
                :class="{selected: tier === tierSelected}"
              >
                <input type="radio" v-model="tierSelected" :value="tier">
                <strong>Tier {{tier.tierId +1}}</strong>
                <div class="fee">{{tier.fee | tokenAmount}} LOOM</div>
              </label>
              <label class="radio tier disabled" v-for="i in [1,2,3]" :key="i">
                <input type="radio" disabled v-model="tierSelected" :value="-1">
                <div class="spec">Coming soon</div>
              </label>
            </div>
          </b-form-group>
          <div class="balance">
            <span>Your balance: {{ loomBalance }} LOOM</span>
            <router-link to="/wallet">
              <b-button variant="outline-primary">Deposit</b-button>
            </router-link>
          </div>
        </b-card-body>

        <b-card-footer>
          <b-button
            variant="primary"
            @click="addKey(tierSelected)"
            :disabled="Object.keys(tierSelected).length == 0 || !newPublicAddress || !isValidAddress"
            v-model="loomAddress"
            size="lg"
          >Add Key</b-button>
        </b-card-footer>
      </b-card>
    </section>
    <seed-phrase-modal ref="seed-phrase-modal"/>
  </main>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import { createNamespacedHelpers } from "vuex"
import SeedPhraseModal from "@/components/modals/SeedPhraseModal.vue"
import { BModal } from "bootstrap-vue"
import { whiteListModule } from "@/whitelist/store"
import { WhiteListState, DeployerAddress } from "@/whitelist/store/types"
import { plasmaModule } from "@/store/plasma"
import { formatFromLoomAddress, formatToLoomAddress } from "@/utils"
import { formatTokenAmount } from "@/filters"
import { Address } from "loom-js"
import InputAddress from "@/components/InputAddress.vue"
import { ITier } from "loom-js/dist/contracts/user-deployer-whitelist"
import BN from "bn.js"
import { feedbackModule } from "@/feedback/store"
import { PlasmaState } from "../../store/plasma/types"

@Component({
  components: {
    SeedPhraseModal,
    InputAddress,
  },
})

export default class AddKey extends Vue {
  showError = feedbackModule.showError
  isShowGenPublicKeyModal = false
  newPublicAddress = ""
  tierSelected: ITier | {} = {}
  isValidAddress = false
  loomAddress = "loom0000000000000000000000000000000000000000"

  keyViewMode: "hex" | "base64" | "" = ""

  showHelp = false

  modal(ref: string) {
    return this.$refs[ref] as BModal
  }

  get state(): WhiteListState {
    return this.$store.state.whiteList
  }

  get plasma(): PlasmaState {
    return this.$store.state.plasma
  }

  get loomBalance() {
    const loomBalanceBN = this.plasma.coins.LOOM.balance
    return formatTokenAmount(loomBalanceBN)
  }

  get balanceTooLow() {
    return this.tiers.length > 0 && this.plasma.coins.LOOM.balance.lt(this.tiers[0].fee)
  }

  get tiers() {
    return this.state.tiers
  }

  get publicKeys() {
    return this.state.userDeployersAddress
  }

  get deployedContract() {
    return this.state.deployedContractAddress
  }

  async addKey(tier: ITier) {
    if (tier.fee.gt(plasmaModule.state.coins.LOOM.balance)) {
      this.showError("Your balance isn't enough. Please deposit first.")
      return
    }

    const loomAddress = formatFromLoomAddress(this.newPublicAddress)
    if (this.publicKeys.filter((address) => address.hex === loomAddress).length > 0) {
      this.showError("This address is already exists in your deployer list.")
      return
    }

    const result = await whiteListModule.addDeployer({ deployer: loomAddress, tier })
    this.resetForm()
  }

  isValidAddressFormat(isValid) {
    this.isValidAddress = isValid
  }

  resetForm() {
    this.newPublicAddress = ""
    this.tierSelected = {}
  }

  showSeedPhraseModal() {
    this.$root.$emit("bv::show::modal", "seed-phrase-modal")
    whiteListModule.generateSeeds()
  }

  copyAddress(hex: string) {
    this.$copyText(formatToLoomAddress(hex)).then(() =>
      feedbackModule.showSuccess("Address copied."),
      console.error,
    )
  }

  async getDeployedContract(deployerAddress: Address) {
    await whiteListModule.getDeployedContractAddresses({deployerAddress})
  }

  goDeposit() {
    this.$router.push({ path: "wallet", query: { depositCoin: "LOOM" } })
  }

  async mounted() {
    this.keyViewMode = "hex"
    await whiteListModule.getDeployers()
  }
  showCollapse(key) {
    this.$root.$emit("bv::toggle::collapse", key)
  }
}
</script>
<style lang="scss" scoped>
main > section {
  max-width: 600px;
  margin: 0 auto;
}
.collapse-content {
  background: #007bff0f;
  padding: 1em;
  border-radius: 4px;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.flex-column {
  display: flex;
  flex-direction: column;
}

.card.deployer-keys {
  border: none;
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0px;
  > header {
    display: flex;
    flex: 1;
    padding: 10px 10px 0;

    align-items: center;
    h4 {
      flex: 1;
      margin: 0;
    }
  }
  .list-group-item {
    display: flex;
    .key {
      flex: 1;
      font-family: Monaco, "Lucida Console", monospace;
      font-size: 0.825rem;
      margin: 0;
      &.hex {
        > span {
          cursor: pointer; 
        }
        .icon-copy {
          cursor: copy;
        }
      }
      // fa icon
      > svg {
        margin-left: 0.5rem;
        color: #007cff;
      }
    }
    .badge {
      font-size: 0.825rem;
    }
  }
}

.add-key-form {
  max-width: 600px;
  margin: auto;
}

p {
  color: inherit;
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

.tier-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .tier {
    border: 1px solid #d8d8d8;
    color: rgba(0, 0, 0, 0.86);
    padding: 16px 8px;
    text-align: center;
    margin: 0 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    &.selected {
      background-color: #007cff;
      color: #fff;
      box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.1);
    }
    &.disabled {
      opacity: 0.56;
    }
    > input {
      display: none;
    }
    > * {
      height: 1.8em;
    }
    .spec {
      font-size: 0.825rem;
    }
  }
}

.balance {
  float: right;

  span {
    vertical-align: middle;
    padding: 4px;
  }
}
</style>
