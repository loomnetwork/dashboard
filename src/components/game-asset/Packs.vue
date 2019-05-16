<template>
 <b-card class="mb-5">
  <b-card-title>My Packs</b-card-title>
    <b-table
        v-show="packs && packs.length > 0"
        striped
        bordered
        hover
        :items="packs"
        :fields="packTableFields"
    >
        <template slot="reciever" slot-scope="row">
        <b-input
            type="text"
            v-model="row.item.reciever"
            class="d-block"
            placeholder="dappchain address"
        />
        </template>
        <template slot="transfer" slot-scope="row">
        <b-button type="button" @click="transferpackTo(row.item)"> Transfer </b-button>
        </template>
    </b-table>
 </b-card>
</template>


<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import { plasmaModule } from "@/store/plasma"
import { DashboardState } from "@/types"
import { plasmaStorePlugin, PACKS_NAME } from "../../store/plasmaPlugin"
import { PackDetail } from '../../store/plasma/types';

@Component
export default class Packs extends Vue {
  checkPackBalance = plasmaModule.checkPackBalance
  packTypes = PACKS_NAME
  packs: PackDetail[] = []
  packTableFields = [
    {
      key: "type",
      sortable: true
    },
    {
      key: "amount",
      sortable: true
    },
    { key: "transfer", label: "Transfer" }
  ]

  get state(): DashboardState {
    return this.$store.state
  }

  get packBalance() {
    return this.state.plasma.packBalance
  }

  async mounted() {
    await this.checkPackBalance()
    this.packs = await this.packBalance
  }

}
</script>