<template>
  <main class="validatorMgmt">
    <header>
      <h1>Validator Management</h1>
    </header>
    <Account/>
  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import Account from "@/components/Account.vue"

@Component({
  components: {
    Account,
  },
})

export default class ValidatorManagement extends Vue {
  
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
  }
</style>


