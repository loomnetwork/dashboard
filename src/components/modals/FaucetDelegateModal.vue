<template>
  <b-modal id="faucet-delegate-modal" ref="modalRef" ok-only hide-header centered>
    <b-container fluid>
      <div v-if="loading" class="loading-spinner-container">
        <loading-spinner :showBackdrop="true"></loading-spinner>
      </div>      
      <div v-else>     
        <b-row class="my-1 mb-3">
          <b-col sm="3"><label>Amount:</label></b-col>
          <b-col sm="9"><b-form-input v-model="delegationDetail.amount" type="number" value="0"></b-form-input></b-col>
        </b-row>
        <b-row class="my-1" v-if="!unbond" key="range">
          <b-col sm="6"><label id="lockTimeReward" for="locktime">Locktime / Bonuses:</label></b-col>
          <b-col sm="6"><span>{{locktimeTiers[locktimeTierVal]}} / {{bonusTiers[locktimeTierVal]}}</span></b-col>
          <b-col><b-form-input v-model="locktimeTierVal" :min="locktimeTier || 0" max="3" value="0" :formatter="formatRangeInput" id="locktime" type="range" data-toggle="tooltip"></b-form-input></b-col>
          <b-tooltip target="lockTimeReward" placement="bottom" title="In order to qualify for the associated the reward multiplier, keep your tokens staked until the locktime has expired"></b-tooltip>
        </b-row> 
      </div>
    </b-container>
    <div slot="modal-footer" class="w-100">
      <b-button v-if="!loading" style="width: 160px; float: right;" variant="primary" @click="requestDelegate">{{okTitle}}</b-button>
    </div>    
  </b-modal>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import LoadingSpinner from '../../components/LoadingSpinner'
import { getAddress, addressFromPubKey } from '../../services/dposv2Utils.js'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  props: {
    locktimeTier: Number,
    hasDelegation: Boolean
  },
  components: {
    LoadingSpinner
  },
  computed: {
    ...mapGetters([
      'getPrivateKey'
    ]),
    ...DappChainStore.mapGetters([
      'currentChain',
      'currentRPCUrl',
    ]),
    ...DPOSStore.mapState([
      'validators'
    ])
  },
  methods: {
    ...mapActions([
      'setError'
    ]),
    ...DappChainStore.mapActions([
      'delegateAsync',
      'undelegateAsync'
    ])
  }
})

export default class FaucetDelegateModal extends Vue {
  delegationDetail = {
    amount: '',
    from: '',
    to: ''
  }
  locktimeTierVal = 0
  validator = null
  showValidators = false
  formattedValidators = []
  unbond = false
  loading = false
  okTitle = "Delegate"

  locktimeTiers = [
    "2 weeks",
    "3 months",
    "6 months",
    "1 year"
  ]

  bonusTiers = [
    "x1",
    "x1.5",
    "x2",
    "x4"
  ]

  async requestDelegate() {
    
    if(this.delegationDetail.amount <= 0) {
      this.setError("Invalid amount")
      return
    }

    this.loading = true

    try {
      if (this.unbond) {
        await this.undelegateAsync({
          candidate: this.delegationDetail.from,
          amount: this.delegationDetail.amount,
          tier: this.locktimeTierVal
        })
      } else {        
        await this.delegateAsync({
          candidate: this.delegationDetail.to,
          amount: this.delegationDetail.amount,
          tier: this.locktimeTierVal
        })
      }
    this.loading = false
    this.$emit('onDelegate')
    this.$root.$emit('bv::hide::modal', 'faucet-delegate-modal')
    } catch(err) {
      console.log(err)
      this.setError(err)
      this.loading = false
    }
  }

  show(address, type) {
    if(!address) {
      if(this.validators && this.validators.length > 0) {      
        this.formattedValidators = this.validators.map((v) => {
          return {
            text: v.Name || v.Address,
            value: v.Address
          }
        }) 
      }
      this.showValidators = true
    }
    if (type === "unbond") {
      this.unbond = true
      this.okTitle = "Un-delegate"
      this.delegationDetail = {
        amount: '',
        from: address,
        to: getAddress(this.getPrivateKey),
      }
    } else {
      this.unbond = false
      this.okTitle = "Delegate"
      this.delegationDetail = {
        amount: '',
        from: getAddress(this.getPrivateKey),
        to: address
      }
    }        
    this.$refs.modalRef.show()
  }

  formatRangeInput(value, event) {
    return value
  }

  onLocktimeChange(val) {

    switch(this.locktimeTier) {
      case 0:
        return "2 weeks"
      case 1:
        return "3 months"
      case 2:
        return "6 months"
      case 3:
        return "1 year"
      default:
        break
    }

  }

}</script>
<style lang="scss">
label {
  color: gray;
}
.loading-spinner-container {
  height: 200px;
}
</style>
