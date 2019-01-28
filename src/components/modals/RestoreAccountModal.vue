<template>
  <b-modal id="restore-account-modal" ref="modalRef" title="Restore Account" hide-footer centered>
    <b-container fluid>
      <b-row class="my-1 align-items-center">
        <p class="color-grey">Please type in your seed phrase below.</p>
        <p class="color-grey">Note: the phrase is case sensitive and each word needs to be separated by one space.</p>
      </b-row>
      <b-row class="my-1 align-items-center">
        <b-form-input v-model="seeds" :rows="3" type="text"></b-form-input>
      </b-row>
      <b-row class="my-1 justify-content-between pt-4">
        <span class="text-error  mt-2" variant="error">{{errorMessage}}</span>
        <b-button class="btn" variant="primary" @click="okHandler">Restore Account</b-button>
      </b-row>
    </b-container>
  </b-modal>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component({
})

export default class RestoreAccountModal extends Vue {
  seeds = "";
  errorMessage = "";
  okHandler() {
    const seedList = this.seeds.split(' ')
    if (seedList.length !== 12) {
      this.errorMessage = "Not 12 words..."
    } else {
      this.errorMessage = ""
      this.$emit('ok', this.seeds);
      this.$refs.modalRef.hide()
    }
  }
  show() {
    this.$refs.modalRef.show()
  }
}</script>
<style lang="scss">
label {
  color: gray;
}
#restore-account-modal .modal-dialog {
  width: 500px;
  max-width: 500px;
  .modal-header {
    margin-left: 10px;
    margin-right: 10px;
    padding-left: 5px;
    padding-right: 5px;
    h5 {
      color: gray;
    }
  }
  .modal-body {
    .col-sm-3, .col-sm-9 {
      padding: 0;
    }
    .text-error {
      color: red;
    }
    .btn {
      width: 150px;
    }
  }
}
</style>
