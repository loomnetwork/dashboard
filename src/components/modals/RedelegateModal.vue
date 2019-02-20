<template>
  <b-modal id="redelegate-modal" ref="modalRef" title="Create Account" hide-footer centered no-close-on-backdrop>
    <b-container fluid>
      <h1>
        Redelegate
      </h1>
    </b-container>
  </b-modal>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component({
  props: {
    hasDelegation: Boolean
  } 
})

export default class RedelegateModal extends Vue {

  show() {
    this.$refs.modalRef.show()
  }
  
}
</script>
<style lang="scss">

</style>
