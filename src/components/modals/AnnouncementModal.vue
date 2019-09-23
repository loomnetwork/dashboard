<template>
  <b-modal id="announcement-modal"
    v-model="visible"
    size="xl"
    scrollable
    title="What's new in Recap?"
    hide-footer
  >
    <b-card-group deck>
      <b-card title="Title" img-src="https://picsum.photos/300/300/?image=41" img-alt="Image" img-top>
        <b-card-text>
          This is a wider card with supporting text below as a natural lead-in to additional content.
          This content is a little bit longer.
        </b-card-text>
      </b-card>

      <b-card title="Title" img-src="https://picsum.photos/300/300/?image=41" img-alt="Image" img-top>
        <b-card-text>
          This card has supporting text below as a natural lead-in to additional content.
        </b-card-text>
      </b-card>

      <b-card title="Title" img-src="https://picsum.photos/300/300/?image=41" img-alt="Image" img-top>
        <b-card-text>
          This is a wider card with supporting text below as a natural lead-in to additional content.
          This card has even longer content than the first to show that equal height action.
        </b-card-text>
      </b-card>
    </b-card-group>
    <div class="m-3" style="text-align: center;">
      <b-button variant="primary" style="min-width: 40%;">Read more in our blog</b-button>
    </div>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"

@Component
export default class AnnouncementModal extends Vue {

  configLoaded: boolean = false

  get visible() {
    if (!this.configLoaded) return false

    const envConfig = this.$store.state.envs.find((envs) => envs.name === this.$store.state.env)
    const isSeen = localStorage.getItem("popup_example")

    return envConfig.announcement.popup && !isSeen
  }

  set visible(val: boolean) {
    if (val === false) {
      localStorage.setItem("popup_example", "true")
    }
  }

  @Watch("$store.state.plasma.chainId")
  setConfigLoaded() {
    this.configLoaded = true
  }
}
</script>

<style lang="scss">
#announcement-modal {
  .modal-header {
    border-bottom: none;

    .modal-title {
      margin: auto;
    }

    .close {
      margin: -1rem;
    }
  }

  .card-deck {
    padding: 0rem 1rem;

    .card {
      box-shadow: none;
    }
  }
}
</style>
