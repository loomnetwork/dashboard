<template>
  <div class="faucet-with-navbar faq">
    <div class="faucet-content">
      <b-card class="mt-5 p-3">
        <details v-for="entry in questions" class="card mb-4 border-primary">
          <b-card-header class="pointer" header-bg-variant="primary" header-tag="summary">
            <h3>{{ $t('views.faq.Q_'+ entry) }}</h3>
          </b-card-header>
          <b-card-body>
            <b-card-text v-html="$options.filters.marked($t('views.faq.A_'+ entry)) "></b-card-text>
          </b-card-body>
        </details>
      </b-card>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"

@Component
export default class Help extends Vue {
  questions = [
    "What_is_Basechain",
    "What_is_token_staking",
    "Why_is_staking_important_for_Basechain",
    "How_can_I_stake_my_LOOM_tokens_on_Basechain",
    "What_are_validators",
    "What_is_the_validator_fee_for",
    "What_currency_are_rewards_paid_in",
    "How_do_I_claim_my_rewards",
    "How_much_can_I_be_rewarded",
    "How_many_tokens_are_required_to_become_a_delegator",
    "What_is_the_election_cycle",
    "Which_validator(s)_should_I_delegate_to",
    "Do_I_lose_control_of_my_tokens_when_I_delegate_them_to_a_validator",
    "Can_I_delegate_to_multiple_validators",
    "Can_I_delegate_multiple_times_to_the_same_validator",
    "Can_I_change_validators",
    "When_will_I_receive_rewards_on_my_delegations",
    "Are_my_rewards_automatically_redelegated",
    "What_happens_once_a_lock-up_period_expires",
    "How_can_I_undelegate_my_tokens",
    "Once_I_undelegate,_how_long_will_it_take_to_regain_full_access_to_my_tokens",
    "What_is_the_“Redelegate”_option",
    "What_is_the_“Consolidate”_option",
    "Is_it_possible_to_lose_any_of_my_delegated_tokens",
    "Where_do_the_tokens_go_when_they_are_slashed",
  ]
}
</script>

<style lang="scss" scoped>
.page-header {
  margin-top: 24px;
  margin-bottom: 32px;
}



.img-container img {
  display: block;
  margin: 0 auto;
  width: 80%;
  height: auto;
}

h3 {
  color: white;
  font-size: 1.2em;
  display: inline;
}

.pointer {
  cursor: pointer;
}

.border-primary {
  border: 1px solid #007bff
}



</style>

