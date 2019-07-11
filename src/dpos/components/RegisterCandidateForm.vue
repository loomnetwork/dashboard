<template>
  <b-card bg-variant="light">
    <b-form @submit="onSubmit">
      <b-form-group label="Validator Name" label-for="input-name">
        <b-form-input
          id="input-name"
          v-model="form.name"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Description" label-for="input-description">
        <b-form-textarea
          id="input-description"
          v-model="form.description"
          required
        ></b-form-textarea>
      </b-form-group>

      <b-form-group label="Website" label-for="input-website">
        <b-form-input
          id="input-website"
          v-model="form.website"
          type="url"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Fee" label-for="input-fee">
        <b-form-input
          id="input-fee"
          v-model="form.fee"
          type="number"
          required
        ></b-form-input>
      </b-form-group>
    <b-button type="submit" variant="primary" style="float: right;">Submit</b-button>
    </b-form>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { Address } from "loom-js"
import { formatToLoomAddress, ZERO, parseToWei } from "../../utils"
import { LocktimeTier, CandidateState } from "loom-js/dist/proto/dposv3_pb"
import { dposModule } from "../store"

@Component
export default class RegisterCandidateForm extends Vue {

  form = {
    name: "",
    description: "",
    website: "",
    fee: 0,
  }

  onSubmit(evt) {
    evt.preventDefault()
    const candidate = {
        address: Address.fromString(this.$store.state.plasma.chainId + ":" + this.$store.state.plasma.address),
        pubKey: new Uint8Array(),
        delegationTotal: ZERO,
        slashPercentage: ZERO,
        whitelistAmount: ZERO,
        whitelistLocktimeTier: LocktimeTier.TIER_ONE,
        fee: parseToWei(this.form.fee.toString()),
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
