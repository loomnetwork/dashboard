<template>
  <div id="mobile-account">
    
    <b-card title="Balance" class="mb-4" no-body>
      <b-card-header class="custom-card-header d-flex justify-content-between">
        <h4>Balance</h4>
        <a v-if="!showRefreshSpinner" @click="refresh"> <fa :icon="['fas', 'sync']" class="refresh-icon"/></a>
        <b-spinner v-else type="border" small />
      </b-card-header>  
      <b-card-body>
        <b-card v-if="currentAllowance && !gatewayBusy"
                bg-variant="warning"
                text-variant="white"
                header="Warning"
                class="text-center mb-3">
          <b-card-text>
            <p class="warning-copy mb-2">{{currentAllowance}} LOOM awaiting transfer to plasmachain account.</p>
            <b-btn size="sm" variant="primary" @click="completeDeposit">Resume Deposit</b-btn>
          </b-card-text>
        </b-card>      

        <div class="p3">
          <h6>{{ $t('views.my_account.mainnet') }}</h6>
          <h5 class="highlight">
            {{userBalance.isLoading ? 'loading' : userBalance.mainnetBalance + " LOOM"}}
            <loom-icon :color="'#f0ad4e'"/>
          </h5>
          <h6>{{ $t('views.my_account.plasmachain') }}</h6>                            
          <h5 class="highlight">
            {{userBalance.isLoading ? 'loading' : userBalance.loomBalance + " LOOM"}}
            <loom-icon :color="'#f0ad4e'"/>
          </h5>
          <!-- unclaimed -->
          <div v-if="unclaimWithdrawTokensETH > 0 && !gatewayBusy">
            <p> {{$t('views.my_account.tokens_pending_withdraw',{pendingWithdrawAmount:unclaimWithdrawTokensETH} )}} </p><br>
            <div class="center-children">                                  
              <b-btn variant="outline-primary" @click="reclaimWithdrawHandler" :disabled="isWithdrawalInprogress"> {{$t('views.my_account.complete_withdraw')}} </b-btn>
              <b-spinner v-if="isWithdrawalInprogress" variant="primary" label="Spinning" small/>
            </div>                                
          </div>
          <b-modal id="wait-tx" title="Done" hide-footer centered no-close-on-backdrop> 
            {{ $t('views.my_account.wait_tx') }}
          </b-modal> 
          <b-modal id="unclaimed-tokens" title="Unclaimed Tokens" hide-footer centered no-close-on-backdrop> 
            <p> {{$t('views.my_account.tokens_pending_deposit',{pendingDepositAmount:unclaimDepositTokens} )}} </p>
            <b-btn variant="outline-primary" @click="reclaimDepositHandler">{{$t('views.my_account.reclaim_deposit')}} </b-btn>
          </b-modal>
        </div>
      </b-card-body>
      <b-card-footer class="custom-card-footer">
        <!-- deposit withdraw -->
        <footer v-if="unclaimWithdrawTokensETH == 0 && unclaimDepositTokens == 0" class="d-flex justify-content-between">
          <b-button-group class="gateway" style="display: flex;">
          <TransferStepper v-if="userBalance.mainnetBalance > 0 && oracleEnabled"
            :balance="userBalance.mainnetBalance" 
            :transferAction="approveDeposit"
            :resolveTxSuccess="executeDeposit"
            buttonLabel="Deposit" 
            >
            <template #pendingMessage><p>Please approve deposit on your wallet...</p></template>
            <template #failueMessage><p>Approval failed.</p></template>
            <template #confirmingMessage>Please confirm deposit on your wallet. Depositing as soon as approval is confirmed: </template>
          </TransferStepper>
          <TransferStepper  v-if="userBalance.loomBalance > 0 && oracleEnabled"
            @withdrawalDone="afterWithdrawalDone"
            @withdrawalFailed="afterWithdrawalFailed"
            :balance="userBalance.loomBalance" 
            :transferAction="executeWithdrawal"
            :resolveTxSuccess="resolveWithdraw"
            buttonLabel="Withdraw" 
            executionTitle="Execute transfer">
              <template #pendingMessage><p>Transfering funds from plasma chain to your ethereum account...</p></template>
              <template #failueMessage>Withdrawal failed... retry?</template>
              <template #confirmingMessage>Waiting for ethereum confirmation</template>
          </TransferStepper>
          </b-button-group>
        </footer>
      </b-card-footer>      

    </b-card>

    <b-card title="Election Cycle" class="mb-4">
        <h6>Time left</h6>
        <h5 v-if="formattedTimeUntilElectionCycle" class="highlight">{{formattedTimeUntilElectionCycle}}</h5>
        <b-spinner v-else variant="primary" label="Spinning"/>
    </b-card>

    <b-card title="Rewards" class="mb-4">
      <h5 class="highlight">
        {{rewardsValue}}
        <loom-icon :color="'#f0ad4e'"/>
      </h5>
    </b-card>

    <b-card title="Delegations" id="delegations-container">

      <b-card v-for="(delegation, idx) in delegations" :key="'delegations' + idx" no-body class="mb-1">
        <b-card-header @click="toggleAccordion(idx)"
                       header-tag="header"
                       class="d-flex justify-content-between p-2"
                       role="tab">
          <span>{{delegation["Name"]}}</span>
          <strong>{{delegation["Amount"]}}</strong>
        </b-card-header>
        <b-collapse :id="'accordion' + idx" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <ul>
              <li v-if="delegation['Update Amount'] !== '0.00'">Update amount: {{delegation["Update Amount"]}}</li>
              <li>Height: {{delegation["Height"]}}</li>
              <li>Locktime: {{delegation["Locktime"]}}</li>
              <li>State: {{delegation["State"]}}</li>
            </ul>
          </b-card-body>
        </b-collapse>
      </b-card>
    </b-card>

    <div class="button-container">
      <b-button @click="$router.push({ path: '/validators' })">
        Stake tokens
      </b-button>
    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import LoomIcon from '@/components/LoomIcon'
