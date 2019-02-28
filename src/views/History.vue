<template>
  <div class="faucet">
    <div class="faucet-content">
      <div class="container mb-5 column py-3 p-3 d-flex" >
        <h1>{{ $t('views.history.trade_history') }}</h1>
        <faucet-table :items="history"></faucet-table>
      </div>
    </div>
  </div>
</template>


<script>
  import Vue from 'vue'
  import { Component } from 'vue-property-decorator'
  import FaucetTable from '../components/FaucetTable'
  import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

  import { formatToCrypto } from '@/utils'

  const DappChainStore = createNamespacedHelpers('DappChain')
  const DPOSStore = createNamespacedHelpers('DPOS')

  @Component({
    components: {
      FaucetTable
    },
    computed: {
     ...DappChainStore.mapState([
       "web3",
       "GatewayInstance"
     ]),
     ...DPOSStore.mapState([
       "currentMetamaskAddress"
     ])
    }
  })
  export default class History extends Vue {

    // "ERC20Received" = Deposit?
    // "TokenWithdrawn" = Withdraw?

    history = [
      {
        ID: 2349134,
        Date: "3/14/18",
        Amount: "10000 LOOM",
        To: "trdzvzr7...",
        From: "Me"
      },
      {
        ID: 2349134,
        Date: "3/14/18",
        Amount: "10000 LOOM",
        To: "trdzvzr7...",
        From: "Me"
      },
      {
        ID: 2349134,
        Date: "3/14/18",
        Amount: "10000 LOOM",
        To: "trdzvzr7...",
        From: "Me"
      }
    ]

    mounted() {
      this.queryEvents()
    }

    queryEvents() {
      if(!this.web3 ||
         !this.GatewayInstance ||
         !this.currentMetamaskAddress) return

      this.web3.eth.getBlockNumber().then((latestBlockNumber) => {
        let filter = { from: this.currentMetamaskAddress }
        return this.GatewayInstance.getPastEvents(
          "allEvents",
          {
            filter,
            fromBlock: latestBlockNumber-10000,
            toBlock: latestBlockNumber
          }
        )
      }).then((events) => {
        let results = events.filter((event) => {
          return event.returnValues.from === "0x78577310f2E6BC94989d0899ad00CC016E4D6050" 
        }).map((event) => {
          return {
            "Block #" : event.blockNumber,
            "Event"   : event.event,
            "Amount"  : formatToCrypto(event.returnValues.amount),
            "Tx Hash" : event.transactionHash
           }
        })
        this.history = results        
      }).catch((err) => {
        console.log("Error querying events", err)
      })

    }
  }
  
  </script>

<style lang="scss" scoped>
  .dropdown-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
</style>
