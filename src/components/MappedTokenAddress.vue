<template>
  <b-container class="mt-5 mb-4">
    <b-row class="mb-2">
      <b-col>
        <h5>{{ token }}</h5>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="account">
        <label>Ethereum</label>
        <address @click="copyEthereum">
          <span v-if="!ethAddress" class="highlight">-</span>
          <span v-else class="highlight">{{ ethAddress }}</span>
          <fa icon="paste"/>
        </address>
      </b-col>
      <b-col class="account">
        <label>Plasma</label>
        <address @click="copyPlasma">
          <span v-if="!plasmaAddress" class="highlight">-</span>
          <span v-else class="highlight">{{ plasmaAddress }}</span>
          <fa icon="paste"/>
        </address>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import { feedbackModule } from "../feedback/store"

@Component
export default class MappedTokenAddress extends Vue {
  @Prop(String) token!: string
  @Prop(String) ethAddress!: string
  @Prop(String) plasmaAddress!: string

  copyEthereum() {
    this.$copyText(this.ethAddress).then(() =>
      feedbackModule.showSuccess("Ethereum address copied."),
      console.error,
    )
  }

  copyPlasma() {
    this.$copyText(this.plasmaAddress).then(() =>
      feedbackModule.showSuccess("Plasma address copied."),
      console.error,
    )
  }
}
</script>

<style lang="scss" scoped>
.account {
  display: flex;
  align-items: baseline;
  flex-direction: column;
  label {
    width: 82px;
    font-size: 0.825rem;
    font-weight: bold;
    margin: 0 8px 0 0;
  }
}
address {
  flex: 1;
  display: flex;
  align-items: baseline;
  max-width: 300px;
  margin-bottom: 0;
  align-items: center;
  background: #0000000d;
  border-radius: 11px;
  padding: 2px 10px;
  box-shadow: inset 0px 1px 4px #0000001d;
  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    flex: 1;
    text-align: left;
    margin: 0 8px 0;
    font-size: 0.825rem;
    min-width: 100px;
    max-width: 300px;
  }
  > svg {
    color: gray;
  }
}
a.explorer {
  font-size: 0.825rem;
  white-space: nowrap;
  padding-left: 16px;
}

@media only screen and (min-width: 780px) {
  .account {
    flex-direction: row;
  }
  address {
    max-width: 380px;
    span {
      min-width: 100px;
      max-width: 400px;
    }
    > svg {
      color: gray;
    }
  }
  a.explorer {
    flex: 1;
  }
}
</style>
