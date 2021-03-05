<template>
  <b-list-group v-if="delegations.length" flush>
    <b-list-group-item v-for="delegation in delegations" :key="delegation.unlockTime">
      <header v-if="showValidator">
        <router-link :to="'/validator/'+delegation.validator.name">{{delegation.validator.name}}</router-link>
      </header>
      <dl>
        <dt>{{ $t('views.validator_detail.state') }}</dt>
        <dd>
          <b-spinner v-if="delegation.pending" type="border" small />
          {{delegation.state | delegationState}}
        </dd>
        <dt>{{ $t('views.validator_detail.amount_delegated') }}</dt>
        <dd>{{delegation.amount | tokenAmount}} LOOM</dd>
        <template v-if="delegation.updateAmount.gt(zero)">
          <dt>{{ $t('views.validator_detail.updated_amount') }}</dt>
          <dd>{{delegation.updateAmount | tokenAmount}} LOOM</dd>
        </template>
        <dt>{{ $t('views.validator_detail.timelock_tier') }}</dt>
        <dd>{{delegation.lockTimeTier | lockTimeTier}}</dd>
        <dt v-if="delegation.locked">{{ $t('views.validator_detail.unlock_time') }}</dt>
        <dt v-else-if="delegation.lockTime > 0">{{ $t('views.validator_detail.unlocked') }}</dt>
        <dd v-if="delegation.lockTime > 0">{{delegation.lockTime | date('seconds')}}</dd>
      </dl>
      <footer class="actions">
        <b-button-group style="display: flex;">
          <b-button
            variant="outline-primary"
            :disabled="delegation.pending"
            @click="requestRedelegation(delegation)"
          >{{ $t('views.redelegate.redelegate') }}</b-button>
          <b-button
            variant="outline-primary"
            :disabled="delegation.pending || delegation.locked"
            @click="requestUndelegation(delegation)"
          >{{ $t('components.modals.faucet_undelegate_modal.undelegate') }}</b-button>
        </b-button-group>
      </footer>
    </b-list-group-item>
  </b-list-group>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { DPOSState, HasDPOSState, Delegation } from "@/dpos/store/types"
import { Store } from "vuex"
import { dposModule } from "@/dpos/store"
import { ZERO } from "@/utils"
import { plasmaModule } from "@/store/plasma"

@Component
export default class DelegationsList extends Vue {

  zero = ZERO
  /**
   * Filter by validator
   */
  @Prop({ required: true })
  delegations!: Delegation[]

  @Prop({ type: Boolean, default: false })
  showValidator!: boolean

  get state(): DPOSState {
    return (this.$store as Store<HasDPOSState>).state.dpos
  }

  async requestRedelegation(delegation: Delegation) {
    if (! await plasmaModule.signerIsSet()) {
      return
    }
    dposModule.requestRedelegation(delegation)
  }

  async requestUndelegation(delegation) {
    if (! await plasmaModule.signerIsSet()) {
      return
    }
    dposModule.requestUndelegation(delegation)
  }
}
</script>
<style lang="scss" scoped>
header {
  font-weight: 500;
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
</style>
