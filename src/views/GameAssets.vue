<template>
  <main class="container">
    <header>
      <h1>{{ $t('components.faucet_sidebar.game_assets') }}</h1>
      <b-button class="help" variant="outline-info" pill size="sm" @click="showHelp =!showHelp">?</b-button>
    </header>
    <b-alert :show="showHelp" fade>
      {{ $t('views.help.check_your_asset') }}
      <hr>
      <span><b>{{ $t('components.gameAsset.cards.transfer') }}</b> : {{ $t('views.help.transfer_asset_to_other') }} </span>
    </b-alert>
    <Account/>
    <section>
      <Packs/>
      <Cards/>
    </section>
  </main>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import Cards from "@/components/game-asset/Cards.vue"
import Packs from "@/components/game-asset/Packs.vue"
import Account from "@/components/Account.vue"

@Component({
  components: {
    Cards,
    Packs,
    Account,
  },
})

export default class GameAssets extends Vue {

  showHelp = false
}
</script>

<style lang="scss" scoped>
.container {
  margin: 16px auto;
  padding: 0;

  > header {
    display: flex;
    align-items: center;
    h1 {
      flex: 1;
    }
  }
  > section {
    > div {
      margin: 0 0 20px;
    }
  }

  @media only screen and (min-width: 800px) {
    margin: 15px auto;
  }

  /* large screens ----------- */
  @media only screen and (min-width: 1200px) {
    > section {
      display: flex;
      flex-direction: row;
      > div {
        margin: 20px;
        flex: 1;
      }
    }
  }
}
</style>

