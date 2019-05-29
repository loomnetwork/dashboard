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
          <div v-if="userBalance.mainnetBalance">
            <h5 class="highlight">
              {{userBalance.mainnetBalance + " LOOM"}}
              <loom-icon v-if="!userBalance.isLoading" :color="'#f0ad4e'" width="20px" height="20px" />
            </h5>
          </div>
          <div v-else>
            <b-spinner variant="primary" label="Spinning" /> 
          </div>
          <h6>{{ $t('views.my_account.plasmachain') }}</h6>                            
          <div v-if="userBalance.loomBalance">
            <h5 class="highlight">
              {{userBalance.loomBalance + " LOOM"}}
              <loom-icon v-if="!userBalance.isLoading" :color="'#f0ad4e'" width="20px" height="20px"/>
            </h5>
          </div>
          <div v-else>
            <b-spinner variant="primary" label="Spinning" />
          </div>
          <!-- unclaimed -->
          <div v-if="unclaimWithdrawTokensETH > 0 && !gatewayBusy">
            <p> {{$t('views.my_account.tokens_pending_withdraw',{pendingWithdrawAmount:unclaimWithdrawTokensETH} )}} </p><br>
            <div class="center-children" id="complete-withdrawal-container">                                  
              <b-btn variant="outline-primary" class="mr-2" @click="reclaimWithdrawHandler" :disabled="isWithdrawalInprogress"> {{$t('views.my_account.complete_withdraw')}} </b-btn>
              <b-spinner v-if="isWithdrawalInprogress" variant="primary" label="Spinning" small/>
              <b-tooltip v-if="isWithdrawalInprogress" target="complete-withdrawal-container" placement="left" title="Your transaction is processing, check back in a few mintues."></b-tooltip>
            </div>                                
          </div>
          <b-modal id="wait-tx" title="Done" hide-footer centered no-close-on-backdrop> 
            {{ $t('views.my_account.wait_tx') }}
          </b-modal> 
          <b-modal id="unclaimed-tokens" title="Unclaimed Tokens" hide-footer centered no-close-on-backdrop> 
            <p> {{$t('views.my_account.tokens_pending_deposit',{pendingDepositAmount:unclaimedTokens} )}} </p>
            <b-btn variant="outline-primary" @click="reclaimDepositHandler">{{$t('views.my_account.reclaim_deposit')}} </b-btn>
          </b-modal>
        </div>
      </b-card-body>
      <b-card-footer class="custom-card-footer">
        <DepositForm />
        <a v-if="pendingTx" style="display: flex;align-items: center;" :href="`https://etherscan.io/tx/${pendingTx.hash}`" target="_blank">
          <b-spinner variant="primary" style="margin-right:16px;"></b-spinner> <span>pending: {{pendingTx.type}}</span>
        </a>
        <!-- deposit withdraw -->
        <footer v-if="unclaimWithdrawTokensETH == 0 && unclaimedTokens.isZero() && !pendingTx" class="d-flex justify-content-between">
          <b-button-group class="gateway" style="display: flex;">
             <b-btn variant="outline-primary" @click="setShowDepositForm(true)">{{ $t("components.faucet_header.deposit")}}</b-btn>
          <TransferStepper  v-if="userBalance.loomBalance > 0 && oracleEnabled"
            @withdrawalDone="afterWithdrawalDone"
            @withdrawalFailed="afterWithdrawalFailed"
            :balance="userBalance.loomBalance" 
            :transferAction="executeWithdrawal"
            :resolveTxSuccess="resolveWithdraw"
            :enableCooldown="!enoughTimeHasPassed"
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
        <div v-if="electionIsRunning">
          <strong>
            <h5 class="highlight rmv-spacing animated flash slow infinite">Election is underway</h5>
            <small>Please be patient</small>
          </strong>
        </div>
        <div v-else>
          <h5 v-if="formattedTimeUntilElectionCycle" class="highlight">{{formattedTimeUntilElectionCycle}}</h5>
          <b-spinner v-else variant="primary" label="Spinning"/>
        </div>
    </b-card>

    <!-- <b-card title="Rewards" class="mb-4">
      <router-link tag="h5" to="/rewards" class="highlight" >
        {{rewardsValue}}
        <loom-icon v-if="rewardsValue" :color="'#f0ad4e'" width="20px" height="20px"/>
      </router-link>
    </b-card> -->
    <rewards></rewards>

    <b-card title="Delegations" id="delegations-container">

      <b-card v-for="(delegation, idx) in formatedDelegations" :key="'delegations' + idx" no-body class="mb-1">
        <b-card-header @click="toggleAccordion(idx)"
                       header-tag="header"
                       class="d-flex justify-content-between p-2"
                       role="tab">
          <div>
            <b-spinner v-if="delegation['State'] !== 'Bonded'" small variant="primary"  style="margin-right:16px;"></b-spinner>
            <span>{{delegation["Name"]}}</span>
          </div>
          <strong>{{delegation["Amount"]}}</strong>
        </b-card-header>
        <b-collapse :id="'accordion' + idx" accordion="my-accordion" role="tabpanel">
          <b-card-body @click="gotoValidator(delegation.Name)">
            <ul>
              <li v-if="delegation['Update Amount'] !== '0.00'">Update amount: {{delegation["Update Amount"]}}</li>
              <li v-if="!delegation.unlocked">Unlock time: {{delegation["Locktime"]}}</li>
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
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

