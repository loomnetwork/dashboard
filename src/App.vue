<template>
  <div id="app">
    <layout></layout>
  </div>
</template>

<script>
import Vue from 'vue'
import Layout from '@/components/Layout'

export default {
  name: 'App',
  components: {
    Layout,
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
</style>
