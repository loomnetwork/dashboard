<template>
  <div class="faucet-with-navbar">
    <div class="faucet-content">
      <b-card class="mt-5 p-3">
        <p>
          {{ $t('views.staking_guide.intro') }}
        </p>
        <h2>{{ $t('views.staking_guide.staking_basics') }}</h2>
        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-1 header-bg-variant="primary">
            <h3>{{ $t('views.staking_guide.select_wallet') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-1">
            <b-card-body>
              <b-card-text>
                <p>
                  {{ $t('views.staking_guide.loom_plasma_support') }}
                </p>
                <span>
                  {{ $t('views.staking_guide.desktop_wallets') }}
                </span>
                <ul>
                  <li>
                    {{ $t('views.staking_guide.metamask') }}
                  </li>
                  <li>
                    {{ $t('views.staking_guide.ledger_nano') }}
                  </li>
                  <li>
                    {{ $t('views.staking_guide.trezor') }}
                  </li>                                    
                </ul>
                <span>
                  {{ $t('views.staking_guide.mobile_wallets') }}
                </span>
                <ul>
                  <li>
                    {{ $t('views.staking_guide.cobo_wallet') }}
                  </li>
                  <li>
                    {{ $t('views.staking_guide.im_token') }}
                  </li>
                  <li>
                    {{ $t('views.staking_guide.trust_wallet') }}
                  </li>                                    
                </ul>
                <strong>
                  {{ $t('views.staking_guide.fund_wallet') }}
                </strong>
                <p>
                  {{ $t('views.staking_guide.on_desktop') }}
                </p>
                <div class="img-container">
                  <img src="../assets/staking-guide-1.png" alt="Select wallet">
                </div>
                <p>
                  {{ $t('views.staking_guide.select_your_wallet') }}
                </p>
                <div class="img-container">
                  <img src="../assets/staking-guide-2.png" alt="New account">
                </div>
                <p>
                  {{ $t('views.staking_guide.following_page') }}
                </p>
                <div class="img-container">
                  <img src="../assets/staking-guide-3.png" alt="New account">
                </div>
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-6 header-bg-variant="primary">
            <h3>{{ $t('views.help.how_can_i_stake_my') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-6">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.you_can_stake_your_tokens') }}

                <ul>
                  <li>{{ $t('views.help.create_an_account') }}</li>
                  <li>{{ $t('views.help.generate_a_private_key') }}</li>
                  <li>{{ $t('views.help.log_in_to_your_meta_mask') }}</li>
                  <li>{{ $t('views.help.deposit_loom_tokens_onto_plasma_chain') }}</li>
                  <li>{{ $t('views.help.choose_validators_to_stake_with') }}</li>
                </ul>
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-13 header-bg-variant="primary">
            <h3>{{ $t('views.help.how_do_i_claim_my') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-13">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.the_delegation_rewards_will_be') }} <router-link to="/validators" class="router text-primary">{{ $t('views.help.plasma_chain_dashboard') }}</router-link>{{ $t('views.help.') }}

                <div class="img-container">
                  <img src="../assets/faq-screencap-3.png" alt="The rewards page">
                </div>
              </b-card-text>
            </b-card-body>
          </b-collapse>
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
  width: 80%;
  height: auto;
}

h3 {
  color: white;
}

.pointer {
  cursor: pointer;
}

.border-primary {
  border: 1px solid #007bff
}

</style>

