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
      <p class="mb-1">{{ $t("components.validator_update_form.fee") }}</p>
      <b-form-input
        id="input-fee"
        v-model="form.fee"
        type="number"
        required
        :disabled="!ableToChangeFee"
      ></b-form-input>
      <p class="mb-3" style="font-size: 12px;" v-if="!ableToChangeFee">({{ $t("components.validator_update_form.wait_change_fee_state") }})</p>
    </form>
    <template slot="modal-footer">
      <b-spinner v-if="disableButton" type="border" small />
      <b-btn variant="primary" @click="submit()" :disabled="disableButton" class="mr-2">Submit</b-btn>
      <b-btn @click="close()" class="mr-2" :disabled="disableButton">Cancel</b-btn>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { dposModule, UpdateValidatorDetailRequest } from "../store";
import BN from "bn.js"


interface UpdateValidatorFormRequest {
  name: string
  description: string
  website: string
  maxReferralPercentage: number;
  fee: BN;
}


@Component
export default class ValidatorUpdateForm extends Vue {
  @Prop({ required: true }) validator!: UpdateValidatorFormRequest // prettier-ignore
  @Prop({ required: true }) candidateState!: number // prettier-ignore

  disableButton = false
  form = {
    name: this.validator.name,
    fee: this.validator.fee.toNumber(),
    description: this.validator.description,
    website: this.validator.website,
    maxReferralPercentage: this.validator.maxReferralPercentage,
  };

  show() {
    // @ts-ignore
    this.$refs.validatorUpdateForm.show();
  }

  close() {
    // @ts-ignore
    this.$refs.validatorUpdateForm.hide();
  }

  async submit() {
    this.disableButton = true
    const newValidatorDetail: UpdateValidatorDetailRequest = {
      name: this.form.name,
      description: this.form.description,
      website: this.form.website,
      maxReferralPercentage: this.form.maxReferralPercentage,
    };
    if (this.form.name != this.validator.name || this.form.description != this.validator.description || this.form.website != this.validator.website || this.form.maxReferralPercentage != this.validator.maxReferralPercentage) {
      await dposModule.updateValidatorDetail(newValidatorDetail);
    }

    if (this.form.fee != this.validator.fee.toNumber()) {
      await dposModule.changeValidatorFee(this.form.fee*100);
    }
    this.close();
    this.disableButton = false
  }

  get ableToChangeFee() {
    return this.candidateState == 0
  }
}
</script>
