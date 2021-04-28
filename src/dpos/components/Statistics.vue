<template>
  <div>
    <b-card class="mb-4">
      <b-card-title class="statistcs">
        <h4>{{ $t("views.statistcs.statistcs") }}</h4>
      </b-card-title>
      <hr />
      <b-card-body>
        <b-row>
          <b-col cols="12">
            <h5>{{ $t("views.statistcs.missed_blocks") }}</h5>
            <dl>
              <dt class="table-header">
                <p>{{ $t("views.statistcs.period") }}</p>
              </dt>
              <dt class="table-header">
                <p>{{ $t("views.statistcs.blocks_missed") }}</p>
              </dt>
            </dl>
            <dl class="table-body">
              <dd>
                <!-- <p> -->
                  validator.fee
                <!-- </p> -->
              </dd>
              <dd>
                <!-- <p> -->
                  validator.newFee
                  <!-- </p> -->
              </dd>
            </dl>
            <!-- <dl>
              <dd>validator.candidateState</dd>
              <dd>validator.maxReferralPercentage</dd>
            </dl> -->
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { dposModule } from "@/dpos/store"
import { HasDPOSState } from "@/dpos/store/types"

@Component
export default class Statistics extends Vue {
  claimRewards = dposModule.claimRewards

  // items = [
  //         { age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  //         { age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  //         { age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  //         { age: 38, first_name: 'Jami', last_name: 'Carney' }
  //       ]
      

  get state(): HasDPOSState {
    return this.$store.state
  }
}
</script>

<style lang="scss" scoped>

h4 {
  margin-bottom: 0.75rem;
}

.table-header {
  height: 50px;
  background-color: #f2f2f2;
  display: block;
  padding-top: 0;
  p {
    vertical-align: middle;
    color: #6e6e6e;
    line-height: 50px;
    display: inline-block;
    font-weight: 500;
    margin-left: 5%;
  }
}

.table-body {
  dd {
    text-align: left;
  }
}
</style>
