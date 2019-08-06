<template>
  <b-card bg-variant="light">
    <b-form @submit="onSubmit">
      <b-form-group :label="$t('components.registerCandidate.public_key')" label-for="input-pubkey">
        <b-form-input
          id="input-pubkey"
          v-model="form.pubKey"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group :label="$t('components.registerCandidate.validator_name')" label-for="input-name">
        <b-form-input
          id="input-name"
          v-model="form.name"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group :label="$t('components.registerCandidate.description')" label-for="input-description">
        <b-form-textarea
          id="input-description"
          v-model="form.description"
          required
        ></b-form-textarea>
      </b-form-group>

      <b-form-group :label="$t('components.registerCandidate.website')" label-for="input-website">
        <b-form-input
          id="input-website"
          v-model="form.website"
          type="url"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group :label="$t('components.registerCandidate.fee')" label-for="input-fee">
        <b-form-input
          id="input-fee"
          v-model="form.fee"
          type="number"
          required
        ></b-form-input>
      </b-form-group>
    <b-button type="submit" variant="primary" style="float: right;">{{ $t('button.submit') }}</b-button>
    </b-form>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { Address, CryptoUtils } from "loom-js"
import { formatToLoomAddress, ZERO, parseToWei } from "../../utils"
import { LocktimeTier, CandidateState } from "loom-js/dist/proto/dposv3_pb"
import { dposModule } from "../store"
import BN from "bn.js"

@Component
export default class RegisterCandidateForm extends Vue {

  form = {
    pubKey: "",
    name: "",
    description: "",
    website: "",
    fee: 0,
  }

  onSubmit(evt) {
    evt.preventDefault()
    const candidate = {
        address: Address.fromString(this.$store.state.plasma.chainId + ":" + this.$store.state.plasma.address),
        pubKey: CryptoUtils.B64ToUint8Array(this.form.pubKey),
        delegationTotal: ZERO,
        slashPercentage: ZERO,
        whitelistAmount: ZERO,
        whitelistLocktimeTier: LocktimeTier.TIER_ONE,
        fee: new BN(this.form.fee),
        newFee: ZERO,
        candidateState: CandidateState.REGISTERED,
        name: this.form.name,
        description: this.form.description,
        website: this.form.website,
    }
    dposModule.registerCandidate(candidate)
  }

}
</script>

<style lang="scss">
label {
  font-weight: 500;
  color: #212529;
}
</style>