import FaucetTable from '@/components/FaucetTable'
import { getBalance, getAddress } from '@/services/dposv2Utils.js'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

import Web3 from 'web3'
import BN from 'bn.js'
import debug from 'debug'
import { setTimeout } from 'timers'
import { formatToCrypto, sleep } from '../utils.js'
import TransferStepper from '../components/TransferStepper'

const log = debug('mobileaccount')
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

const ELECTION_CYCLE_MILLIS = 600000

@Component({
  components: {
    LoomIcon,
    FaucetTable,
    TransferStepper,

  },
  computed: {
    ...DappChainStore.mapState([
      'web3',
      'dposUser'
    ]),    
    ...DPOSStore.mapState([
      'userBalance',
      'gatewayBusy',
      'rewardsResults',
      'timeUntilElectionCycle',
      'nextElectionTime',
      'states',
      'currentMetamaskAddress'
    ]) 
  },
  methods: {
    ...DPOSStore.mapActions([
      'queryRewards',
      'getTimeUntilElectionsAsync'
    ]),
    ...DappChainStore.mapActions([
      'getPendingWithdrawalReceipt',
      'withdrawAsync'
    ]),
    ...DPOSStore.mapMutations([
      'setGatewayBusy',
      'setShowLoadingSpinner'      
    ])
  }
})

export default class MobileAccount extends Vue {

  delegations = []
  currentAllowance = 0

  timerRefreshInterval = null
  formattedTimeUntilElectionCycle = null
  timeLeft = 0

  // gateway related
  // unclaimed tokens
  unclaimDepositTokens = 0
  unclaimWithdrawTokens = 0
  unclaimWithdrawTokensETH = 0
  unclaimSignature = ""
  oracleEnabled = true
  receipt = null
  isWithdrawalInprogress = false
  withdrawLimit = 0

  showRefreshSpinner = false
  
  async mounted() {
    await this.updateTimeUntilElectionCycle()
    this.startTimer()
    this.delegations = await this.getDelegations()
    this.currentAllowance = await this.checkAllowance()
    await this.queryRewards()
  }

  refresh() {
    this.showRefreshSpinner = true
    this.$emit('refreshBalances')
    setTimeout(() => {
      this.showRefreshSpinner = false
    }, 2000)
  }
  
  async checkAllowance() {    
    const user = this.dposUser
    const gateway = user.ethereumGateway
    try {          
      const allowance = await user.ethereumLoom.allowance(this.currentMetamaskAddress, gateway.address)
      return parseInt(this.web3.utils.fromWei(allowance.toString()))
    } catch(err) {
      console.error("Error checking allowance", err)
      return 0
    }
  }

