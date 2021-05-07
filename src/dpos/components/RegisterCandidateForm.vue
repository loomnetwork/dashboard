<template>
  <div>
    <hr />
    <b-card class="token-counter mb-3">
      <b-row>
        <b-col
          ><b-card-title class="ml-3 mt-2">{{
            $t("components.registerCandidate.stake_million_tokens")
          }}</b-card-title></b-col
        >
        <b-col v-if="isStakable"
          ><span class="stake-ready"
            >&#10003;
            {{ $t("components.registerCandidate.ready_to_stake") }}</span
          ></b-col
        >
        <b-col v-else
          ><span class="stake-not-ready"
            >&#10007;
            {{ $t("components.registerCandidate.insufficient_loom") }}</span
          ></b-col
        >
      </b-row>
      <b-card-body>
        <b-row>
          <b-col>
            <b-row>
              <b-col
                ><span class="amount-label">{{
                  $t("components.registerCandidate.required")
                }}</span></b-col
              >
              <b-col><span style="color:#327BFD;">1,250,000 LOOM</span></b-col>
            </b-row>
          </b-col>
          <b-col>
            <b-row>
              <b-col
                ><span class="amount-label">{{
                  $t("components.registerCandidate.your_balance")
                }}</span></b-col
              >
              <b-col
                ><span>{{ fixedLoomBalance }} LOOM</span></b-col
              >
            </b-row>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>
    <b-card
      class="candidate-form mb-3"
      :class="{ 'candidate-form disabled mb-3': !isStakable }"
    >
      <b-row>
        <b-col
          ><b-card-title class="ml-3 mt-2">{{
            $t(
              "components.validator_extended_detail.register_this_account_as_a_validator",
              { address: "" }
            )
          }}</b-card-title></b-col
        >
        <b-col
          ><b-button
            class="more-detail"
            variant="link"
            size="sm"
            :href="guideLink"
            target="_blank"
            >More Detail</b-button
          ></b-col
        >
      </b-row>
      <b-form @submit="onSubmit">
        <b-form-group class="main-form">
          <label for="input-name">{{
            $t("components.registerCandidate.validator_name")
          }}</label>
          <b-form-input
            class="main-input name-input"
            id="input-name"
            v-model="form.name"
            required
          ></b-form-input>
          <label for="input-pubkey">{{
            $t("components.registerCandidate.public_key")
          }}</label>
          <b-form-input
            class="main-input key-input"
            id="input-pubkey"
            v-model="form.pubKey"
            required
          ></b-form-input>
          <label for="input-description">{{
            $t("components.registerCandidate.description")
          }}</label>
          <b-form-textarea
            class="main-input desc-input"
            id="input-description"
            v-model="form.description"
            required
          ></b-form-textarea>
          <b-row>
            <b-col>
              <b-input-group
                :prepend="$t('components.registerCandidate.website')"
              >
                <b-form-input
                  class="main-input website-input"
                  id="input-website"
                  v-model="form.website"
                  type="url"
                  required
                ></b-form-input>
              </b-input-group>
            </b-col>
            <b-col>
              <b-input-group
                class="fee-group"
                :prepend="$t('components.registerCandidate.fee')"
                append="%"
              >
                <b-form-input
                  class="main-input fee-input"
                  id="input-fee"
                  v-model="form.fee"
                  type="number"
                  required
                ></b-form-input>
              </b-input-group>
            </b-col>
          </b-row>
          <p
            class="mb-3 float-right"
            style="font-size: 12px; color:red"
            v-if="!validFee"
          >
            ({{
              $t("components.registerCandidate.validate_fee", {
                min: state.dpos.minCandidateFee / 100,
                max: state.dpos.maxCandidateFee / 100
              })
            }})
          </p>
        </b-form-group>
        <b-button
          type="submit"
          class="submit-btn mt-3"
          adasdasdssize="lg"
          variant="primary"
          style="float:right;"
          :disabled="!validFee"
          >{{ $t("button.submit") }}</b-button
        >
      </b-form>
    </b-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { HasDPOSState } from "@/dpos/store/types"
import { Component } from "vue-property-decorator"
import { Address, CryptoUtils } from "loom-js"
import { ZERO, parseToWei } from "../../utils"
import { LocktimeTier, CandidateState } from "loom-js/dist/proto/dposv3_pb"
import { dposModule } from "../store"
import { formatTokenAmount } from "@/filters"
import BN from "bn.js"

@Component
export default class RegisterCandidateForm extends Vue {
  guideLink = "https://loomx.io/developers/en/validator.html"

  form = {
    pubKey: "",
    name: "",
    description: "",
    website: "",
    fee: 0,
  }

  get state(): HasDPOSState {
    return this.$store.state
  }

  get fixedLoomBalance() {
    return formatTokenAmount(this.state.plasma.coins.LOOM.balance, 18, 2)
  }

  get isStakable() {
    const myBalance = this.state.plasma.coins.LOOM.balance
    // 1.25M LOOM
    const requiredAmount = parseToWei("1250000")
    return myBalance.gte(requiredAmount)
  }

  onSubmit(evt) {
    evt.preventDefault()
    const candidate = {
      pubKey: CryptoUtils.B64ToUint8Array(this.form.pubKey),
      whitelistLocktimeTier: LocktimeTier.TIER_THREE,
      fee: new BN(this.form.fee).muln(100),
      name: this.form.name,
      description: this.form.description,
      website: this.form.website,
    }
    dposModule.registerCandidate(candidate)
  }

  get validFee() {
    return (
      this.form.fee * 100 >= this.state.dpos.minCandidateFee &&
      this.form.fee * 100 <= this.state.dpos.maxCandidateFee
    )
  }
}
</script>

<style lang="scss">
label {
  font-weight: 500;
  color: #212529;
  margin-bottom: 1rem;
  margin-left: 0.5rem;
}

.token-counter {
  .stake-ready {
    float: right;
    color: #59b72f;
    margin-right: 1.5rem;
    margin-top: 0.7rem;
    font-weight: 400;
    font-size: 18px;
  }
  .stake-not-ready {
    float: right;
    color: #ff6767;
    margin-right: 1.5rem;
    margin-top: 0.7rem;
    font-weight: 400;
    font-size: 18px;
  }

  .amount-label {
    color: grey;
  }
}

.candidate-form {
  .input-group-text {
    font-weight: 500;
    color: #212529;
    background-color: #f8f9fa;
  }

  .main-form {
    margin-right: 1.5rem;
    margin-top: 2.5rem;
    margin-left: 1rem;
    margin-bottom: 1rem;
  }

  .main-input {
    padding-left: 1.5rem;
    background-color: #f8f9fa;
  }

  .name-input {
    font-size: 21px;
    color: black;
    font-weight: 500;
    margin-bottom: 2rem;
    padding-top: 1.75rem;
    padding-bottom: 1.75rem;
  }

  .key-input {
    margin-bottom: 2rem;
    font-weight: 400;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .desc-input {
    padding-top: 0.75rem;
    padding-bottom: 1rem;
    margin-bottom: 3rem;
  }

  .website-input {
    text-align: right;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    color: #327bfd;
  }

  .fee-group {
    width: 65%;
    float: right;
  }

  .fee-input {
    text-align: right;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .more-detail {
    float: right;
    margin-right: 1.5rem;
    margin-top: 0.5rem;
  }

  .submit-btn {
    margin-right: 1.5rem;
    margin-left: 1rem;
  }
}

.candidate-form.disabled {
  pointer-events: none;
  opacity: 0.3;
}
</style>
