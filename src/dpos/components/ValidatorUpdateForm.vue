<template>
  <b-modal ref="validatorUpdateform" id="validator-update-form">
    <template slot="modal-title">
      {{ $t("components.validator_update_form.title") }}
    </template>
    <form>
      <p class="mb-1">{{ $t("components.validator_update_form.name") }} :</p>
      <b-form-input
        class="mb-3"
        id="input-name"
        v-model="form.name"
        type="text"
        :value="validator.name"
        required
      ></b-form-input>
      <p class="mb-1">
        {{ $t("components.validator_update_form.description") }} :
      </p>
      <b-form-input
        class="mb-3"
        id="input-description"
        v-model="form.description"
        type="text"
        :value="validator.description"
        required
      ></b-form-input>
      <p class="mb-1">{{ $t("components.validator_update_form.fee") }} :</p>
      <b-form-input
        class="mb-3"
        id="input-fee"
        v-model="form.fee"
        type="number"
        :value="validator.fee"
        required
      ></b-form-input>
      <p class="mb-1">{{ $t("components.validator_update_form.website") }} :</p>
      <b-form-input
        class="mb-3"
        id="input-website"
        v-model="form.website"
        type="text"
        :value="validator.website | domain"
        required
      ></b-form-input>
      <p class="mb-1">
        {{ $t("components.validator_update_form.max_referral_percentage") }} :
      </p>
      <b-form-input
        class="mb-3"
        id="input-max_referral_percentage"
        v-model="form.max_referral_percentage"
        type="text"
        :value="validator.max_referral_percentage"
        required
      ></b-form-input>
    </form>
    <template slot="modal-footer">
      <b-btn @click="submit()" class="mr-2">Submit</b-btn>
      <b-btn @click="close()" class="mr-2">Cancel</b-btn>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Validator } from "../store/types";

@Component({
  components: {},
})
export default class ValidatorUpdateForm extends Vue {
  @Prop({ required: true }) validator!: Validator // prettier-ignore

  visible = false;
  form = {
    name: this.validator.name,
    fee: this.validator.fee,
    description: this.validator.description,
    website: this.validator.website,
    max_referral_percentage: this.validator.maxReferralPercentage,
  };

  show() {
    this.$refs.validatorUpdateform.show();
  }

  close() {
    this.$refs.validatorUpdateform.hide();
  }

  submit() {
    console.log(this.form);
  }
}
</script>
