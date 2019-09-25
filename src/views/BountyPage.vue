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
        <span>Get the most engagement in <strong>staking tutorials</strong>, wheter that is likes, retweets, claps or upvotes</span>
        <hr>
        <span>Last month's winner: Plasma-1 Bootstrap</span>
      </b-card-body>
    </b-card>
    <div class="videos-section">
      <h2 class="mb-3">Videos</h2>
      <b-card class="mb-3" v-for="(bounty, index) in bountyVideos" :key="index">
        <b-row>
          <b-col sm>
            <b-card-title>{{ bounty.title }}</b-card-title>
            <p>{{ bounty.description }}</p>
          </b-col>
          <b-col sm class="bounty-reward">
            {{ loomAmount(bounty.reward) | tokenAmount(18,0)}} {{ bounty.token }}
          </b-col>
        </b-row>
      </b-card>
    </div>
    <div class="articles-section">
      <h2 class="mb-3">Articles</h2>
      <b-card class="mb-3" v-for="(bounty, index) in bountyArticles" :key="index">
        <b-row>
          <b-col sm>
            <b-card-title>{{ bounty.title }}</b-card-title>
            <p>{{ bounty.description }}</p>
          </b-col>
          <b-col sm class="bounty-reward">
            {{ loomAmount(bounty.reward) | tokenAmount(18,0)}} {{ bounty.token }}
          </b-col>
        </b-row>
      </b-card>
    </div>
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

  bountyVideos = BountyList.videos
  bountyArticles = BountyList.articles
  totalBounties = this.bountyVideos.length + this.bountyArticles.length

  viewVideo() {
    console.log(this.bountyVideos)
  }

  viewArticle() {
    console.log(this.bountyArticles)
  }

  viewTotal() {
    console.log(this.totalBounties)
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

  .videos-section {
    margin: 2rem 0;
  }

  .articles-section {
    margin: 2rem 0;
  }

  .bounty-reward {
    text-align: right;
    font-weight: 600;
  }

  #heart {
    color: tomato;
  }

</style>