<template>
  <main class="validatorMgmt">
    <header>
      <h1>Validator Management</h1>
    </header>
    <Account class="account"/>
    <b-button variant="outline-primary" style="margin-top: 2%;" @click="example">View Example</b-button>
    <validator-extended-detail :userAddress="userAddress" class="validator"></validator-extended-detail>
    <validator-rewards class="reward"></validator-rewards> 
  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import { DashboardState } from "@/types"
import Account from "@/components/Account.vue"
import Rewards from "@/dpos/components/Rewards.vue"
import ValidatorExtendedDetail from "@/dpos/components/ValidatorExtendedDetail.vue"
import ValidatorRewards from "@/dpos/components/ValidatorRewards.vue"

@Component({
  components: {
    Account,
    Rewards,
    ValidatorExtendedDetail,
    ValidatorRewards
  },
})

export default class ValidatorManagement extends Vue {

  plasmaAddr = this.state.plasma.address

  get state(): DashboardState {
    return this.$store.state
  }

  get userAddress() {
    return this.plasmaAddr
  }

  example() {
    this.plasmaAddr = "0x69c48768dbac492908161be787b7a5658192df35"
  }
  // exampleAddr = "NO"
  
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
  
  }
</style>


