<template>
  <main class="validatorMgmt">
    <header>
      <h1>{{ $t('components.faucet_sidebar.validator_management') }}</h1>
    </header>
    <Account class="account"/>
    <validator-extended-detail :userAddress="userAddress" class="validator"></validator-extended-detail>
    <statistics class="statistic" v-if="isValidator" :userAddress="userAddress" :chainId="chainId"></statistics>
    <validator-rewards class="reward" v-if="isValidator"></validator-rewards> 

  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import { DashboardState } from "@/types"
import Account from "@/components/Account.vue"
import Rewards from "@/dpos/components/Rewards.vue"
import ValidatorExtendedDetail from "@/dpos/components/ValidatorExtendedDetail.vue"
import ValidatorRewards from "@/dpos/components/ValidatorRewards.vue"
import Statistics from "@/dpos/components/Statistics.vue"

@Component({
  components: {
    Account,
    Rewards,
    ValidatorExtendedDetail,
    ValidatorRewards,
    Statistics,
  },
})

export default class ValidatorManagement extends Vue {

  get state(): DashboardState {
    return this.$store.state
  }

  get userAddress() {
    return this.state.plasma.address
  }

  get chainId() {
    return this.state.plasma.chainId
  }

  get isValidator() {
    const isValidator = this.state.dpos.validators.find((validator) => validator.addr === this.userAddress)
    return isValidator ? true : false
  }
}
</script>

<style lang="scss" scoped>
  main.validatorMgmt {
  // ther should be global class for page titles
  header > h1 {
    color: #5246d5;
    font-size: 1.35em;
    text-align: center;
    margin: 16px -14px;
    font-weight: normal;
    border-bottom: 1px solid #ededed;
    padding-bottom: 16px;
  }

  .validator {
    margin-top: 2%;
  }

  .reward {
    margin-top: 2%;
  }

  .statistic {
    margin-top: 2%;
  }
  
  }
</style>


