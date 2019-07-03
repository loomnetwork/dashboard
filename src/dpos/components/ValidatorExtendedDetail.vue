<template>
  <div>
    <h4 v-if="!validators" style="opacity:0.5;">Validator not found</h4>
    <div class="card" v-else>
      <b-card-header class="validator-head">
        <div>
          <h1>{{ validators.name }}</h1>
          <h5>{{ validators.active ? "Active" : "Inactive" }}</h5>
          <br>
          <p>{{ validators.addr | loomAddress }}</p>
          <a :href="validators.website | url" target="_blank">
          {{validators.website | domain}}
          <fa icon="external-link-alt"/>
          </a>
        </div>
      </b-card-header>
        <b-card-body class="validator-body">
          <b-card-text>
            <p>{{ validators.description }}</p>
            <div class="public-key">
              <p>Public key</p>
              <span> {{ decodeUint8Array(validators.pubKey) }} </span>
            </div>
          </b-card-text>
          <b-row>
            <b-col cols="4">
              <dl>
                <dt>Fee</dt>
                <dd>{{ validators.fee }}</dd>
                <dt>New fee</dt>
                <dd>{{ validators.newFee }}</dd>
                <dt>Candidate state</dt>
                <dd>{{ validators.candidateState }}</dd>
                <dt>Max referral %</dt>
                <dd>{{ validators.maxReferralPercentage }} %</dd>
                <dt>Slash %</dt>
                <dd>{{ validators.slashPercentage }} %</dd>
              </dl>
            </b-col>
            <b-col cols="1"></b-col>
            <b-col cols="7">
              <dl>
                <dt>Delegation total</dt>
                <dd>{{ validators.delegationTotal | tokenAmount }}</dd>
                <dt>Total staked</dt>
                <dd>{{ validators.totalStaked | tokenAmount }}</dd>
                <dt>Staked amount</dt>
                <dd>{{ validators.stakedAmount | tokenAmount }}</dd>
                <dt>Whitelist amount</dt>
                <dd>{{ validators.whitelistAmount | tokenAmount }}</dd>
                <dt>Whitelist locktime tier</dt>
                <dd>{{ validators.whitelistLocktimeTier }}</dd>
              </dl>
            </b-col>
          </b-row>
        </b-card-body>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Watch, Prop } from "vue-property-decorator"
import { HasDPOSState } from "@/dpos/store/types"
import { formatTokenAmount } from "@/filters"
import { TextDecoder } from 'util';
import { formatToLoomAddress } from "@/utils"

export default class ValidatorExtendedDetail extends Vue{

  @Prop({ type: String })
  userAddress!: string
  
  get state(): HasDPOSState {
    return this.$store.state
  }

  get plasmaAddress() {
    return this.state.plasma.address
  }
  
  get validators() {
    const myValidator = this.state.dpos.validators.find((validator) => {
      return validator.addr === this.userAddress
      //return validator.addr === this.plasmaAddress 
    })
    // console.log("validator ADDR", myValidator!.addr)
    return myValidator ? myValidator : false
  }

  decodeUint8Array(key: Uint8Array) {
    return Buffer.from(key).toString('hex')
  }

}
</script>

<style lang="scss">

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
      margin-bottom: 10px;
    }
    dt {
      font-weight: 300;
    }
    dd {
      font-weight: 400;
      text-align: right;
    }
  }

.validator-head {
  background-color: white;
  div {
    margin: 1.3em 2.5em 0 2.5em;
    h1 {
      display: inline;
      color: black;
    }
    h5 {
      font-weight: 300;
      float: right;
      margin-top: 1.5%;
    }
    p {
      display: inline-block;
      vertical-align: top;
    }
    a {
      float: right;
    }
  }
}

.validator-body {
  margin: 0 2.5em 0 2.5em;
  p {
    color: black;
  }
}

.public-key {
  height: 50px;
  background-color: #F2F2F2;
  display:block;
  p {
    vertical-align: middle;
    color: #6E6E6E;
    line-height: 50px;
    display: inline-block;
    margin-left: 2.5%;
    font-weight: 500;
  }
  span {
    float: right;
    line-height: 50px;
    vertical-align: middle;
    color: rgba(110,110,110, 0.68);
    margin-right: 2.5%;
  }
}

</style>