import Web3 from 'web3'
import BN from 'bn.js'
import debug from 'debug'
import { setTimeout } from 'timers'
import { formatToCrypto, sleep } from '../utils.js'
import TransferStepper from '../components/TransferStepper'
import DepositForm from '@/components/gateway/DepositForm'
import Rewards from '@/components/Rewards'

const log = debug('mobileaccount')

const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

const ELECTION_CYCLE_MILLIS = 600000

@Component({
  components: {
    LoomIcon,
    FaucetTable,
    TransferStepper,
    DepositForm,
    Rewards
  },
  computed: {
    ...DappChainStore.mapState([
      'web3',
      'dposUser',
      'validators',
      'withdrewOn'
    ]),    
    ...DPOSStore.mapState([
      'userBalance',
      'gatewayBusy',
      'rewardsResults',
      'timeUntilElectionCycle',
      'nextElectionTime',
      'delegations',
      'states',
      'currentMetamaskAddress',
      'pendingTx',
      'electionIsRunning',
    ]) 
  },
  methods: {
    ...DappChainStore.mapActions([
      'getPendingWithdrawalReceipt',
      'getUnclaimedLoomTokens',
      'reclaimDeposit',
      'withdrawAsync',
      'withdrawCoinGatewayAsync',
      'switchDposUser',
      'getMetamaskLoomBalance',
      'getDappchainLoomBalance',
    ]),
    ...DappChainStore.mapMutations([
      'setWithdrewOn',
      'setWithdrewSignature',
    ]),
    ...mapMutations([
      'setErrorMsg'
    ]),
    ...DPOSStore.mapMutations([
      'setGatewayBusy',
      'setShowLoadingSpinner',
      'setShowDepositForm',
    ])
  }
})

export default class MobileAccount extends Vue {

  currentAllowance = 0

  timerRefreshInterval = null
  formattedTimeUntilElectionCycle = null
  timeLeft = 0

  // gateway related
  // unclaimed tokens
  unclaimedTokens = new BN(0)
  unclaimWithdrawTokensETH = 0
  unclaimSignature = ""
  oracleEnabled = true
  receipt = null
  isWithdrawalInprogress = false
  withdrawLimit = 0

  showRefreshSpinner = false

  cooldownInterval = null 
  whenCooldown = null

  mounted() {
    // Page might be mounted while dposUser is still initializing
    if (this.dposUser) {
      this.dposUserReady()
    } 
    else {
      // Assuming page is mounted only if initDposUser has been triggered...
      let unwatch = this.$store.watch(
        (s) => s.DappChain.dposUser,
        () => {
          unwatch()
          this.dposUserReady()
        }
      )
    }

    this.whenCooldown = this.getTimeWhenCooldownExpires()

    if(!this.enoughTimeHasPassed) {
      this.beginPolling()
    }

    this.$root.$on('withdrawalDone', () => {
      this.beginPolling()
    })

    this.$root.$on('withdrawalExecuted', () => {
      this.setWithdrewOn(Date.now())
    })

  }

  destroyed() {
    if(this.cooldownInterval) clearInterval(this.cooldownInterval)
  }

  beginPolling() {
    this.cooldownInterval = setInterval(async () => {
      this.whenCooldown = this.getTimeWhenCooldownExpires()
      if(this.enoughTimeHasPassed) clearInterval(this.cooldownInterval)
    }, 30 * 1000) // 30 seconds    
  }
  
  async dposUserReady() {
    await this.checkPendingWithdrawalReceipt()
    //await this.checkUnclaimedLoomTokens()
    this.currentAllowance = await this.checkAllowance()
    this.updateTimeUntilElectionCycle()
    this.startTimer()

    // Only alert te user if the receipt is older than 5 minutes
    if (this.receipt && this.enoughTimeHasPassed) {
      this.hasReceiptHandler(this.receipt)
    }
  }

  /**
   * receipt is fresh if last withdrawal was less than 5 minutes ago
   *@param receipt
   */
  get enoughTimeHasPassed() {
    // Five minutes ago > Withdrawal timestamp
    return this.whenCooldown > this.withdrewOn
  }


  getTimeWhenCooldownExpires() {
    return (Date.now()- 5*60*1000)
  }

  refresh() {
    this.showRefreshSpinner = true
    Promise.all([
        this.getMetamaskLoomBalance(),
        this.getDappchainLoomBalance()
    ])
    .finally(() => this.showRefreshSpinner = false)
  }

