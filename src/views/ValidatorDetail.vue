<template>
  <main class="validator">
    <loading-spinner v-if="!finished" :showBackdrop="true"></loading-spinner>
    <header>
      <h1><router-link to="../validators" style="color: inherit;">{{ $t('views.validator_list.validators') }}</router-link></h1>
    </header>
    <section class="validator-details">
      <header>
      <h1>{{validator.name }}<span> {{validator.isBootstrap ? "(bootstrap)" : ''}}</span></h1>
      <small>loom{{validator.address.substring(2)}}</small>
      <p v-if="validator.description" style="color: rgba(0, 0, 0, 0.86);font-size: 16px;margin:0">
        {{validator.description}}
      </p>
      <a :href="validator.website | url" target="_blank">{{validator.website | domain}} <fa icon="external-link-alt"/></a>
      </header>
      <dl>
        <dt>{{ $t('views.validator_detail.state') }}</dt>
        <dd>{{validator.active ? "Active" : "Inactive"}}</dd>
        <dt>Delegators Stake</dt>
        <dd>{{validator.delegatedStake | tokenAmount}}</dd>
        <dt>Total Staked</dt>
        <dd>{{validator.totalStaked | tokenAmount}}</dd>
        <dt>Fee</dt>
        <dd>{{validator.fee}}</dd>
      </dl>
    </section>
    <section v-if="userIsLoggedIn" class="user-stakes">
      <h6 v-if="!isBootstrap">{{ $t('My stakes') }} </h6>
      <b-list-group v-if="validatorDelegations.length">
          <b-list-group-item v-for="delegation in validatorDelegations" :key="delegation.unlockTime">
            <dl>
              <dt>{{ $t('views.validator_detail.state') }}</dt>
              <dd>{{delegation.state | delegationState}}</dd>
              <dt>{{ $t('views.validator_detail.amount_delegated') }}</dt>
              <dd>{{delegation.amount | tokenAmount}}</dd>
              <dt>{{ $t('views.validator_detail.updated_amount') }}</dt>
              <dd>{{delegation.updateAmount | tokenAmount}}</dd>
              <dt>{{ $t('views.validator_detail.timelock_tier') }}</dt>
              <dd>{{delegation.lockTimeTier | lockTimeTier}}</dd>
              <dt>Unlock time</dt>
              <dd>{{delegation.lockTime | date('seconds')}}</dd>
            </dl>
            <footer class="actions">
              <b-button-group style="display: flex;">
                <b-button variant="outline-primary" :disabled="delegation.state !== 1"
                  @click="openRedelegateModal(delegation)"
                >{{ $t('Redelegate') }}</b-button>
                <b-button variant="outline-primary" :disabled="delegation.state !== 1 || delegation.locked"
                  @click="openRequestUnbondModal(delegation)"
                >{{ $t('Undelegate') }}</b-button>
              </b-button-group>
            </footer>
          </b-list-group-item>
      </b-list-group>
      <p v-if="!validatorDelegations.length && !isBootstrap" class="no-stakes">
        {{ $t("views.validator_detail.no_stakes", {name:validator.name}) }}<br/>
      </p>

      <div class="button-container">
        <b-button class="stake mr-3" 
          @click="openRequestDelegateModal()">
          {{ $t("Stake tokens") }}
        </b-button>
        <b-button class="consolidate" v-if="canConsolidate && false"
          @click="consolidateDelegations(validator)">
          {{ $t("views.validator_detail.consolidate") }}
        </b-button>
      </div>

      <!-- dialogs -->
      <faucet-delegate-modal @onDelegate="delegateHandler" ref="delegateModalRef" :hasDelegation="hasDelegation"></faucet-delegate-modal>
      <redelegate-modal ref="redelegateModalRef" @ok="redelegateHandler"></redelegate-modal>
      <success-modal></success-modal>
    </section>
  </main>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import LoadingSpinner from "../components/LoadingSpinner.vue"
import SuccessModal from "../components/modals/SuccessModal.vue"
import RedelegateModal from "../components/modals/RedelegateModal.vue"
import FaucetDelegateModal from "../components/modals/FaucetDelegateModal.vue"
import { formatToCrypto } from "@/utils"
import { DPOSTypedStore } from "../store/dpos-old"
import { CommonTypedStore } from "../store/common"
import { Modal } from "bootstrap-vue"
import { dposModule } from "../store/dpos"
import { HasDPOSState } from "../store/dpos/types"

@Component({
  components: {
    SuccessModal,
    RedelegateModal,
    FaucetDelegateModal,
    LoadingSpinner,
  },
})
export default class ValidatorDetail extends Vue {
  isSmallDevice = window.innerWidth < 600
  prohibitedNodes = DPOSTypedStore.state.prohibitedNodes

