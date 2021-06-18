<template>
  <b-card class="mb-4">
      <b-card-body >
        <!-- <b-list-group-item v-for="usersAirdrop in usersAirdrops" :key="usersAirdrop.airdropID">
        <dl>
            <dt>{{$t('components.validation_delegations.airdrop_amount')}}:</dt>
            <dd>{{usersAirdrop.airdropAmount | tokenAmount(getTokensInfo(usersAirdrop.tokenAddress).decimals)}}</dd>
            <dt>{{$t('components.validation_delegations.token')}}:</dt>
            <dd>{{getTokensInfo(usersAirdrop.tokenAddress).name}}</dd>
            <dt>{{$t('components.validation_delegations.unlock_time')}}:</dt>
            <dd>{{usersAirdrop.timelock | date('seconds')}}</dd>
        </dl>
        <b-button
          block
          variant="outline-primary"
          type="button"
          @click="withdraw(usersAirdrop.airdropID)"
          :disabled="isOntimeLocked(usersAirdrop) || usersAirdrop.isWithdrew"
        >
        {{$t('components.validation_delegations.withdraw')}}
        </b-button>
        </b-list-group-item> -->
      </b-card-body>
  </b-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { DPOSState, HasDPOSState, Delegation, Validator } from "@/dpos/store/types"
import { Store } from "vuex"
import { dposModule } from "@/dpos/store"
import { ZERO } from "@/utils"
import { plasmaModule } from "@/store/plasma"

@Component
export default class ValidationDelegations extends Vue {

  zero = ZERO
  /**
   * Filter by validator
   */
  @Prop({ required: true }) validator!: Validator


  get state(): DPOSState {
    return (this.$store as Store<HasDPOSState>).state.dpos
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
