<template>
  <div class="container">
    <Account/>
    <Packs/>
    <Cards/>
  </div>
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

}
</script>