  hasDelegation = false

  finished = false

  lockDays = [14, 90, 180, 365]

  states = ["Bonding", "Bonded", "Unbounding", "Redelegating"]

  consolidateDelegations = DPOSTypedStore.consolidateDelegations

  get state(): HasDPOSState {
    return this.$store.state
  }
  get validatorName() {
    return this.$route.params.index
  }

  get userIsLoggedIn() { return this.state.plasma.address !== ""}

  get validators() {return this.state.dpos.validators}

  get validator() {
    const validator = this.state.dpos.validators.find((v) => v.name === this.validatorName)
    // todo add state.loadingValidators:boolean
    if (validator === undefined) {
      this.$router.push("../validators")
    }
    return validator
  }

  get validatorDelegations() {
    const validator = this.validator
    if (!this.validator) return []
    return this.state.dpos.delegations
      .filter((d) => d.validator.local.toString() === validator.address && d.index > 0)
      .map((d) => {
        d.locked = d.lockTime * 1000 > Date.now()
        return d
      })
  }

  async delegateHandler() {
    this.$root.$emit("refreshBalances")
    // show success modal
    this.$root.$emit("bv::hide::modal", "success-modal")
  }

  copyAddress() {
    // @ts-ignore
    this.$refs.address.select()
    const successful = document.execCommand("copy")
    if (successful) {
        CommonTypedStore.setSuccess("Address copied to clipboard")
    } else {
        CommonTypedStore.setSuccess("Somehow copy  didn't work...sorry")
    }
  }

  get canConsolidate() {
    // dev only. remove "true" on production
    return this.state.dpos.delegations.filter((d) => !d.locked).length > 1
  }

  async redelegateHandler() {
    // plugin listens to actions and refreshes accordingly
    return false
  }

  get isBootstrap() {
    return this.prohibitedNodes.includes(this.validator.name)
  }

  openRequestDelegateModal() {
    // @ts-ignore
    this.$refs.delegateModalRef.show(this.validator.address, "")
  }

  openRequestDelegationUpdateModal(delegation) {
    // @ts-ignore
    this.$refs.delegateModalRef.show(
      this.validator.address,
      "",
      0, // formatToCrypto(delegation.amount),
      delegation.lockTimeTier)
  }

  openRequestUnbondModal(delegation) {
    // @ts-ignore
    this.modal("delegateModalRef").show(this.validator.address, "unbond", 0, 0, delegation)
  }

  openRedelegateModal(delegation) {
    // @ts-ignore
    this.modal("redelegateModalRef").show(delegation)
  }

  modal(ref: string): Modal {
    return this.$refs[ref] as Modal
  }

}
</script>

<style lang="scss">
main.validator {
  // for the "stake my tokens button"
  padding-bottom: 82px;
  // ther should be global class for page titles
  > header > .back {
    position: absolute;
    left: 0;
  }
  > header > h1 {
    color: #5246d5;
    font-size: 1.35em;
    text-align: center;
    margin: 16px -14px 0;
    font-weight: normal;
    border-bottom: 1px solid #ededed;
    padding-bottom: 16px;
  }


  dl {
    display: flex;
    flex-wrap: wrap;
    dt,dd {
      flex: 50%;
      border-bottom: 1px solid rgba(0, 0, 0, 0.09);
      line-height: 24px;
      padding: 8px 0 8px;
      margin: 0;
    }
    dt {
      font-weight: normal
    }
    dd {
      font-weight: 500;
      text-align: right;
    }
  }

  .validator-details {
    margin: 0 -15px;
    padding: 15px;
    background: #fff;
    border-bottom: 1px solid #dfdfdf;
    > header {
      margin-bottom: 5px;
      padding-bottom: 5px;
      > h1 {
      color: black;
      font-size: 1.8em;
      }
      
    }

  }

  .user-stakes {
    margin-top: 15px;
    .no-stakes {
      text-align: center;
      button {
        background-color: #5448da;
        border-color: #5448da;
            margin-top: 15px;
      }
    }
    > footer {
      position: fixed;
      bottom: 0;
      padding: 8px;
      left: 0;
      right: 0;
      text-align: center;
      background: #00bcd47d;
      box-shadow: 0px -1px 5px grey;
      > button {
        background-color: #5448da;
        border-color: #5448da
      }
    }
  }  
}

.loading-backdrop {
  position: absolute;
  display: flex;
  align-content: center;
  justify-content: center;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  background-color: rgba(255,255,255,0.8);
  z-index: 9999;
}

</style>
