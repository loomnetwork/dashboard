<template>
  <b-list-group v-if="validatorDelegations.length">
    <b-list-group-item v-for="delegation in delegations" :key="delegation.unlockTime">
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
          <b-button
            variant="outline-primary"
            :disabled="delegation.pending"
            @click="requestRedelegation(delegation)"
          >{{ $t('Redelegate') }}</b-button>
          <b-button
            variant="outline-primary"
            :disabled="delegation.pending || delegation.locked"
            @click="requestUndelegation(delegation)"
          >{{ $t('Undelegate') }}</b-button>
        </b-button-group>
      </footer>
    </b-list-group-item>
  </b-list-group>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { DPOSState, HasDPOSState } from "@/store/dpos/types"
import { Store } from "vuex"
import { dposModule } from "../../store/dpos"

@Component
export default class DelegationsList extends Vue {

  /**
   * Filter by validator
   */
  @Prop({ default: "" })
  validatorAddress!: string

  get state(): DPOSState {
    return (this.$store as Store<HasDPOSState>).state.dpos
  }

  get delegations() {
    return this.validatorAddress === "" ?
      this.state.delegations :
      this.state.delegations.filter((d) => d.validator.local.toString() === this.validatorAddress)
  }

  requestRedelegation(delegation) {
    dposModule.requestRedelegation(delegation)
  }

  requestUndelegation(delegation) {
    dposModule.requestUndelegation(delegation)
  }
}
</script>
