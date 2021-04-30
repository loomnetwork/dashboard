<template>
  <div>
    <b-card class="mb-4">
      <b-card-title class="statistics">
        <h4>{{ $t("views.statistics.statistics") }}</h4>
      </b-card-title>
      <hr />
      <b-row class="mb-3">
        <h5 style="position: absolute; left: 20px">
          {{ $t("views.statistics.missed_blocks") }}
        </h5>
        <a @click="refreshDowntime" style="position: absolute; right: 20px">
          <fa :icon="['fas', 'sync']" class="refresh-icon"/>
        </a>
      </b-row>
      <b-card-body v-if="downtimeRecord.periods.length > 0">
        <b-row>
          <b-col cols="12">
            <dl>
              <dt class="table-header">{{ $t("views.statistics.period") }}</dt>
              <dt class="table-header">
                {{ $t("views.statistics.blocks_missed") }}
              </dt>
            </dl>
            <dl v-for="(period, index) in downtimeRecord.periods">
              <dd v-if="index == 0">P</dd>
              <dd v-else>P-{{ index }}</dd>
              <dd>{{ period }}</dd>
            </dl>
          </b-col>
        </b-row>
      </b-card-body>
      <b-card-body v-else>
        {{ $t("views.statistics.no_downtime") }}
      </b-card-body>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { dposModule, ValidatorDowntimeRecord } from "@/dpos/store"
import { HasDPOSState } from "@/dpos/store/types"
import { Address } from "loom-js"

@Component
export default class Statistics extends Vue {
  downtimeRecord: ValidatorDowntimeRecord = {
    periods: [],
  }

  get state(): HasDPOSState {
    return this.$store.state
  }

  async mounted() {
    await this.refreshDowntime()
  }

  async getDowntimeRecords() {
    const validatorAddress = Address.fromString(
      `${this.state.plasma.chainId}:${this.state.plasma.address}`
    )
    this.downtimeRecord = await dposModule.getDowntimeRecordsList(
      validatorAddress
    )
  }

  async refreshDowntime(){
    await this.getDowntimeRecords()
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
  text-align: center;
}

dt {
  color: #6e6e6e;
  line-height: 50px;
  font-weight: 500;
  margin-bottom: 0;
}

dd {
  text-align: center !important;
  margin-bottom: 0;
  line-height: 30px;
}

dl {
  margin-bottom: 0;
}
</style>