  async getDelegations() {

    const { amount, weightedAmount, delegationsArray } = await this.dposUser.listDelegatorDelegations()
    const candidates = await this.dposUser.listCandidatesAsync()

    return delegationsArray.filter(d => !(d.amount.isZero() && d.updateAmount.isZero()))
           .map(delegation => {
            let candidate = candidates.find(c => c.address.local.toString() === delegation.validator.local.toString())
            return { 
                    "Name": candidate.name,
                    "Amount": `${formatToCrypto(delegation.amount)}`,
                    "Update Amount": `${formatToCrypto(delegation.updateAmount)}`,
                    "Height": `${delegation.height}`,
                    "Locktime": `${new Date(delegation.lockTime * 1000)}`,
                    "State": `${this.states[delegation.state]}`,
                    _cellVariants: { Status: 'active'}
            }
    })

  }

  toggleAccordion(idx) {
    this.$root.$emit("bv::toggle::collapse", "accordion" + idx)
  }

  async completeDeposit() {
    this.setGatewayBusy(true)
    this.setShowLoadingSpinner(true)
    const tokens = new BN( "" + parseInt(this.allowance,10)) 
    const weiAmount = new BN(this.web3.utils.toWei(tokens, 'ether'), 10)
    try {
      await this.dposUser._ethereumGateway.functions.depositERC20(
        weiAmount.toString(), this.dposUser.ethereumLoom.address
      )
      this.allowance = 0
    } catch (error) {
      console.error(error)
    }
    this.$emit('refreshBalances')
    this.setGatewayBusy(false)
    this.setShowLoadingSpinner(false)
  }

  startTimer() {
    this.timerRefreshInterval = setInterval(() => this.decreaseTimer(), 1000)
  }

  get timerValue() {
    return this.timeLeft > 0 ? Math.round((this.timeLeft * 100)/ELECTION_CYCLE_MILLIS)  : 0
  }

  get rewardsValue() {
    return this.rewardsResults ? (this.rewardsResults.toString() + " LOOM") : "0.00"
  }


  async updateTimeUntilElectionCycle() {
    await this.getTimeUntilElectionsAsync()
    this.electionCycleTimer = this.timeUntilElectionCycle
  }

  async decreaseTimer() {
    if(this.electionCycleTimer) {
      let timeLeft = parseInt(this.electionCycleTimer)      
      if(timeLeft > 0) {
        timeLeft--
        this.timeLeft = timeLeft
        this.electionCycleTimer = timeLeft.toString()
        this.showTimeUntilElectionCycle()
      } else {
        await this.updateTimeUntilElectionCycle()
      }
    }
    
  }

  showTimeUntilElectionCycle() {    
    if(this.electionCycleTimer) {
      let timeLeft = this.electionCycleTimer
      let date = new Date(null)
      date.setSeconds(timeLeft)
      let result = date.toISOString().substr(11, 8)
      this.formattedTimeUntilElectionCycle = result
    } else {
      this.formattedTimeUntilElectionCycle = ""      
    }
  }  
  
  // gateway

  async reclaimDepositHandler() {
    let result = await this.reclaimDeposit()
    this.$root.$emit("bv::hide::modal", "unclaimed-tokens")
    this.$root.$emit("bv::show::modal", "wait-tx")
    await this.refresh(true)
  }


  async checkUnclaimedLoomTokens() {
    let unclaimAmount = await this.getUnclaimedLoomTokens()
    this.unclaimDepositTokens = unclaimAmount.toNumber()
    if(this.unclaimDepositTokens > 0) this.$root.$emit("bv::show::modal", "unclaimed-tokens")
  }

  async afterWithdrawalDone () {
    this.$root.$emit("bv::show::modal", "wait-tx")
    this.$emit('refreshBalances')
    await this.checkPendingWithdrawalReceipt()
    if(this.receipt){
      this.setWithdrewSignature(this.receipt.signature)
      this.unclaimSignature = this.receipt.signature
      this.unclaimWithdrawTokensETH = 0
    }
    await this.refresh(true)
  }

  async afterWithdrawalFailed () {
    await this.checkPendingWithdrawalReceipt()
    if(this.receipt) {
      this.unclaimWithdrawTokensETH = this.web3.utils.fromWei(this.receipt.amount.toString())
      this.unclaimSignature = this.receipt.signature
    }
    await this.refresh(true)
  }

