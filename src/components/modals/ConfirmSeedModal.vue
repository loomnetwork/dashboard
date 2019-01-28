<template>
  <b-modal id="confirm-seed-modal" ref="modalRef" title="Create Account" hide-footer centered no-close-on-backdrop>
    <b-container fluid>
      <b-row class="my-1 align-items-center">
        <p class="color-grey">Please type in words {{confirmIndexes[0] + 1}}, {{confirmIndexes[1] + 1}}, and {{confirmIndexes[2] + 1}} to confirm</p>
      </b-row>
      <b-row class="my-1 align-items-center" v-for="(confirm, index) in confirmIndexes" :key="index">
        <b-col sm="3"><span class="color-grey">Word{{confirm+1}}:</span></b-col>
        <b-col sm="9"><b-form-input v-model="words[index]"></b-form-input></b-col>
      </b-row>
      <b-row class="my-1 justify-content-between pt-4">
        <span class="text-error  mt-2" variant="error">{{errorMessage}}</span>
        <b-button class="btn" variant="primary" @click="okHandler">Create Account</b-button>
      </b-row>
    </b-container>
  </b-modal>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component({
})

export default class ConfirmSeedModal extends Vue {
  words = ["", "", ""]
  errorMessage = "";
  seedList = []
  confirmIndexes = [2, 5, 8]
  okHandler() {
    for(let i = 0; i < this.confirmIndexes.length; i ++) {
      if (this.words[i] !== this.seedList[this.confirmIndexes[i]]) {
        this.errorMessage = "Word is not match. Try again"
        return
      }
    }
    this.words = ["", "", ""]
    this.errorMessage = ""
    this.$emit('ok');
    this.$refs.modalRef.hide()
  }
  show(seeds) {
    this.seedList = seeds
    this.$refs.modalRef.show()
  }
}</script>
<style lang="scss">
label {
  color: gray;
}
#confirm-seed-modal .modal-dialog {
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
