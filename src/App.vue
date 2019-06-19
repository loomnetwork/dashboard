<template>
  <div id="app">
    <layout></layout>
  </div>
</template>

<script>
import Vue from "vue"
import Layout from "@/components/Layout"

export default {
  name: "App",
  components: {
    Layout,
  },
  watch: {
    "$store.state.plasma.address"(address) {
      if (address !== "") {
        this.$router.push("/account")
      } else {
        this.$router.router.push("/")
      }
    },
  },
}
</script>

<style lang="scss">
@media (max-width: 767px) {
  body {
    background: #9e9e9e12;
  }
  .modal-dialog {
    max-width: 100vw;
    margin: 0;

    > .modal-content {
      max-width: 100vw;
    }
  }
}

button.help {
  width: 32px;
  height: 32px;
}

main.container {
  > header {
    display: flex;
    align-items: center;
    h1 {
      flex: 1;
      color: #5246d5;
      font-size: 1.35em;
      text-align: center;
      margin: 16px -14px;
      font-weight: normal;
      border-bottom: 1px solid #ededed;
      padding-bottom: 16px;
    }
  }
  h4.card-title {
    font-size: 1.2rem;
  }
}
</style>
