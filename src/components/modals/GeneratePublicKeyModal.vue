<template>
  <b-modal 
    id="gen-public-key-modal"
    @hide="onHideModal">
    Anything ...
  </b-modal>
</template>

 <script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class GeneratePublicKeyModal extends Vue {
  @Prop(Boolean) showModal:boolean
   @Watch('showModal')
  onShowModalChanged (newVal, oldVal) {
    if (this.showModal) {
      this.$root.$emit('bv::show::modal', 'gen-public-key-modal')
    }
  }
  onHideModal () {
    this.$emit('hide') // Emit to parent when modal hide
  }
}
</script>

 <style>
 </style>