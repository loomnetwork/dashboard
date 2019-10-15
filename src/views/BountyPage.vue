<template>
  <main>
    <b-card class="total-bounties"> 
      {{ totalBounties }} Bounties
    </b-card>
    <b-card class="monthly-bounty">
      <b-row>
        <b-col>
          <b-card-title><fa icon="heart" id="heart"/> Monthly Validator Bounty</b-card-title>
        </b-col>
        <b-col class="bounty-reward">
          {{ loomAmount("2000000") | tokenAmount(18,0)}} LOOM
        </b-col>
      </b-row>
      <b-card-body>
        <span v-html="$t('views.bounty.description')"/>
      </b-card-body>
    </b-card>
    <div v-for="(bounty, topic) in bountyList" :key="topic" class="topic-section">
      <h2 class="bounty-topic mb-4">{{ topic }}</h2>
      <b-card class="mb-4" v-for="(bountyData, index) in bounty" :key="index">
        <b-row>
          <b-col sm="9">
            <b-card-title>{{ bountyData.title }}</b-card-title>
            <p>{{ bountyData.description }}</p>
          </b-col>
          <b-col sm="3" class="bounty-reward">
            {{ loomAmount(bountyData.reward) | tokenAmount(18,0)}} {{ bountyData.token }}
          </b-col>
        </b-row>
      </b-card>
    </div>
    <b-card bg-variant="dark" text-variant="white" class="contact">
      We're fleshing out the exact details now, if you have a submission please email 
      <a href="mailto:satoshi@loomx.io" target="_blank" class="hover-warning" style="color: #6ec0ff;"><fa :icon="['fas', 'envelope']" fixed-width /> satoshi@loomx.io </a>
    </b-card>
  </main>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import BountyList from "@/data/bountyList.json"
import { formatTokenAmount } from "@/filters"
import { parseToWei } from "@/utils"

@Component
export default class BountyPage extends Vue {

  bountyList = BountyList
  // totalBounties = Object.keys(this.bountyList)

  get totalBounties() {
    const totalTopic = Object.keys(this.bountyList)
    let totalBounties = 0
    totalTopic.forEach((item, index) => {
      totalBounties += Object.values(this.bountyList)[index].length
    })
    return totalBounties
  }

  loomAmount(amount) {
    return parseToWei(amount, 18)
  }
  
}
</script>

<style lang="scss">
  .total-bounties {
    margin: 16px 0;
    background-color: #eaeaea;
  }

  .monthly-bounty {
    background-color: #d8f7ff;
  }

  .topic-section {
    margin: 2rem 0;
  }

  .bounty-topic {
    text-transform: capitalize;
  }

  .bounty-reward {
    text-align: right;
    font-weight: 600;
  }

  #heart {
    color: tomato;
  }

</style>
