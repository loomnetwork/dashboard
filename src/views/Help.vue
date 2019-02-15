<template>
  <div class="faucet-with-navbar">
    <div class="faucet-content">

      <b-card class="mt-5 p-3">
        
        <div class="mb-4">
          <h3>
            What is PlasmaChain? 
          </h3>
          <p>
            PlasmaChain is our Plasma Cash-backed hub for transacting between sidechains and Ethereum mainnet. It allows for highly-scalable, user-facing DApps and secure asset transfers between chains. 
          </p>
        </div>

        <div class="mb-4">
          <h3>
            What is staking? 
          </h3>
          <p>
            When a user “stakes” tokens, it means they time-lock their tokens to gain rights, perform services, and access rewards on the network.
            As a LOOM holder, you can <a class="text-primary" href="https://medium.com/loom-network/how-you-can-become-a-plasmachain-delegator-and-help-put-the-d-in-dpos-75177a4bac99?__s=XXXXXXXX">help secure PlasmaChain</a> by staking your tokens with a validator.
          </p>
        </div>

        <div class="mb-4">
          <h3>
            Why is staking important for PlasmaChain?
          </h3>
          <p>
            As PlasmaChain runs a Delegated Proof of Stake (DPoS) consensus model, staking is critical to securing the network. Through “delegation”, users support validators by proxying their tokens with those valdiators’ staking pools. The validator candidates with the largest pools become the official validators of the network. By staking your LOOM tokens, you can help choose the best validators to ensure the strongest possible security and performance for PlasmaChain (and you can earn rewards by doing so — see below). The more people who delegate and actively contribute, the more secure the chain.
          </p>
        </div>


        <div class="mb-4">
          <h3>
            How can I stake my LOOM tokens on PlasmaChain?  
          </h3>
          <p>

            You can stake your tokens from the  PlasmaChain Dashboard:

            <ul>
              <li>Create an account</li>
              <li>Generate a private key</li>
              <li>Log in to your MetaMask wallet</li>
              <li>Deposit LOOM tokens onto PlasmaChain</li>
              <li>Choose validators to stake with</li>
            </ul>
          </p>
        </div>

        <div class="mb-4">
          <h3>
            How many tokens are required to become a delegator?
          </h3>
          <p>
            There is no minimum required amount of tokens to be a delegator.
            Any LOOM token holder can delegate to any validator candidate on the network.
          </p>
        </div>

        <div class="mb-4">
          <h3>
            Which validator(s) should I delegate to? 
          </h3>
          <p>
            You can use the <router-link to="/validators" class="router text-primary">PlasmaChain Dashboard</router-link> for a full list of available validator candidates. Keep in mind that validators perform the critical services that maintain the integrity of the system — proposing new blocks, verifying transactions, and participating in governance. In researching the validators that best suit you, you will likely want to evaluate around criteria such as performance (uptime, slashes), reputation, fee % on rewards, community, etc.
          </p>
        </div>

        <div class="mb-4">
          <h3>
            Do I lose control of my tokens when I delegate them to a validator?
          </h3>
          <p>
            No. Upon delegation, your tokens will be sent to a smart contract and essentially frozen on the network for the duration of your lock-up period (which is up to you to select). When the lock-up ends, your tokens are automatically released back to you along with any additional rewards that your validator may have shared with their staking pool. 
          </p>
          <div class="mt-3 p-4">
            <i>
              Note: a validator never has direct control of your delegated stake. They cannot move your tokens under any circumstances. For all intents and purposes, you remain the owner while your stake is temporarily assigned to the network.
            </i>
          </div>            
        </div>

        <div class="mb-4">
          <h3>
            Can I delegate to multiple validator candidates? 
          </h3>
          <p>
            Yes. Users can choose to stake their tokens across several validators simultaneously.
          </p>
        </div>

        <div class="mb-4">
          <h3>
            Will I earn rewards on the tokens I delegate to a validator?
          </h3>
          <p>
            Validators earn rewards on any tokens that are delegated to their staking pool. They can choose to share a portion of those rewards back to their delegators —  but this is entirely up to the validator. The percentage each validator shares will be published on the <router-link to="/validators" class="router text-primary">PlasmaChain Dashboard</router-link> to ensure full transparency, so that users can make informed decisions prior to staking. For additional info on rewards, see <a class="text-primary" href="https://medium.com/loom-network/plasmachain-validator-staking-economics-part-1-e816d5825849">this post on validator and staking economics</a>.
          </p>
        </div>

        <div class="mb-4">
          <h3>
            What currency will rewards be paid in? 
          </h3>
          <p>
            The delegation rewards will be automatically distributed by the network, and be available under the “Rewards” tab on the <router-link to="/validators" class="router text-primary">PlasmaChain Dashboard</router-link>.
          </p>
        </div>

        <div class="mb-4">
          <h3>
            When will I receive rewards on my delegations?
          </h3>
          <p>
            Currently, validator rewards are calculated and paid out at the end of election cycles, which run every 2 weeks.
          </p>

          <div class="mt-3 p-4">
            <i>
              Note: this is an area of active research and we are planning to shift toward more frequent payout cycles as the network matures.
            </i>
          </div>   

        </div>

        <div class="mb-4">
          <h3>
            How long will my stake be locked for?  
          </h3>
          <p>
            You can choose from any of the pre-defined lock-up periods — 2 weeks, 3 months, 6 months, or 1 year. <br><br>
            For the validators that choose to share rewards on their staking pool, delegators will receive bonus incentives for various lock-up periods. Longer lock-ups are rewarded with higher percentages, as detailed below:
          </p>
          <div class="img-container">
            <img src="../assets/faq-screencap-1.png" alt="These bonus levels are before deduction of any validator fees.">
            <small>Note: these bonus levels are before deduction of any validator fees. </small>
          </div>
        </div>

        <div class="mb-4">
          <h3>
            What currency will rewards be paid in? 
          </h3>
          <p>
            The delegation rewards will be automatically distributed by the network, and be available under the “Rewards” tab on the <router-link to="/validators" class="router text-primary">PlasmaChain Dashboard</router-link>.
          </p>
        </div>


      </b-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/_mixin.scss';
@import '~@/assets/scss/_variables.scss';

.page-header {
  margin-top: 24px;
  margin-bottom: 32px;
}

.img-container {
  text-align: center;
}

.img-container img {
  display: block;
  margin: 0 auto;
}

h3 {
  color: gray
}

</style>

