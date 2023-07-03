<template>
  <main class="container">
    <header>
      <h1>{{ $t('components.faucet_sidebar.deploy_to_plasmachain') }}</h1>
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
        <h5>{{ $t('views.add_key.deployer_public_keys') }}</h5>
        <p>{{ $t('views.help.in_order_to_deploy_contract')}}</p>
        <hr>
        <h5>{{ $t('views.add_key.add_new_key') }}</h5>
        <p>{{ $t('views.help.adding_key_requires')}}</p>
      </b-alert>
      <b-card class="deployer-keys mb-4" no-body>
        <header>
          <b-card-title>{{ $t('views.add_key.deployer_public_keys') }}</b-card-title>
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
          >{{ $t('views.add_key.no_deployer_address') }}</p>
        </b-card-body>
        <b-list-group class="deployer-keys" flush>
          <b-list-group-item v-for="pk in publicKeys" :key="pk.hex" class="flex-column">
            <div class="flex-row my-2">
              <address class="key hex" v-if="keyViewMode === 'hex'">
                <span @click="showCollapse(pk)">{{pk.hex | loomAddress}}</span>
                <fa icon="paste" @click="copyAddress(pk.hex)" class="icon-copy"/>
              </address>
              <div class="key" v-else>{{pk.base64}}</div>
              <b-badge variant="success">{{ $t('views.add_key.tier') }} {{pk.tier + 1}}</b-badge>
            </div>
            <b-collapse :id="pk.hex">
              <div class="collapse-content">
                <p v-for="(addr, index) in deployedContract[pk.hex]" :key="addr">
                  {{ index + 1 + ') ' + addr }}
                </p>
                <p v-if="deployedContract[pk.hex].length === 0">{{ $t('views.add_key.no_contract') }}</p>
              </div>
            </b-collapse>
          </b-list-group-item>
        </b-list-group>
      </b-card>

      <b-alert variant="warning" :show="balanceTooLow" style="max-width: 600px;">
        <h5 class="alert-heading">{{ $t('views.add_key.low_balance') }}</h5>
        <i18n tag="p" path="views.add_key.whitelisting_require">
          <b place="amount">{{tiers[0].fee | tokenAmount}}</b>
          <b place="balance">{{ loomBalance }}</b>
        </i18n>
        <footer style="display: flex;justify-content: flex-end;">
          <b-button variant="primary" @click="goDeposit">{{ $t('views.add_key.deposit_more') }}</b-button>
        </footer>
      </b-alert>

      <!-- Add new key section -->
      <b-card class="my-5 add-key-form" style="max-width: 600px;" no-body>
        <b-card-header>{{ $t('views.add_key.add_new_key') }}</b-card-header>

        <b-card-body>
          <p
            @click.stop.prevent="showSeedPhraseModal"
            class="text-right text-link"
            style="position: absolute;right: 20px;"
          >{{ $t('views.add_key.generate_new') }}</p>
          <b-form-group
            id="da-input-group"
            :label="$t('views.add_key.your_loom_address')"
            label-for="deployer-address-input"
            :description="$t('views.add_key.use_exist_or_create')"
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
            :label="$t('views.add_key.select_tier')"
            label-for="whitelist-tier-input"
            :description="$t('views.add_key.in_order_to_deploy')"
          >
            <div class="tier-options">
              <label
                v-for="tier in tiers"
                :key="tier.tierId"
                class="radio tier"
                :class="{selected: tier === tierSelected}"
              >
                <input type="radio" v-model="tierSelected" :value="tier">
                <strong>{{ $t('views.add_key.tier') }} {{tier.tierId +1}}</strong>
                <div class="spec">{{ $t('components.modals.faucet_delegate_modal.one_year') }}</div>
                <div class="fee">{{tier.fee | tokenAmount}} LOOM</div>
                <div class="fee" style="border: 11px solid;border-radius: 12px;border-width: 0px 2px;width: 95px;margin: 0 auto;">
                  <span style="text-decoration: line-through;display: block;">$499</span>
                  <big style="font-weight:bold">$99</big>
                </div>
                <div class="spec" style="color:red; text-transform:uppercase"><strong>{{ $t('views.add_key.limited_offer') }}</strong></div>
      
              </label>
              <label class="radio tier disabled" v-for="i in [1,2,3]" :key="i">
                <input type="radio" disabled v-model="tierSelected" :value="-1">
                <div class="spec">{{ $t('views.add_key.coming_soon') }}</div>
              </label>
            </div>
          </b-form-group>
          <div class="balance">
            <span>{{ $t('views.add_key.your_balance', { amount: loomBalance }) }}</span>
            <router-link to="/wallet">
              <b-button variant="outline-primary">{{ $t('views.my_account.deposit') }}</b-button>
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
          >{{ $t('views.add_key.add_key') }}</b-button>
        </b-card-footer>
      </b-card>
    </section>
    <seed-phrase-modal ref="seed-phrase-modal"/>
  </main>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import SeedPhraseModal from "@/components/modals/SeedPhraseModal.vue"
import { BModal } from "bootstrap-vue"
import { whiteListModule } from "@/whitelist/store"
import { WhiteListState } from "@/whitelist/store/types"
import { plasmaModule } from "@/store/plasma"
import { formatFromLoomAddress, formatToLoomAddress } from "@/utils"
import { formatTokenAmount } from "@/filters"
import { Address } from "loom-js"
import InputAddress from "@/components/InputAddress.vue"
import { ITier } from "loom-js/dist/contracts/user-deployer-whitelist"
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
      this.showError(this.$t("feedback_msg.error.balance_not_enough").toString())
      // this.showError("Your balance isn't enough. Please deposit first.")
      return
    }

    const loomAddress = formatFromLoomAddress(this.newPublicAddress)
    if (this.publicKeys.filter((address) => address.hex === loomAddress).length > 0) {
      this.showError(this.$t("feedback_msg.error.address_existed").toString())
      // this.showError("This address is already exists in your deployer list.")
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
      feedbackModule.showSuccess(this.$t("feedback_msg.success.address_copied").toString()),
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
  async showCollapse(pk) {
    await this.getDeployedContract(pk.address)
    this.$root.$emit("bv::toggle::collapse", pk.hex)
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
  p {
    margin: 0;
  }
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
      height: auto;
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
