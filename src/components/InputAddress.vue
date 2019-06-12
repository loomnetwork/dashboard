<template>
  <div>
    <b-form-input v-bind:value="value"
      :placeholder="placeholder"
      v-on:input="updateAddress"
      v-on:keyup="validateAddressFormat"
      class="my-2"
      ></b-form-input>
    <p v-show="!isValidAddress" style="" :key="value">Invalid address format!</p>
  </div>
</template>

<script lang="ts">
import { Watch, Vue, Prop, Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { PlasmaState } from "../store/plasma/types"

@Component
export default class InputAmount extends Vue {

  @Prop(String) value!: string
  @Prop(String) placeholder!: string
  @Prop({ default: "loom"}) type!: string

  isValidAddress = true

  @Watch("plasma.selectedToken")
  setDefaultInputAddress(newVal, oldVal) {
    this.value = ""
    this.isValidAddress = true
  }

  updateAddress(value) {
    this.$emit("input", value)
  }

  validateAddressFormat() {
    switch (this.type) {
      case "loom":
        // Address (value) must be 44 characters and have a 'loom' as prefix
        if (this.value.length !== 44 || this.value.slice(0, 4) !== "loom") {
          this.isValidAddress = false
          this.$emit("isValid", false)
        } else {
          this.isValidAddress = true
          this.$emit("isValid", true)
        }
        break
      case "bnb":
        break
      default:
        break
    }
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get plasma(): PlasmaState {
    return this.state.plasma
  }

}
</script>

<style scoped>
  p {
    color: red
  }
</style>
