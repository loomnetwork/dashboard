<template>
  <div>
    <b-form-input
      v-bind:value="internal"
      :placeholder="placeholder"
      v-on:input="onInput"
      :state="this.value.length === 0 ? null : isValidAddress"
      class="my-2"
    ></b-form-input>
    <p v-if="!isValidAddress" style :key="value" class="error">Invalid {{ chain }} address.</p>
  </div>
</template>

<script lang="ts">
import { Watch, Vue, Prop, Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { PlasmaState } from "../store/plasma/types"

@Component
export default class InputAddress extends Vue {

  @Prop(String) value!: string
  @Prop(String) placeholder!: string
  @Prop({ default: "loom" }) chain!: string
  @Prop({ type: Array, default() { return [] } }) blacklist!: string[]

  patterns = {
    loom: /^loom[a-fA-F0-9]{40}$/,
    bnb: /^0x[a-fA-F0-9]{40}$/,
    any: /^(0x|loom)[a-fA-F0-9]{40}$/,
  }

  internal: string = ""

  isValidAddress: boolean = true

  onInput(value) {
    if (value !== "") {
      this.validateAddressFormat(value)
      this.internal = value
      if (this.isValidAddress) {
        this.$emit("input", value)
      } else {
        this.$emit("input", "")
      }
    } else {
      this.isValidAddress = true
    }
  }

  @Watch("value")
  onValueChanged(newVal, oldVal) {
    this.internal = newVal
  }

  validateAddressFormat(value) {
    const chain = this.chain.toLowerCase()
    let valid = false
    if (chain in this.patterns) {
      valid = this.patterns[chain].test("" + value)
    }
    valid = valid && (false === this.blacklist.includes(value.toLowerCase()))
    this.emitValidAddress(valid)
  }

  emitValidAddress(isValid: boolean) {
    this.isValidAddress = isValid
    this.$emit("isValid", isValid)
  }

}
</script>

<style scoped>
p {
  color: red;
}

::placeholder {
  color: lightgrey;
}
</style>
