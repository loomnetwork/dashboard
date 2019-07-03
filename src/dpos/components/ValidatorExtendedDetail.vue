<template>
  <div>
    <b-card>
      <b-card-title>Validator Associated</b-card-title>
      <hr>
      <b-card-body v-if="!validator">
        No associated validator found.  But you can becoming a new validator!
        <b-button variant="primary" style="float:right;">Check out</b-button>
      </b-card-body>
      <b-card-header class="validator-head" v-if="validator">
        <div>
          <h2>{{ validator.name }}</h2>
          <h5>{{ validator.active ? "Active" : "Inactive" }}</h5>
          <br>
          <p>{{ validator.addr | loomAddress }}</p>
          <a :href="validator.website | url" target="_blank">
          {{validator.website | domain}}
          <fa icon="external-link-alt"/>
          </a>
        </div>
      </b-card-header>
        <b-card-body class="validator-body" v-if="validator">
          <b-card-text>
            <p>{{ validator.description }}</p>
            <div class="public-key">
              <p>Public key</p>
              <span> {{ decodeUint8Array(validator.pubKey) }} </span>
            </div>
          </b-card-text>
          <b-row>
            <b-col cols="4">
              <dl>
                <dt>Fee</dt>
                <dd>{{ validator.fee }}</dd>
                <dt>New fee</dt>
                <dd>{{ validator.newFee }}</dd>
                <dt>Candidate state</dt>
                <dd>{{ validator.candidateState }}</dd>
                <dt>Max referral %</dt>
                <dd>{{ validator.maxReferralPercentage }} %</dd>
                <dt>Slash %</dt>
                <dd>{{ validator.slashPercentage }} %</dd>
              </dl>
            </b-col>
            <b-col cols="1"></b-col>
            <b-col cols="7">
              <dl>
                <dt>Delegation total</dt>
                <dd>{{ validator.delegationTotal | tokenAmount }}</dd>
                <dt>Total staked</dt>
                <dd>{{ validator.totalStaked | tokenAmount }}</dd>
                <dt>Staked amount</dt>
                <dd>{{ validator.stakedAmount | tokenAmount }}</dd>
                <dt>Whitelist amount</dt>
                <dd>{{ validator.whitelistAmount | tokenAmount }}</dd>
                <dt>Whitelist locktime tier</dt>
                <dd>{{ validator.whitelistLocktimeTier }}</dd>
              </dl>
            </b-col>
          </b-row>
        </b-card-body>
    </b-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Watch, Prop } from "vue-property-decorator"
import { HasDPOSState } from "@/dpos/store/types"
import { formatTokenAmount } from "@/filters"
import { TextDecoder } from 'util';
import { formatToLoomAddress } from "@/utils"

@Component
export default class ValidatorExtendedDetail extends Vue{

  @Prop(String) userAddress!: string

  mounted() {
    console.log("SEND userADDRESS!!!", this.userAddress)
  }
  
  get state(): HasDPOSState {
    return this.$store.state
  }

  get plasmaAddress() {
    return this.state.plasma.address
  }
  
  get validator() {
    console.log("SEND userADDRESS", this.userAddress)
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
    h2 {
      display: inline;
      color: black;
    }
    h5 {
      font-weight: 300;
      float: right;
      margin-top: 0.5%;
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
