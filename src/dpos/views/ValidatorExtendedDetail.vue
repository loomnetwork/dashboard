<template>
  <div>
    <b-card v-for="validator in validators" :key="validator.name">
      <h2>{{ validator.name }}</h2>
      <p>Description : {{ validator.description }}</p>
      <p>Public Key : {{ validator.pubKey }}</p>
      <p>Max Referral Percentage : {{ validator.maxReferralPercentage }}</p>
      <p>Fee : {{ validator.fee }}</p>
      <p>New Fee : {{ validator.newFee }}</p>
      <p>Candidate State : {{ validator.candidateState }}</p>
      <p>Website : {{ validator.website }}</p>
      <hr>
      <p>Address : {{ validator.address }}</p>
      <p>Slash Percentage : {{ validator.slashPercentage }}</p>
      <p>Delegation Total : {{ validator.delegationTotal | tokenAmount }}</p>
      <p>Whitelist Amount : {{ validator.whitelistAmount | tokenAmount }}</p>
      <p>Whitelist Locktime Tier : {{ validator.whitelistLocktimeTier }}</p>
      <p>Staked Amount : {{ validator.stakedAmount | tokenAmount }}</p>
      <p>Total Staked : {{ validator.totalStaked }}</p>
      <p>Is Bootstrap ? : {{ validator.isBootstrap }}</p>
      <p>Active : {{ validator.active ? "Active" : "Inactive" }}</p>
      <p>Addr : {{ validator.addr }}</p>
    </b-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Watch } from "vue-property-decorator"
import { HasDPOSState } from "@/dpos/store/types"
import { formatTokenAmount } from "@/filters"
import { SignedTx } from "loom-js/dist/proto/loom_pb"
import { TextDecoder } from 'util';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

let seed = parseInt(localStorage.getItem("validatorListSeed") || "0", 10) || getRandomInt(100)
localStorage.setItem("validatorListSeed", "" + seed)

function random() {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

export default class ValidatorExtendedDetail extends Vue{
  
  get state(): HasDPOSState {
    return this.$store.state
  }
  
  get validators() {
    const storeValidators = this.state.dpos.validators.sort((a, b) => {
      const aValue = a.isBootstrap ? 0 : random() * 10000
      const bValue = b.isBootstrap ? 0 : random() * 10000
      return Math.floor(aValue) - Math.floor(bValue)
    }).reverse()
    return storeValidators.map((validator) => ({
        // ICandidate
        pubKey: this.decodeUint8Array(validator.pubKey),
        maxReferralPercentage: validator.maxReferralPercentage,
        fee: validator.fee,
        newFee: validator.newFee,
        candidateState: validator.candidateState,
        name: validator.name,
        description: validator.description,
        website: validator.website,
        // IValidator
        address: validator.address,
        slashPercentage: validator.slashPercentage,
        delegationTotal: validator.delegationTotal,
        whitelistAmount: validator.whitelistAmount,
        whitelistLocktimeTier: validator.whitelistLocktimeTier,
        stakedAmount: validator.stakedAmount,
        // INSERT delegation
        totalStaked: formatTokenAmount(validator.totalStaked),
        isBootstrap: validator.isBootstrap,
        active: validator.active,
        addr: validator.addr
    }))
  }

  decodeUint8Array(key: Uint8Array) {
    return Buffer.from(key).toString('hex')
  }

}
</script>

<style scoped>

</style>