  get formatedDelegations() {
    const candidates = this.validators
    console.log(this.delegations)
    return this.delegations
    .filter(d => d.index > 0)
    .map((delegation) => {
      let candidate = candidates.find(c => c.address === delegation.validator.local.toString())
      return { 
              Name: candidate.name,
              Amount: formatToCrypto(delegation.amount),
              "Update Amount": formatToCrypto(delegation.updateAmount),
              Locktime: new Date(delegation.lockTime * 1000),
              unlocked: delegation.lockTime * 1000 < Date.now(),
              State: this.states[delegation.state],
              _cellVariants: { Status: 'active'}
      }
    })
  }

  toggleAccordion(idx) {
    this.$root.$emit("bv::toggle::collapse", "accordion" + idx)
  }

  async completeDeposit() {
    const dposUser = await this.dposUser
    this.setGatewayBusy(true)
    this.setShowLoadingSpinner(true)
    const tokens = new BN( "" + parseInt(this.currentAllowance,10)) 
    const weiAmount = new BN(this.web3.utils.toWei(tokens, 'ether'), 10)
    try {
      await dposUser.ethereumGateway.functions.depositERC20(
        weiAmount.toString(), dposUser.ethereumLoom.address
      )
      this.currentAllowance = 0
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
    const millis = this.nextElectionTime - Date.now()
    this.electionCycleTimer =  Math.ceil(millis/1000)
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
        this.electionCycleTimer
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

  async checkUnclaimedLoomTokens() {
    const unclaimedAmount = await this.getUnclaimedLoomTokens()
    // console.log("unclaimedAmount",unclaimedAmount)
    this.unclaimedTokens = unclaimedAmount
    if(!this.unclaimedTokens.isZero() && this.enoughTimeHasPassed) {
      this.$root.$emit("bv::show::modal", "unclaimed-tokens")
    }
  }

  async checkPendingWithdrawalReceipt() {
    this.receipt = await this.getPendingWithdrawalReceipt()
  }
  
  async checkAllowance() {    
    const user = await this.dposUser
    const gateway = user.ethereumGateway
    try {          
      const allowance = await user.ethereumLoom.allowance(this.currentMetamaskAddress, gateway.address)
      return parseInt(this.web3.utils.fromWei(allowance.toString()))
    } catch(err) {
      console.error("Error checking allowance", err)
      return 0
    }
  }

  async afterWithdrawalDone () {
    this.$root.$emit("bv::show::modal", "wait-tx")
    this.$emit('refreshBalances')
    this.setWithdrewOn(Date.now())
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


  async hasReceiptHandler(receipt) {

    const dposUser = await this.dposUser
    // When a withdrawal is ongoing
    if(this.withdrewOn && !this.enoughTimeHasPassed) {
      return
    }

    // If there was a withdrawal that was iterrupted
    if(receipt.signature && (receipt.signature != this.withdrewSignature)) {

      // have pending withdrawal
      this.unclaimWithdrawTokens = receipt.amount
      this.unclaimWithdrawTokensETH = this.web3.utils.fromWei(receipt.amount.toString())
      this.unclaimSignature = receipt.signature
      
    } else if (receipt.amount) {
      // signature, amount didn't get update yet. need to wait for oracle update
      this.setErrorMsg('Waiting for withdrawal authorization.  Please check back later.')
    }

    let ethAddr = dposUser.ethAddress
    
    // TODO: This is to handle a specific bug, once all users are fixed, remove this. 
    if (receipt.tokenOwner.toLowerCase() != ethAddr.toLowerCase()) {
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
    const dposUser = await this.dposUser
    let ethAddr = this.dposUser.ethAddr
    console.log('current eth addr: ', ethAddr)
    this.setShowLoadingSpinner(true)
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
      this.setWithdrewOn(Date.now())
      this.setShowLoadingSpinner(false)
    } catch (err) {
      this.setErrorMsg({msg: "Failed resuming withdraw", forever: false,report:true,cause:err})
      console.error(err)
      this.isWithdrawalInprogress = false
      this.setShowLoadingSpinner(false)
    }
  }

  async checkAllowance() {    
    console.assert(this.dposUser, "Expected dposUser to be initialized")
    console.assert(this.web3, "Expected web3 to be initialized")   
    const user = await this.dposUser
    const gateway = user.ethereumGateway
    try {          
      const allowance = await user.ethereumLoom.allowance(this.currentMetamaskAddress, gateway.address)
      return parseInt(this.web3.utils.fromWei(allowance.toString()))
    } catch(err) {
      console.error("Error checking allowance", err)
      return ''
    }
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
      // imtoken hack
      if (e.transactionHash) {
        return {
          hash: e.transactionHash
        }
      }
      console.error(e)
    }
  }

  async resolveWithdraw(amount, tx) {
    // imtoken hack
    if (tx.wait) {
      let result = await tx.wait()
      return result
    }
    return tx
  }

  gotoValidator(name) {
    this.$router.push("validator/"+name)
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
  display: flex;
  align-items: center;
  justify-content: center;  
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  padding: 12px;
  left: 0px;
  box-shadow: rgba(219, 219, 219, 0.56) 0px -3px 8px 0px;
  button {
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
