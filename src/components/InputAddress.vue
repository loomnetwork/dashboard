<template>
  <div>
    <b-form-input
      v-bind:value="internal"
      :placeholder="placeholder"
      v-on:input="onInput"
      :state="this.value.length === 0 ? null : isValidAddress"
      class="my-2"
    ></b-form-input>
    <p v-if="isBlacklisted" style :key="value" class="error">{{ $t('messages.input_address_cant_transfer_own') }}</p>
    <p v-else-if="!isValidAddress" style :key="value" class="error">{{ $t('messages.input_address_invalid_chain', { chain: chain }) }}</p>
  </div>
</template>

<script lang="ts">
import { Watch, Vue, Prop, Component } from "vue-property-decorator"

@Component
export default class InputAddress extends Vue {

  @Prop(String) value!: string
  @Prop(String) placeholder!: string
  @Prop({ default: "loom" }) chain!: string
  @Prop({ type: Array, default() { return [] } }) blacklist!: string[]

  patterns = {
    loom: /^loom[a-fA-F0-9]{40}$/,
    // todo disable t on prod
    binance: /^t?[\w0-9]{42}$/,
    any: /^(0x|loom)[a-fA-F0-9]{40}$/,
  }

  internal: string = ""

  isValidAddress: boolean = true
  isBlacklisted: boolean = false

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
    this.isBlacklisted = this.blacklist.includes(value.toLowerCase())
    valid = valid && (this.isBlacklisted === false)
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
