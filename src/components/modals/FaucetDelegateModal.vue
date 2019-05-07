<template>
  <b-modal id="faucet-delegate-modal" ref="modalRef" ok-only hide-header>
    <b-container fluid>
      <div v-if="loading" class="loading-spinner-container">
        <loading-spinner :showBackdrop="true"></loading-spinner>
      </div>
      <div v-else>
        <b-row class="my-1 mb-3">
          <b-col sm="3"><label>{{ $t('components.modals.faucet_delegate_modal.amount') }}</label></b-col>
          <b-col sm="9"><b-form-input v-model="delegationDetail.amount" :state="delegationDetail && delegationDetail.amount && delegationDetail.amount > minAmount && delegationDetail.amount <= userBalance.loomBalance" type="number" :min="minAmount" :max="userBalance.loomBalance"></b-form-input></b-col>
        </b-row>
        <b-row class="my-1" v-if="!unbond" key="range">
          <b-col sm="6"><label id="lockTimeReward" for="locktime">{{ $t('components.modals.faucet_delegate_modal.locktime_bonuses') }}</label></b-col>
          <b-col sm="6"><span>{{locktimeTiers[locktimeTierVal]}} / {{bonusTiers[locktimeTierVal]}}</span></b-col>
          <b-col><b-form-input v-model="locktimeTierVal" :min="minLockTimeTier" max="3" :formatter="formatRangeInput" id="locktime" type="range" data-toggle="tooltip"></b-form-input></b-col>
          <b-tooltip target="lockTimeReward" placement="bottom" title="In order to qualify for the associated the reward multiplier, keep your tokens staked until the locktime has expired"></b-tooltip>
        </b-row>
      </div>
    </b-container>
    <div slot="modal-footer" class="w-100">
      <b-button v-if="!loading" style="width: 160px; float: right;" variant="primary" :disabled="!isAmountValid" @click="requestDelegate">{{okTitle}}</b-button>
    </div>
  </b-modal>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import LoadingSpinner from '../../components/LoadingSpinner'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  props: {
    locktimeTier: Number,
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
    ...DappChainStore.mapState([
      'validators',
    ]),
    ...DPOSStore.mapState([
      'userBalance'
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

  minAmount = 0
  minLockTimeTier = 0

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
          tier: this.locktimeTierVal,
          index: this.delegation.index
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
      this.setError({msg: "Delegation failed", err})
      this.loading = false
    }
  }

  get isAmountValid() {
    return this.delegationDetail && new Number(this.delegationDetail.amount) > 0
  }

  // xxx
  show(address, type ='', minAmount = 0, minLockTimeTier = 0, delegation = null) {
    this.minAmount = minAmount
    this.minLockTimeTier = minLockTimeTier
    this.locktimeTierVal = minLockTimeTier
    this.delegation = delegation
    if(!address) {
      if(this.validators && this.validators.length > 0) {
        this.formattedValidators = this.validators.map((v) => {
          return {
            text: v.name || v.name,
            value: v.address
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
        from: address
      }
    } else {
      this.unbond = false
      this.okTitle = "Delegate"
      this.delegationDetail = {
        amount: '',
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

}
</script>
<style lang="scss">
label {
  color: gray;
}
.loading-spinner-container {
  height: 200px;
}
</style>
