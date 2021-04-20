<template>
  <loading-spinner
    v-if="isLoading"
    :showBackdrop="false"
    :message="$t('views.validator_detail.loading_validators')"
  ></loading-spinner>
  <main v-else class="validator">
    <header>
      <h1>
        <router-link
          to="../validators"
          style="color: inherit;"
        >{{ $t('views.validator_list.validators') }}</router-link>
      </h1>
    </header>
    <section class="validator-details">
      <header>
        <h1>
          {{validator.name }}
          <span>{{validator.isBootstrap ? "(bootstrap)" : ''}}</span>
        </h1>
        <small>loom{{validator.address.local.toString().substring(2)}}</small>
        <p
          v-if="validator.description"
          style="color: rgba(0, 0, 0, 0.86);font-size: 16px;margin:0"
        >{{validator.description}}</p>
        <a :href="validator.website | url" target="_blank">
          {{validator.website | domain}}
          <fa icon="external-link-alt" />
        </a>
      </header>
      <dl>
        <dt>{{ $t('views.validator_detail.state') }}</dt>
        <dd
          v-if="!validator.jailed"
        >{{validator.active ? $t('views.validator_detail.active') : $t('views.validator_detail.inactive')}}</dd>
        <dd v-else style="font-weight: bold">{{$t('views.validator_detail.jailed')}}</dd>
        <!--
        <dt>Recently Missed Blocks</dt>
        <dd>
          {{ validator.recentlyMissedBlocks }}
          <small>{{ validator.missedBlocks }}</small>
        </dd>
        -->
        <dt>{{ $t('views.validator_detail.delegator_stake') }}</dt>
        <dd>{{validator.stakedAmount | tokenAmount(18,0)}}</dd>
        <dt>{{ $t('components.modals.faucet_redelegate_modal.total_stake') }}</dt>
        <dd>{{validator.stakedAmount.add(validator.whitelistAmount) | tokenAmount(18,0)}}</dd>
        <dt>{{ $t('components.validator_extended_detail.fee') }}</dt>
        <dd>{{validator.fee}}%</dd>
      </dl>
    </section>
    <b-card tag="section" v-if="!!state.plasma.address" class="user-stakes" no-body>
      <b-card-body>
        <h6 v-if="!validator.isBootstrap">{{ $t('views.validator_detail.my_stake') }}</h6>
      </b-card-body>
      <delegations-list :delegations="delegations" />
      <p
        class="no-stakes"
        v-if="validator.isBootstrap === false && validator.delegations.length === 0"
      >
        {{ $t("views.validator_detail.no_stakes", {name:validator.name}) }}
        <br />
      </p>
      <div class="button-container" v-if="!validator.isBootstrap && !validator.jailed && !validator.isFormer">
        <b-button
          class="stake mr-3"
          @click="requestDelegation()"
          :disabled="validator.jailed"
        >{{ $t('views.validator_detail.stake_tokens') }}</b-button>
        <b-button
          class="consolidate"
          v-if="canConsolidate"
          @click="consolidate(validator)"
        >{{ $t("views.validator_detail.consolidate") }}</b-button>
      </div>

      <!-- dialogs -->
      <!-- <faucet-delegate-modal
        @onDelegate="delegateHandler"
        ref="delegateModalRef"
        :hasDelegation="hasDelegation"
      ></faucet-delegate-modal>-->
      <template v-if="!!state.dpos.delegation">
        <delegate-modal></delegate-modal>
      </template>
      <success-modal></success-modal>
    </b-card>
  </main>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import SuccessModal from "@/components/modals/SuccessModal.vue"
import DelegateModal from "@/dpos/components/DelegateModal.vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"

import { dposModule } from "@/dpos/store"
import { HasDPOSState } from "@/dpos/store/types"
import { Delegation } from "@/dpos/store/types"
import DelegationsList from "@/dpos/components/Delegations.vue"
import { feedbackModule } from "../../feedback/store"
import { plasmaModule } from "../../store/plasma"

@Component({
  components: {
    SuccessModal,
    DelegateModal,
    DelegationsList,
    LoadingSpinner,
  },
})
export default class ValidatorDetail extends Vue {
  isSmallDevice = window.innerWidth < 600

  lockDays = [14, 90, 180, 365]

  states: any[] = []

  created() {
    this.states = [
      this.$t("views.validator_detail.states.bonding").toString(),
      this.$t("views.validator_detail.states.bonded").toString(),
      this.$t("views.validator_detail.states.unbonding").toString(),
      this.$t("views.validator_detail.states.redelegating").toString()]
  }

  get state(): HasDPOSState {
    return this.$store.state
  }

  get validatorName() {
    return this.$route.params.index
  }

  get isLoading() {
    return this.state.dpos.validators.length === 0 ? true : false
  }

  get userIsLoggedIn() { return this.state.plasma.address !== "" }

  get validator() {
    const validator = this.state.dpos.validators.find((v) => v.name === this.validatorName)
    if (validator === undefined) {
      this.$router.push("../validators")
    }
    return validator
  }

  get delegations() {
    const addr = this.validator!.addr
    return this.state.dpos.delegations.filter((d) => d.validator.addr === addr)
  }

  get canConsolidate() {
    return 1 < this.delegations.filter((d) => !d.locked).length
  }

  async requestDelegation() {
    if (! await plasmaModule.signerIsSet()) {
      return
    }
    dposModule.requestDelegation(this.validator!)
  }

  async consolidate(validator) {
    if (! await plasmaModule.signerIsSet()) {
      return
    }
    dposModule.consolidate(validator)
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
  > section {
    max-width: 600px;
    margin: auto;

    position: inherit;
  }

  dl {
    display: flex;
    flex-wrap: wrap;
    dt,
    dd {
      flex: 50%;
      border-bottom: 1px solid rgba(0, 0, 0, 0.09);
      line-height: 24px;
      padding: 8px 0 8px;
      margin: 0;
    }
    dt {
      font-weight: normal;
    }
    dd {
      font-weight: 500;
      text-align: right;
    }
  }

  .validator-details {
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
        border-color: #5448da;
      }
    }
  }
}
.button-container {
  position:inherit  !important;
}
</style>