  async reclaimDepositHandler() {
    let result = await this.reclaimDeposit()
    this.$root.$emit("bv::hide::modal", "unclaimed-tokens")
    this.$root.$emit("bv::show::modal", "wait-tx")
    await this.refresh(true)
  }

  async checkPendingWithdrawalReceipt() {
    this.receipt = await this.getPendingWithdrawalReceipt()
  }

  async hasReceiptHandler(receipt) {
    if(receipt.signature && (receipt.signature != this.withdrewSignature)) {
      // have pending withdrawal
      this.unclaimWithdrawTokens = receipt.amount
      this.unclaimWithdrawTokensETH = this.web3.utils.fromWei(receipt.amount.toString())
      this.unclaimSignature = receipt.signature
    } else if (receipt.amount) {
      // signature, amount didn't get update yet. need to wait for oracle update
      this.setErrorMsg('Waiting for withdrawal authorization.  Please check back later.')
    }
    let ethAddr = this.dposUser._wallet._address
    // TODO: This is to handle a specific bug, once all users are fixed, remove this. 
    if (receipt.tokenOwner != ethAddr) {
      this.mismatchedReceiptHandler(receipt, ethAddr)
    }
  }

  async mismatchedReceiptHandler(receipt, ethAddr) {
    // this is necessary to prevent reloading when metamask changes accounts
    window.resolvingMismatchedReceipt = true

    console.log('receipt: ', receipt.tokenOwner)
    console.log('mapped address:', ethAddr)

    let r = confirm(`A pending withdraw requires you to switch ETH accounts to: ${receipt.tokenOwner}. Please change your account and then click OK`)
    if (r) {
      let tempUser = await this.switchDposUser({web3: window.web3})
      this.reclaimWithdrawHandler()
    }
  }

  async reclaimWithdrawHandler() {
    // var localAddr = CryptoUtils.bytesToHexAddr(this.dposUser._address.local.bytes)
    // let mappedAddr = await this.dposUser._wallet._address
    // let ethAddr = CryptoUtils.bytesToHexAddr(mappedAddr.to.local.bytes)
    let ethAddr = this.dposUser._wallet._address
    console.log('current eth addr: ', ethAddr)
    try {
      this.isWithdrawalInprogress = true
      let tx = await this.withdrawCoinGatewayAsync({amount: this.unclaimWithdrawTokens, signature: this.unclaimSignature})      
      await tx.wait()
      this.$root.$emit("bv::show::modal", "wait-tx")
      this.isWithdrawalInprogress = false
      await this.checkPendingWithdrawalReceipt()
      if(this.receipt){
        this.setWithdrewSignature(this.receipt.signature)
        this.unclaimSignature = this.receipt.signature
      }
      this.unclaimWithdrawTokensETH = 0
      await this.refresh(true) 

      // TODO: this is added for fixing mismatched receipts, remove once users are fixed. 
      if (window.resolvingMismatchedReceipt) {
        alert('Pending withdraw is fixed. Please log in again to switch back to the correct account.')
        window.location.reload(true)
      }
    } catch (err) {
      this.setErrorMsg(err.message)
      console.error(err)
      this.isWithdrawalInprogress = false
    }
  }
  async depositHandler() {

    if(this.transferAmount <= 0) {
      this.setError("Invalid amount")
      return
    }

    this.setShowLoadingSpinner(true)
    
    try {
      await this.depositAsync({amount: this.transferAmount})
      this.setSuccess("Deposit successfull")
    } catch(err) {
      console.error("Deposit failed, error: ", err)
      this.setError({msg: "Deposit failed, please try again", err})
    }
    this.transferAmount = ""

    this.setShowLoadingSpinner(false)
    
  }

  async checkAllowance() {    
    console.assert(this.dposUser, "Expected dposUser to be initialized")
    console.assert(this.web3, "Expected web3 to be initialized")   
    const user = this.dposUser
    const gateway = user.ethereumGateway
    try {          
      const allowance = await user.ethereumLoom.allowance(this.currentMetamaskAddress, gateway.address)
      return parseInt(this.web3.utils.fromWei(allowance.toString()))
    } catch(err) {
      console.error("Error checking allowance", err)
      return ''
    }
  }

  async approveAmount(amount) {
    if(!this.dposUser) return
    const user = this.dposUser
    const gateway = user.ethereumGateway
    try {
      let tx = await user.ethereumLoom.approve(gateway.address, amount)
      await tx.wait()
      this.currentAllowance = await this.checkAllowance()
      this.setSuccess("Amount approved")
    } catch(err) {
      console.error("Error approving amount", err)
      return
    }    
  }

