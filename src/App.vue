<template>
  <div id="app">
    <layout></layout>
  </div>
</template>

<script>
import Layout from "@/components/Layout"

export default {
  name: "App",
  components: {
    Layout,
  },
  watch: {
    "$store.state.plasma.address"(address) {
      const target = this.$route.query.redirect
      const hasRoute = this.$router.options.routes.some((r) => r.path === target)
      if (address !== "") {
        if (hasRoute && !["/login", "/"].includes(target)) {
          this.$router.push(target)
        } else {
          this.$router.push("/account")
        }
      } else {
        this.$router.router.push("/")
      }
    },
  },
}
</script>

<style lang="scss">
button {
  text-transform: capitalize !important;
}
@media (max-width: 767px) {
  body {
    background: #9e9e9e12;
  }
  .modal-dialog {
    max-width: 100vw;
    margin: 0;
    > .modal-content {
      border-radius: 0;
      border: 0;
      max-width: 100vw;
      height: 100vh;
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

.card {
  border: none;
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0px;
}

.faq img {
  border: 1px solid;
  box-shadow: 0 0 5px #ccc;
  max-width: 100% !important;
}
</style>
