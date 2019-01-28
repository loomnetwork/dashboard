<template>
  <b-modal id="seed-phrase-modal" ref="modalRef" title="Create Account" @ok="okHandler" ok-title="Next" ok-only ok-variant="outline-primary" centered no-close-on-backdrop>
    <b-container fluid>
      <b-row class="warning align-items-center py-4">
        <b-col sm="1"><fa :icon="['fa', 'exclamation-triangle']" style="font-size: 40px;"/></b-col>
        <b-col sm="11">
          <span class="text-white d-inline-flex align-items-center my-1"><fa :icon="['fa', 'circle']" style="padding-right: 10px;"/>Note: these 12 words allow you to recover your wallet in case of loss or damage.</span>
          <span class="text-white d-inline-flex align-items-center my-1"><fa :icon="['fa', 'circle']" style="padding-right: 10px;"/>You must create a backup!&nbsp;<b>Write or print it out and keep in a safe place.</b></span>
          <span class="text-white d-inline-flex align-items-center my-1"><fa :icon="['fa', 'circle']" style="padding-right: 10px;"/>Without it you will not be able to recover your tokens if something goes wrong.</span>
        </b-col>
      </b-row>
      <b-row class="seed-box align-items-center p-2 mt-3">
        <div class="col-sm-3 align-items-center my-1 px-1" v-for="(seed, index) in seeds" :key="index">
          <p class="seed-num p-1">{{index+1}}</p><span class="color-grey">{{seed}}</span>
        </div>
      </b-row>
      <b-row class="mt-3">
        <div class="input-group mb-2 mr-sm-2">
          <input type="text" ref="seedsLine" class="form-control" id="seedInput" v-model="seedsLine">
          <span class="input-group-append">
            <b-button type="button" class="input-group-text"
                      @click="copySeedstoClipboard">
              Copy to Clipboard
            </b-button>
          </span>
        </div>
      </b-row>
    </b-container>
  </b-modal>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { mapActions, createNamespacedHelpers } from 'vuex'
const DappChainStore = createNamespacedHelpers('DappChain')
const bip39 = require('bip39')

@Component({
  methods: {
    ...mapActions([
      'setSuccess'
    ])
  }
})

export default class SeedPhraseModal extends Vue {
  seeds = []
  seedsLine = ""
  okHandler() {
    this.$emit('ok', this.seeds);
  }
  generateSeeds() {
    const mnemonic = bip39.generateMnemonic()
    this.seeds = mnemonic.split(" ")
    this.seedsLine = mnemonic
  }
  show() {
    this.generateSeeds()
    this.$refs.modalRef.show()
  }
  copySeedstoClipboard() {
    this.$refs.seedsLine.select();
    document.execCommand('copy');
    this.setSuccess("Seeds copied to clipboard")
  }

}</script>
<style lang="scss">
#seed-phrase-modal .modal-dialog {
  width: 720px;
  max-width: 720px;
  .modal-header {
    margin-left: 10px;
    margin-right: 10px;
    padding-left: 5px;
    padding-right: 5px;
    h5 {
      color: gray;
    }
  }
  .modal-footer {
    border-top: none;
    .btn {
      width: 150px;
    }
  }
  .warning {
    background-color: #f3707a;
    border: 1px solid lightgrey;
    border-radius: 5px;
    color: white;
  }
  .seed-box {
    border: 1px solid lightgrey;
    border-radius: 5px;
    .seed-num {
      width: 30px;
      color: white;
      display: inline-block;
      border: 1px solid lightgrey;
      border-radius: 5px;
      margin-right: 10px;
      margin-bottom: 0;
      background-color: grey;
      text-align: center;
    }
  }
}
</style>
