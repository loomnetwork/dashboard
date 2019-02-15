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
            As a LOOM holder, you can <a href="https://medium.com/loom-network/how-you-can-become-a-plasmachain-delegator-and-help-put-the-d-in-dpos-75177a4bac99?__s=XXXXXXXX">help secure PlasmaChain</a> by staking your tokens with a validator.
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

h3 {
  color: gray
}

</style>

