<template>
  <b-modal id="redelegate-modal" ref="modalRef" title="Create Account" hide-footer centered no-close-on-backdrop>
    <b-container fluid>

      <h1>
        Redelegate
      </h1>

      <div class="dropdown-container mb-4">
        <v-autocomplete :items="validators"
                        v-model="origin"
                        :get-label="getLabel"
                        :component-item="dropdownTemplate"
                        @item-selected="selectItem"
                        @update-items="updateItems">
        </v-autocomplete>
      </div>

      <div class="dropdown-container mb-4">
        <v-autocomplete :items="validators"
                        v-model="target"
                        :get-label="getLabel"
                        :component-item="dropdownTemplate"
                        @item-selected="selectItem"
                        @update-items="updateItems">
        </v-autocomplete>
      </div>      


    </b-container>
  </b-modal>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import RedelegateDropdownTemplate from './RedelegateDropdownTemplate'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  components: {
    RedelegateDropdownTemplate
  },
  computed: {
    ...DPOSStore.mapState([
      "validators",
      "validatorFields"
    ])
  },
  methods: {
    ...DPOSStore.mapActions([
      "getValidatorList",
      "redelegateAsync"
    ])
  }
})

export default class RedelegateModal extends Vue {

  dropdownTemplate = RedelegateDropdownTemplate

  async show() {
    if(this.validators.length <= 0) await this.getValidatorList()
    this.$refs.modalRef.show()
  }

  getLabel(item) {
    if(!item) return
    return item.label
  }


  updateItems(query) {
    if(query) {

    }
  }

  async selectItem(item) {
    if(!item) return
    const {path} = item
    await this.selectPath(path)
  }  
  
}
</script>
<style lang="scss">

</style>
