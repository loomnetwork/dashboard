<template>
  <div>
    <b-form-input v-bind:value="value"
      :placeholder="placeholder"
      v-on:input="updateAddress"
      v-on:keyup="validateAddressFormat"
      :state="this.value.length === 0 ? null : isValidAddress"
      class="my-2"
      ></b-form-input>
    <p v-show="!isValidAddress" style="" :key="value">Invalid {{ token }} address format!</p>
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
  @Prop({ default: "loom"}) token!: string
  isValidAddress: boolean = true

  @Watch("plasma.selectedToken")
  setDefaultInputAddress(newVal, oldVal) {
    this.value = ""
    this.isValidAddress = true
  }

  updateAddress(value) {
    this.$emit("input", value)
  }

  validateAddressFormat() {
    switch (this.token.toLowerCase()) {
      case "loom":
        // Address (value) must be 44 characters and have a "loom" as prefix
        if (this.value.length !== 44 || this.value.slice(0, 4) !== "loom" && this.value !== "") {
          this.emitValidAddress(false)
        } else {
          this.emitValidAddress(true)
        }
        break
      case "bnb":
        const regex = /^0x[a-fA-F0-9]{40}$/g
        const isValid = regex.test(this.value)
        this.emitValidAddress(isValid)
        break
      default:
        break
    }
  }

  emitValidAddress(isValid: boolean) {
    this.isValidAddress = isValid
    this.$emit("isValid", isValid)
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
