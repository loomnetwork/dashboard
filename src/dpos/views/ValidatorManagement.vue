<template>
  <main class="validatorMgmt">
    <header>
      <h1>Validator Management</h1>
    </header>
    <Account class="account"/>
    <validator-extended-detail :userAddress="exampleAddr" class="validator"></validator-extended-detail>
    <rewards></rewards> 
  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import Account from "@/components/Account.vue"
import Rewards from "@/dpos/components/Rewards.vue"
import ValidatorExtendedDetail from "@/dpos/components/ValidatorExtendedDetail.vue"

@Component({
  components: {
    Account,
    Rewards,
    ValidatorExtendedDetail,
  },
})

export default class ValidatorManagement extends Vue {

  // exampleAddr = "0x2a3a7c850586d4f80a12ac1952f88b1b69ef48e1"
  exampleAddr = "NO"
  
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
  
  }
</style>


