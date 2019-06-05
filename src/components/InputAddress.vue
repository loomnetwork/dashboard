<template>
  <div>
    <b-form-input 
    v-bind:value="value"
    :placeholder="placeholder"
    v-on:input="updateAddress"
    v-on:keyup="validateAddressFormat"
    class="my-2" ></b-form-input>
    <p v-show="!isValidAddress" style="">Invalid address format!</p>
  </div>
</template>

<script>
export default {
  props: ['value', 'placeholder'],
  data() {
    return {
      isValidAddress: true
    }
  },
  methods: {
    updateAddress(value) {
      this.$emit('input', value)
    },
    validateAddressFormat() {
      // Address (value) must be 44 characters and have a 'loom' as prefix
      if (this.value.length !== 44 || this.value.slice(0, 4) !== "loom") {
        this.isValidAddress = false
        this.$emit('isValid', false)
      } else {
        this.isValidAddress = true
        this.$emit('isValid', true)
      }
    }
  }
}
</script>

<style scoped>
  p {
    color: red
  }
</style>
