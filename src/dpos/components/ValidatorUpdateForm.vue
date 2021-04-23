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
        required
      ></b-form-input>
      <p class="mb-1">{{ $t("components.validator_update_form.website") }} :</p>
      <b-form-input
        class="mb-3"
        id="input-website"
        v-model="form.website"
        type="text"
        required
      ></b-form-input>
      <p class="mb-1">{{ $t("components.validator_update_form.fee") }} :</p>
      <b-form-input
        class="mb-3"
        id="input-fee"
        v-model="form.fee.toString()"
        type="number"
        required
      ></b-form-input>
    </form>
    <template slot="modal-footer">
      <b-btn variant="primary" @click="submit()" class="mr-2">Submit</b-btn>
      <b-btn @click="close()" class="mr-2">Cancel</b-btn>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Validator } from "../store/types";
import { dposModule, UpdateValidatorDetailRequest } from "../store";
import BN from "bn.js";

@Component({
  components: {},
})
export default class ValidatorUpdateForm extends Vue {
  @Prop({ required: true }) validator!: UpdateValidatorDetailRequest // prettier-ignore

  visible = false;
  form = {
    name: this.validator.name,
    fee: this.validator.fee,
    description: this.validator.description,
    website: this.validator.website,
    maxReferralPercentage: this.validator.maxReferralPercentage,
  };

  show() {
    // @ts-ignore
    this.$refs.validatorUpdateform.show();
  }

  close() {
    // @ts-ignore
    this.$refs.validatorUpdateform.hide();
  }

  async submit() {
    console.log(this.form);
    let newValidatorDetail: UpdateValidatorDetailRequest;
    if (this.form.fee != this.validator.fee) {
      newValidatorDetail = {
        fee: new BN(this.form.fee!).muln(100),
        name: this.form.name,
        description: this.form.description,
        website: this.form.website,
        maxReferralPercentage: this.form.maxReferralPercentage,
      };
    } else {
      newValidatorDetail = {
        name: this.form.name,
        description: this.form.description,
        website: this.form.website,
        maxReferralPercentage: this.form.maxReferralPercentage,
      };
    }
    await dposModule.updateValidatorDetail(newValidatorDetail);
    this.close()
  }
}
</script>
