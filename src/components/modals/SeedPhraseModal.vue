<template>
  <b-modal
    v-model="visible"
    id="seed-phrase-modal"
    ref="modalRef"
    title="Create Account"
    centered
    no-close-on-backdrop
    hide-footer
  >
    <b-container fluid>
      <b-row class="warning align-items-center py-4">
        <b-col sm="1">
          <fa :icon="['fa', 'exclamation-triangle']" style="font-size: 40px;"/>
        </b-col>
        <b-col sm="11">
          <span class="text-white d-inline-flex align-items-center my-1">
            <fa :icon="['fa', 'circle']" style="padding-right: 10px;"/>
            {{ $t('components.modals.seed_phrase_modal.note_these_12_words_allow') }}
          </span>
          <span class="text-white d-inline-flex align-items-center my-1">
            <fa :icon="['fa', 'circle']" style="padding-right: 10px;"/>
            {{ $t('components.modals.seed_phrase_modal.you_must_create_a_backup_nbsp') }}
            <b>&nbsp; {{ $t('components.modals.seed_phrase_modal.write_or_print_it_out') }}</b>
          </span>
          <span class="text-white d-inline-flex align-items-center my-1">
            <fa :icon="['fa', 'circle']" style="padding-right: 10px;"/>
            {{ $t('components.modals.seed_phrase_modal.without_it_you_will_not') }}
          </span>
        </b-col>
      </b-row>
      <b-row class="seed-box align-items-center p-2 mt-3">
        <div
          class="col-sm-3 align-items-center my-1 px-1"
          v-for="(seed, index) in seeds"
          :key="index"
        >
          <p class="seed-num p-1">{{index+1}}</p>
          <span class="color-grey">{{seed}}</span>
        </div>
      </b-row>
      <b-row class="mt-3">
        <div class="input-group mb-2 mr-sm-2">
          <input
            type="text"
            ref="seedsLine"
            class="form-control"
            id="seedInput"
            v-model="seedsLine"
          >
          <span class="input-group-append">
            <b-button type="button" class="input-group-text" @click="copyToClipboard('seedInput')">
              <fa :icon="['fa', 'clone']" style="font-size: 20px;"/>
            </b-button>
          </span>
        </div>
      </b-row>
      <b-row class="mt-3">
        <div class="input-group mb-2 mr-sm-2">
          <b-form-input
            type="text"
            class="form-control"
            :value="publicAddress | loomAddress"
            id="newPublicAddress"
          ></b-form-input>
          <span class="input-group-append">
            <b-button
              type="button"
              class="input-group-text"
              @click="copyToClipboard('newPublicAddress')"
            >
              <fa :icon="['fa', 'clone']" style="font-size: 20px;"/>
            </b-button>
          </span>
        </div>
      </b-row>
      <b-form-checkbox
        class="my-2"
        id="confirmMnemonic"
        v-model="confirmMnemonic"
        name="confirmMnemonic"
      >{{ $t('components.modals.seed_phrase_modal.confirm_mnemonic') }}</b-form-checkbox>
      <b-button
        type="button"
        @click="closeModal()"
        class="input-group-text"
        :disabled="!confirmMnemonic"
      >{{ $t('button.done') }}</b-button>
    </b-container>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { plasmaModule } from "@/store/plasma"
import { BModal } from "bootstrap-vue"
import { feedbackModule } from "@/feedback/store"
import { whiteListModule } from "../../whitelist/store"

@Component({
})
export default class SeedPhraseModal extends Vue {
  showSuccess = feedbackModule.showSuccess
  getPublicAddressFromPrivateKeyUint8Array = plasmaModule.getPublicAddrePriaKeyUint8Array
  confirmMnemonic = false

  copyToClipboard(inputId) {
    const copyText = document.getElementById(inputId)
    // @ts-ignore
    copyText!.select()
    document.execCommand("copy")
    this.showSuccess(this.$t("messages.copied_tx").toString())
  }

  modal(ref: string): BModal {
    return this.$refs[ref] as BModal
  }

  closeModal() {
    this.modal("modalRef").hide()
  }

  mounted() {
    this.$root.$on("bv::modal::show", () => {
      this.confirmMnemonic = false
    })
  }

  get visible() {
    return !!this.$store.state.whiteList.seed.publicAddress
  }

  set visible(value) {
    if (value === false) {
      this.$store.state.whiteList.seed.mnemonic = ""
      this.$store.state.whiteList.seed.publicAddress = ""
    }
  }

  get seeds() {
    return this.$store.state.whiteList.seed.mnemonic.split(" ")
  }

  get seedsLine() {
    return this.$store.state.whiteList.seed.mnemonic
  }

  get publicAddress() {
    return this.$store.state.whiteList.seed.publicAddress
  }
}
</script>

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