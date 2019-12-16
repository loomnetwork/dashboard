<template>
  <div class="faucet-with-navbar">
    <div class="faucet-content">
      <b-card class="mt-5 p-3">
        <p>
          {{ $t('views.staking_guide.intro') }}
        </p>
        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-1 header-bg-variant="primary">
            <h3 class="header">{{ $t('views.staking_guide.staking_basics') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-1">
            <b-card-body>
              <b-card-text>
                <h3 class="header-grey">{{ $t('views.staking_guide.select_wallet') }}</h3>
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
                  <img src="../assets/staking-guide-1.png" class="img-medium-size" alt="Select wallet">
                </div>
                <p>
                  {{ $t('views.staking_guide.select_your_wallet') }}
                </p>
                <div class="img-container">
                  <img src="../assets/staking-guide-2.png" class="img-medium-size" alt="New account">
                </div>
                <p>
                  {{ $t('views.staking_guide.following_page') }}
                </p>
                <div class="img-container">
                  <img src="../assets/staking-guide-3.png" class="img-medium-size" alt="New account">
                </div>
                <hr>
                <h3 class="header-grey">{{ $t('views.staking_guide.deposit_loom') }}</h3>
                <p>{{ $t('views.staking_guide.steps') }}</p>
                <ol>
                <li>{{ $t('views.staking_guide.2_step_1') }}</li>
                <li>{{ $t('views.staking_guide.2_step_2') }}</li>
                <li>{{ $t('views.staking_guide.2_step_3') }}</li>
                <li>{{ $t('views.staking_guide.2_step_4') }}</li>
                </ol>
                <h6>
                  <u>
                    1. {{ $t('views.staking_guide.2_step_1') }}
                  </u>
                </h6>
                <p>
                  {{ $t('views.staking_guide.deposit_withdraw_page') }}
                </p>
                <p>
                  {{ $t('views.staking_guide.press_deposit') }}
                </p>
                <div class="img-container">
                  <img src="../assets/staking-guide-4.png" class="img-medium-size" alt="New account">
                </div>
                <p>
                  {{ $t('views.staking_guide.pop_up') }}
                </p>
                <div class="img-container">
                  <img src="../assets/staking-guide-5.png" class="img-medium-size" alt="New account">
                </div>
                <h6>
                  <u>
                    2. {{ $t('views.staking_guide.2_step_2') }}
                  </u>
                </h6>
                <p>
                  {{ $t('views.staking_guide.sign_approval') }}
                </p>
                <div class="img-container">
                  <img src="../assets/staking-guide-6.png" alt="New account">
                </div>
                <h6>
                  <u>
                    3. {{ $t('views.staking_guide.2_step_3') }}
                  </u>
                </h6>
                <p>
                  {{ $t('views.staking_guide.approval_request') }}
                </p>               
                <div class="img-container">
                  <img src="../assets/staking-guide-7.png" class="img-medium-size" alt="New account">
                </div>
                <p>
                  {{ $t('views.staking_guide.confirm_transaction') }}
                </p>
                <p>
                  {{ $t('views.staking_guide.yellow_warning') }}
                </p>
                <div class="img-container">
                  <img src="../assets/staking-guide-8.png" alt="New account">
                </div>
                <h6>
                  <u>
                    4. {{ $t('views.staking_guide.2_step_4') }}
                  </u>
                </h6>
                <!--
                <div class="img-container">
                  <img src="../assets/staking-guide-9.png" class="img-medium-size" alt="New account">
                </div>
                -->
                <p>
                  {{ $t('views.staking_guide.block_confirmations') }}
                </p>
                <hr>
                <h3 class="header-grey">{{ $t('views.staking_guide.delegate_loom') }}</h3>
                <p>{{ $t('views.staking_guide.steps') }}</p>
                <ol>
                <li>{{ $t('views.staking_guide.3_step_1') }}</li>
                <li>{{ $t('views.staking_guide.3_step_2') }}</li>
                <li>{{ $t('views.staking_guide.3_step_3') }}</li>
                <li>{{ $t('views.staking_guide.3_step_4') }}</li>
                </ol>
                <h6>
                  <u>
                    1. {{ $t('views.staking_guide.3_step_1') }}
                  </u>
                </h6>
                <p>
                  {{ $t('views.staking_guide.go_to_validitor') }}
                </p>
                <div class="img-container">
                  <img src="../assets/staking-guide-10.png" class="img-medium-size" alt="New account">
                </div>
                <h6>
                  <u>
                    2. {{ $t('views.staking_guide.3_step_2') }}
                  </u>
                </h6>
                <p>
                  {{ $t('views.staking_guide.specific_validator') }}
                </p>                
                <div class="img-container">
                  <img src="../assets/staking-guide-11.png" class="img-medium-size" alt="New account">
                </div>
                <h6>
                  <u>
                    3. {{ $t('views.staking_guide.3_step_3') }}
                  </u>
                </h6>
                <p>
                  {{ $t('views.staking_guide.pop_up_ask') }}
                </p>
                <i18n path="views.staking_guide.locktime_bonus">
                  <a place="link" :href="$t('views.staking_guide.locktime_bonus_link')" target="_blank">article</a>
                </i18n>
                <div class="img-container">
                  <img src="../assets/staking-guide-12.png" class="img-medium-size" alt="New account">
                </div>
                <p>
                  {{ $t('views.staking_guide.press_delegate') }}
                </p>
                <h6>
                  <u>
                    4. {{ $t('views.staking_guide.3_step_4') }}
                  </u>
                </h6>
                <p>
                  {{ $t('views.staking_guide.asked_to_sign') }}
                </p>         
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>


        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-2 header-bg-variant="primary">
            <h3 class="header">{{ $t('views.staking_guide.claiming_your_rewards') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-2">
            <b-card-body>
              <b-card-text>
                <h3 class="header-grey">{{ $t('views.staking_guide.claim_rewards') }}</h3>
                <p>{{ $t('views.staking_guide.steps') }}</p>
                <ol>
                  <li>{{ $t('views.staking_guide.4_step_1') }}</li>
                  <li>{{ $t('views.staking_guide.4_step_2') }}</li>
                </ol>
                <h6>
                  <u>
                    1. {{ $t('views.staking_guide.4_step_1') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.press_claim_button') }}</p>
                <div class="img-container">
                  <img src="../assets/faq-screencap-3.png" class="img-medium-size" alt="New account">
                </div>
                <h6>
                  <u>
                    2. {{ $t('views.staking_guide.4_step_2') }}
                  </u>
                </h6> 
                <p>{{ $t('views.staking_guide.asked_to_sign_transaction') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-14.png" alt="New account">
                </div>
                <p>{{ $t('views.staking_guide.if_rewards_claim') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-15.png" class="img-medium-size" alt="New account">
                </div>
                <hr>
                <h3 class="header-grey">{{ $t('views.staking_guide.withdraw_to_ethereum') }}</h3>
                <p>{{ $t('views.staking_guide.steps') }}</p>
                <ol>
                  <li>{{ $t('views.staking_guide.5_step_1') }}</li>
                  <li>{{ $t('views.staking_guide.5_step_2') }}</li>
                  <li>{{ $t('views.staking_guide.5_step_3') }}</li>
                  <li>{{ $t('views.staking_guide.5_step_4') }}</li>
                </ol>
                <h6>
                  <u>
                    1. {{ $t('views.staking_guide.5_step_1') }}
                  </u>
                </h6> 
                <p>{{ $t('views.staking_guide.deposit_withdraw_page') }}</p>
                <p>{{ $t('views.staking_guide.press_withdraw') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-4.png" class="img-medium-size" alt="New account">
                </div>
                <p>{{ $t('views.staking_guide.pop_up_asking') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-17.png" class="img-medium-size" alt="New account">
                </div>
                <h6>
                  <u>
                    2. {{ $t('views.staking_guide.5_step_2') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.press_next_button') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-18.png" class="img-medium-size" alt="New account">
                </div>
                <p>{{ $t('views.staking_guide.transaction_twice') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-19.png" class="img-medium-size" alt="New account">
                </div>
                <h6>
                  <u>
                    3. {{ $t('views.staking_guide.5_step_3') }}
                  </u>
                </h6> 
                <p>{{ $t('views.staking_guide.confirm_withdrawal_request') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-20.png" alt="New account">
                </div>
                <p>{{ $t('views.staking_guide.take_some_time') }}</p>
                <h6>
                  <u>
                    4. {{ $t('views.staking_guide.5_step_4') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.your_ethereum_wallet') }}</p>
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </div>

        <div class="card mb-4 border-primary">
          <b-card-header class="pointer" v-b-toggle.collaspe-3 header-bg-variant="primary">
            <h3 class="header">{{ $t('views.staking_guide.additional_actions') }}</h3>
          </b-card-header>
          <b-collapse id="collaspe-3">
            <b-card-body>
              <b-card-text>
                <h3 class="header-grey">{{ $t('views.staking_guide.redelegate_to_another_validator') }}</h3>
                <p>{{ $t('views.staking_guide.steps') }}</p>
                <ol>
                  <li>{{ $t('views.staking_guide.6_step_1') }}</li>
                  <li>{{ $t('views.staking_guide.6_step_2') }}</li>
                  <li>{{ $t('views.staking_guide.6_step_3') }}</li>
                </ol>
                <h6>
                  <u>
                    1. {{ $t('views.staking_guide.6_step_1') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.find_the_delegation') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-21.png" class="img-medium-size" alt="New account">
                </div>
                <h6>
                  <u>
                    2. {{ $t('views.staking_guide.6_step_2') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.validators_and_fees') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-22.png" class="img-medium-size" alt="New account">
                </div>
                <p>{{ $t('views.staking_guide.select_the_validator') }}</p>
                <h6>
                  <u>
                    3. {{ $t('views.staking_guide.6_step_3') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.transaction_to_confirm') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-23.png" alt="New account">
                </div>
                <p>{{ $t('views.staking_guide.delegation_is_redelegating') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-24.png" class="img-medium-size" alt="New account">
                </div>
                <p>{{ $t('views.staking_guide.redelegation_will_be_complete') }}</p>
                <hr>
                <h3 class="header-grey">{{ $t('views.staking_guide.undelegate') }}</h3>
                <p>{{ $t('views.staking_guide.once_the_time_lock') }}</p>
                <p>{{ $t('views.staking_guide.unlocked_delegation') }}</p>
                <p>{{ $t('views.staking_guide.steps') }}</p>
                <ol>
                  <li>{{ $t('views.staking_guide.7_step_1') }}</li>
                  <li>{{ $t('views.staking_guide.7_step_2') }}</li>
                  <li>{{ $t('views.staking_guide.7_step_3') }}</li>
                </ol>
                <h6>
                  <u>
                    1. {{ $t('views.staking_guide.7_step_1') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.my_account_page') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-25.png" class="img-medium-size" alt="New account">
                </div>
                <h6>
                  <u>
                    2. {{ $t('views.staking_guide.7_step_2') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.how_many_loom') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-26.png" class="img-medium-size" alt="New account">
                </div>
                <p>{{ $t('views.staking_guide.enter_amount') }}</p>
                <h6>
                  <u>
                    3. {{ $t('views.staking_guide.7_step_3') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.sign_to_confirm') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-27.png" alt="New account">
                </div>
                <p>{{ $t('views.staking_guide.undelegated_amount') }}</p>
                <hr>
                <h3 class="header-grey">{{ $t('views.staking_guide.consolidate') }}</h3>
                <p>{{ $t('views.staking_guide.unlocked_delegations') }}</p>
                <p>{{ $t('views.staking_guide.steps') }}</p>
                <ol>
                  <li>{{ $t('views.staking_guide.8_step_1') }}</li>
                  <li>{{ $t('views.staking_guide.8_step_2') }}</li>
                </ol>
                <h6>
                  <u>
                    1. {{ $t('views.staking_guide.8_step_1') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.go_to_validator_page') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-28.png" class="img-medium-size" alt="New account">
                </div>
                <h6>
                  <u>
                    2. {{ $t('views.staking_guide.8_step_2') }}
                  </u>
                </h6>
                <p>{{ $t('views.staking_guide.asked_to_sign') }}</p>
                <div class="img-container">
                  <img src="../assets/staking-guide-29.png" alt="New account">
                </div>
                <p>{{ $t('views.staking_guide.once_the_transaction') }}</p>
                <hr>
                <i18n path="views.staking_guide.any_questions">
                  <a place="link">
                    <router-link to="/faq">
                      Staking F.A.Q
                    </router-link>            
                  </a>
                </i18n>
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
  margin: 24px 0;
}

.img-container img {
  display: block;
  margin: 0 auto;
  width: 50%;
  height: auto;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.3);
}

.img-medium-size {
  width: 100% !important;  
}

@media only screen and (min-width: 780px) {
  .img-container {
    margin: 48px 0;
  }
  .img-medium-size {
    width: 80% !important;
  }
}

.img-medium-size {
  width: 100% !important;  
}

@media only screen and (min-width: 780px) {
  .img-container {
    margin: 48px 0;
  }
  .img-medium-size {
    width: 80% !important;
  }
}

.header {
  color: white;
}

.header-grey {
  color: grey !important;
}

.pointer {
  cursor: pointer;
}

.border-primary {
  border: 1px solid #007bff
}

</style>

