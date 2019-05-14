<template>
    <div class="container">
        GAME
        >>> {{cards}}.
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { plasmaModule } from "../store/plasma"
import { CardBalance } from '../store/plasma/types';

export default class GameAssets extends Vue {
  cardsBalances = plasmaModule.state.cardBalance
  cards: CardBalance[] = []

  async mounted() {
    this.cards = await this.cardsBalances
  }
}
</script>