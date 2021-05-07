<template>
  <b-modal ref="validatorUpdateForm" id="validator-update-form">
    <template slot="modal-title">
      {{ $t("components.validator_update_form.title") }}
    </template>
    <form>
      <p class="mb-1">{{ $t("components.validator_update_form.name") }}</p>
      <b-form-input
        class="mb-3"
        id="input-name"
        v-model="form.name"
        type="text"
        required
      ></b-form-input>
      <p class="mb-1">
        {{ $t("components.validator_update_form.description") }}
      </p>
      <b-form-input
        class="mb-3"
        id="input-description"
        v-model="form.description"
        type="text"
        required
      ></b-form-input>
      <p class="mb-1">{{ $t("components.validator_update_form.website") }}</p>
      <b-form-input
        class="mb-3"
        id="input-website"
        v-model="form.website"
        type="text"
        required
      ></b-form-input>
      <p class="mb-1">{{ $t("components.validator_update_form.fee") }} {{ `(${minFee} - ${maxFee}%)` }}</p>
      <b-form-input
        id="input-fee"
        v-model="form.fee"
        type="number"
        required
        :disabled="!ableToChangeFee"
      ></b-form-input>
      <p class="mb-3" style="font-size: 12px;" v-if="!ableToChangeFee">
        ({{ $t("components.validator_update_form.wait_change_fee_state") }})
      </p>
      <p class="mb-3" style="font-size: 12px; color:red" v-if="!validFee">
        ({{
          $t("components.validator_update_form.validate_fee", {
            min: minFee,
            max: maxFee
          })
        }})
      </p>
    </form>
    <template slot="modal-footer">
      <b-spinner v-if="txInProgress" type="border" small />
      <b-btn
        variant="primary"
        @click="submit()"
        :disabled="submitBtnDisabled"
        class="mr-2"
        >Submit</b-btn
      >
      <b-btn @click="close()" class="mr-2" :disabled="txInProgress"
        >Cancel</b-btn
      >
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { dposModule, UpdateValidatorDetailRequest } from "../store"
import BN from "bn.js"
import { DPOSState, HasDPOSState } from "@/dpos/store/types"
import { Store } from "vuex"

interface UpdateValidatorFormRequest {
  name: string
  description: string
  website: string
  maxReferralPercentage: number
  fee: BN
}

@Component
export default class ValidatorUpdateForm extends Vue {
  @Prop({ required: true }) validator!: UpdateValidatorFormRequest // prettier-ignore
  @Prop({ required: true }) candidateState!: number // prettier-ignore

  txInProgress = false
  form = {
    name: this.validator.name,
    fee: this.validator.fee.toNumber(),
    description: this.validator.description,
    website: this.validator.website,
    maxReferralPercentage: this.validator.maxReferralPercentage,
  }

  get submitBtnDisabled() {
    return this.txInProgress || !this.validFee
  }

  get state(): DPOSState {
    return (this.$store as Store<HasDPOSState>).state.dpos
  }

  get minFee() {
    return this.state.minCandidateFee / 100
  }

  get maxFee() {
    return this.state.maxCandidateFee / 100
  }

  show() {
    // @ts-ignore
    this.$refs.validatorUpdateForm.show()
  }

  close() {
    // @ts-ignore
    this.$refs.validatorUpdateForm.hide()
  }

  async submit() {
    this.txInProgress = true
    const newValidatorDetail: UpdateValidatorDetailRequest = {
      name: this.form.name,
      description: this.form.description,
      website: this.form.website,
      maxReferralPercentage: this.form.maxReferralPercentage,
    }
    if (
      this.form.name !== this.validator.name ||
      this.form.description !== this.validator.description ||
      this.form.website !== this.validator.website ||
      this.form.maxReferralPercentage !== this.validator.maxReferralPercentage
    ) {
      await dposModule.updateValidatorDetail(newValidatorDetail)
    }

    if (this.form.fee !== this.validator.fee.toNumber()) {
      await dposModule.changeValidatorFee(this.form.fee * 100)
    }
    this.close()
    this.txInProgress = false
  }

  get ableToChangeFee() {
    return this.candidateState === 0
  }

  get validFee() {
    return (
      this.form.fee >= this.minFee &&
      this.form.fee <= this.maxFee
    )
  }
}
</script>
