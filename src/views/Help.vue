<template>
  <div class="faucet-with-navbar">
    <div class="faucet-content">
      <b-card class="mt-5 p-3">

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-1 header-bg-variant="primary">
            <h3>{{ $t('views.help.what_is_plasma_chain') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-1">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.plasma_chain_is_our_plasma_cash_backed') }}
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-2 header-bg-variant="primary">
            <h3>{{ $t('views.help.what_is_staking') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-2">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.when_a_user_stakes_tokens') }} <a class="text-primary" href="https://medium.com/loom-network/how-you-can-become-a-plasmachain-delegator-and-help-put-the-d-in-dpos-75177a4bac99?__s=XXXXXXXX">{{ $t('views.help.help_secure_plasma_chain') }}</a> {{ $t('views.help.by_staking_your_tokens_with') }}
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-3 header-bg-variant="primary">
            <h3>{{ $t('views.help.why_is_staking_important_for') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-3">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.as_plasma_chain_runs_a_delegated') }}
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-4 header-bg-variant="primary">
            <h3>{{ $t('views.help.how_can_i_stake_my') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-4">
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
          <b-card-header class="pointer" v-b-toggle.collaspe-5 header-bg-variant="primary">
            <h3>{{ $t('views.help.why_is_staking_important_for') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-5">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.as_plasma_chain_runs_a_delegated') }}
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
          <b-card-header class="pointer" v-b-toggle.collaspe-7 header-bg-variant="primary">
            <h3>{{ $t('views.help.how_many_tokens_are_required') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-7">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.there_is_no_minimum_required') }}
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-8 header-bg-variant="primary">
            <h3>{{ $t('views.help.which_validator_s_should_i_delegate') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-8">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.you_can_use_the') }} <router-link to="/validators" class="router text-primary">{{ $t('views.help.plasma_chain_dashboard') }}</router-link> {{ $t('views.help.for_a_full_list_of') }}
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-9 header-bg-variant="primary">
            <h3>{{ $t('views.help.do_i_lose_control_of') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-9">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.no_upon_delegation_your_tokens') }}
                <div class="mt-3 p-4">
                  <i>
                    {{ $t('views.help.note_a_validator_never_has') }}
                  </i>
                </div>
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-10 header-bg-variant="primary">
            <h3>{{ $t('views.help.can_i_delegate_to_multiple') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-10">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.yes_users_can_choose_to') }}
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-11 header-bg-variant="primary">
            <h3>{{ $t('views.help.will_i_earn_rewards_on') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-11">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.validators_earn_rewards_on_any') }} <router-link to="/validators" class="router text-primary">{{ $t('views.help.plasma_chain_dashboard') }}</router-link> {{ $t('views.help.to_ensure_full_transparency_so') }} <a class="text-primary" href="https://medium.com/loom-network/plasmachain-validator-staking-economics-part-1-e816d5825849">{{ $t('views.help.this_post_on_validator_and') }}</a>.
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-12 header-bg-variant="primary">
            <h3>{{ $t('views.help.what_currency_will_rewards_be') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-12">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.the_delegation_rewards_will_be') }} <router-link to="/validators" class="router text-primary">{{ $t('views.help.plasma_chain_dashboard') }}</router-link>.
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
                {{ $t('views.help.the_delegation_rewards_will_be') }} <router-link to="/validators" class="router text-primary">{{ $t('views.help.plasma_chain_dashboard') }}</router-link>.

                <div class="img-container mt-4">
                  <img src="../assets/faq-screencap-3.png" alt="The rewards page">
                </div>
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-14 header-bg-variant="primary">
            <h3>{{ $t('views.help.when_will_i_receive_rewards') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-14">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.currently_validator_rewards_are_calculated') }}

                <div class="mt-3 p-4">
                  <i>
                    {{ $t('views.help.note_this_is_an_area') }}
                  </i>
                </div>
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-15 header-bg-variant="primary">
            <h3>{{ $t('views.help.how_long_will_my_stake') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-15">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.you_can_choose_from_any') }} <br><br>
                {{ $t('views.help.for_the_validators_that_choose') }}
              </b-card-text>
              <div class="img-container mt-4">
                <img src="../assets/faq-screencap-1.png" alt="These bonus levels are before deduction of any validator fees.">
                <small>{{ $t('views.help.note_these_bonus_levels_are') }} </small>
              </div>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-16 header-bg-variant="primary">
            <h3>{{ $t('views.help.how_can_i_un_delegate_my') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-16">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.simply_navigate_to_my_delegations') }}
                <div class="img-container mt-4">
                  <img src="../assets/faq-screencap-2.png" alt="Click on the un-delegate button">
                </div>
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-17 header-bg-variant="primary">
            <h3>{{ $t('views.help.once_i_un_delegate_how_long') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-17">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.at_launch_delegators_funds_will') }}
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-18 header-bg-variant="primary">
            <h3>{{ $t('views.help.are_there_any_ways_to') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-18">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.yes_if_the_protocol_rules') }}
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-19 header-bg-variant="primary">
            <h3>{{ $t('views.help.where_do_the_tokens_go') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-19">
            <b-card-body>
              <b-card-text>
                {{ $t('views.help.slashed_tokens_will_be_contributed') }}
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
  
  img {
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.3);
  }
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

