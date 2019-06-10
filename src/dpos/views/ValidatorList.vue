<template>
  <main class="validators">
    <div class="row" v-if="validators && validators.length > 0">
      <div class="col">
        <header>
          <h1>{{ $t('views.validator_list.validators') }}</h1>
        </header>
        <div class="content">
          <template v-if="isSmallDevice">
            <b-list-group>
              <b-list-group-item
                v-for="validator in validators"
                :key="validator.name"
                :disabled="!!validator.isBootstrap"
                @click="showValidatorDetail(validator)"
              >
                <h6>{{validator.name}}</h6>
                <div class="fee">
                  <label>Fee</label>
                  {{validator.fees}}
                </div>
                <div class="stakes">
                  <label>Stake</label>
                  <span>{{validator.totalStaked | tokenAmount}}</span>
                </div>
                <div
                  v-if="!isSmallDevice"
                  class="status"
                  :class="{'active': validator.Status === 'Active'}"
                >{{validator.status}}</div>
              </b-list-group-item>
            </b-list-group>
          </template>
          <template v-else>
            <b-table
              responsive
              table-active="table-active"
              tr-class="spacer"
              :items="validators"
              :fields="validatorFields"
              :sort-desc="false"
              @row-clicked="showValidatorDetail"
            >
              <template
                slot="delegationsTotal"
                slot-scope="data"
              >{{data.item.totalStaked | tokenAmount}}</template>
              <template slot="active" slot-scope="data">{{data.item.active ? "Active" : ""}}</template>
            </b-table>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import LoadingSpinner from "../components/LoadingSpinner.vue"
import { CryptoUtils, LocalAddress } from "loom-js"
import { HasDPOSState } from "@/dpos/store/types"

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

let seed = parseInt(localStorage.getItem("validatorListSeed") || "0", 10) || getRandomInt(100)
localStorage.setItem("validatorListSeed", "" + seed)

function random() {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

@Component
export default class ValidatorList extends Vue {
  isSmallDevice = window.innerWidth < 600

  validatorFields = [{ key: "name", sortable: true, label: "Name" },
  { key: "active", sortable: true, label: "Active" },
  { key: "delegationsTotal", sortable: true, label: "Total Staked" },
  { key: "fees", sortable: true, label: "Fee" },
  ]

  get state(): HasDPOSState {
    return this.$store.state
  }

  get validators() {
    return this.state.dpos.validators.sort((a, b) => {
      const aValue = a.isBootstrap ? 0 : random() * 10000
      const bValue = b.isBootstrap ? 0 : random() * 10000
      return Math.floor(aValue) - Math.floor(bValue)
    }).reverse()
  }

  /**
   * adds class bootstrap node if is bootstrap
   */
  validatorCssClass(item, type) {
    return item.isBoostrap ? ["boostrap-validator"] : []
  }

  showValidatorDetail(record, index) {
    this.$router.push(`/validator/${encodeURIComponent(record.name)}`)
  }
}
</script>

<style lang="scss">
main.validators {
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

  .list-group-item {
    padding: 0.2em 1em;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    > h6 {
      flex: 1;
    }
    &.disabled {
      opacity: 0.5;
    }
    .stakes {
      text-align: right;
      width: 110px;
    }
    .fee {
      flex: 0;
      font-size: 10px;
      widows: 10px;
    }
    .stakes > label {
      display: block;
      display: none;
      margin: 0;
      font-size: 12px;
      line-height: 12px;
      text-align: left;
    }
    .fee > label {
      display: inline-block;
      margin: 0;
      font-size: 10px;
      line-height: 24px;
      text-align: right;
      vertical-align: bottom;
      margin-right: 7px;
      font-weight: bold;
      color: rgba(128, 128, 128, 0.58);
    }
    .status {
      flex: 50%;
      font-size: 0.8em;
      &.active {
        color: green;
      }
    }
  }
}
</style>