   async approveDeposit(amount) {
    console.assert(this.dposUser, "Expected dposUser to be initialized")
    console.assert(this.web3, "Expected web3 to be initialized")
    const { web3, dposUser} = this
    const ethereumLoom  = dposUser.ethereumLoom
    const ethereumGateway  = dposUser._ethereumGateway
    const tokens = new BN( "" + parseInt(amount,10)) 
    const weiAmount = new BN(this.web3.utils.toWei(tokens, 'ether'), 10)
    log('approve', ethereumGateway.address, weiAmount.toString(), weiAmount)
    this.setGatewayBusy(true)
    log('approve', ethereumGateway.address, weiAmount.toString())
    const approval = await ethereumLoom.functions.approve(
            ethereumGateway.address,
            weiAmount.toString())
    await approval.wait()
    //const receipt = await approval.wait()
    log('approvalTX', approval)
    // we still need to execute deposit so keep gatewayBusy = true
    return approval
  }

  async executeDeposit(amount,approvalTx) {
    console.assert(this.dposUser, "Expected dposUser to be initialized")
    console.assert(this.web3, "Expected web3 to be initialized")
    this.setGatewayBusy(true)
    // await approvalTx.wait()
    const tokens = new BN( "" + parseInt(amount,10)) 
    const weiAmount = new BN(this.web3.utils.toWei(tokens, 'ether'), 10)
    let result = await this.dposUser._ethereumGateway.functions.depositERC20(
      weiAmount.toString(), this.dposUser.ethereumLoom.address
    )
    this.setGatewayBusy(false)
    this.$emit('refreshBalances')
    return result
  }

  async completeDeposit() {
    this.setGatewayBusy(true)
    this.setShowLoadingSpinner(true)
    const tokens = new BN( "" + parseInt(this.allowance,10)) 
    const weiAmount = new BN(this.web3.utils.toWei(tokens, 'ether'), 10)
    try {
      await this.dposUser._ethereumGateway.functions.depositERC20(
        weiAmount.toString(), this.dposUser.ethereumLoom.address
      )
      this.allowance = 0
    } catch (error) {
      console.error(error)
    }
    this.$emit('refreshBalances')
    this.setGatewayBusy(false)
    this.setShowLoadingSpinner(false)

  }

  async executeWithdrawal(amount) {
    // return new Promise((resolve,reject) => setTimeout(() => resolve({hash:'0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae'}),5000))
    // note:  withdrawAsync returns Promise<TransactionReceipt> 
    try {
      await this.checkPendingWithdrawalReceipt()
      if (this.receipt) {
        // have a pending receipt
        this.hasReceiptHandler(this.receipt)
        return
      } else {
        let tx = await this.withdrawAsync({amount})
        //await tx.wait()
        return tx
      }
    } catch (e) {
      console.error(e)
    }
  }

  resolveWithdraw(amount, tx) {
    return tx.wait()
  }

  destroyed() {
    this.deleteIntervals()
  }

  deleteIntervals() {
    if(this.timerRefreshInterval) clearInterval(this.timerRefreshInterval)    
  }

}

</script>

<style lang="scss">

#mobile-account {
  padding-top: 1.5rem;
  padding-bottom: 5.5rem;
}

h3 {
  color: #02020202;
}

.warning-copy {
  color: #ffffff;
}

.button-container {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  padding: 12px;
  left: 0px;
  box-shadow: rgba(219, 219, 219, 0.56) 0px -3px 8px 0px;
  button {
    margin: 0 auto;
    display: block;
    background-color: #4e4fd2;    
  }
}

.custom-card-header {
  padding-bottom: 0px;
  border: none;
}

.custom-card-header, .custom-card-footer {
  background-color: #ffffff;
}

.gateway {
  width: 100%
}
.gateway.btn-group > div {
  flex: 1;
  .btn {
    display:block;
    width:100%;
  }
}
.gateway.btn-group div:not(:last-child) .btn {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}
.gateway.btn-group div:last-child .btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    margin-left: -1px; 
}

</style>

<style lang="scss">
  #delegations-container {
    .card-header {
      background-color: #fff;
    }
  }

  div > .card {
    border: none;
    box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0px;
  }

</style>
