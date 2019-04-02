<template>

    <b-card no-body class="mb-1"
            :class="latestBlock - event.item['Block #'] <= 10 ? 'animated flash slow infinite' : '' ">
      <b-card-header @click="$root.$emit('bv::toggle::collapse', 'history-item' + event.idx)"
                    header-tag="header"
                    class="d-flex justify-content-between p-2"
                    role="tab">
        <span>{{event.item["Event"]}}</span>
        <strong>{{event.item["Amount"]}}</strong>
      </b-card-header>
      <b-collapse :id="'history-item' + event.idx" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <ul>
            <li v-if="latestBlock - event.item['Block #'] <= 10">
              <strong class="block-confirmation-msg">
                Blocks confirmations: {{(latestBlock - event.item["Block #"]) + 1}}
              </strong>
            </li>
            <li>Block #: {{event.item["Block #"]}}</li>
            <li>Amount: {{event.item["Amount"]}}</li>
            <li>Tx Hash: {{event.item["Tx Hash"]}}</li>
          </ul>
        </b-card-body>
      </b-collapse>
    </b-card>

</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapActions, mapMutations, mapState, createNamespacedHelpers } from 'vuex'
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  props: {
    event: Object,
    latestBlock: Number
  },
  computed: {}
})
export default class HistoryEvent extends Vue {

  // @Watch("event")
  //   onMappedChange(newValue, oldValue) {
  //   if(newValue) {
  //     this.latestBlock - newValue.item['Block #'] <= 10
  //     this.$emit("keepPolling");
  //   }
  // }

}
</script>
<style scoped lang="scss">
  .custom-card-header {
    background-color: #ffffff;
  }
  .block-confirmation-msg {
    color: #f04e4e;
  }
</style>
