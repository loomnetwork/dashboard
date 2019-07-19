import { shallowMount } from "@vue/test-utils"
import { expect } from "chai"
import AmountInput from "../../src/components/AmountInput.vue"
import BN from "bn.js"
import { i18n } from "@/i18n"
import { formatTokenAmount } from "@/filters"

const factory = (props = {}) => {
  return shallowMount(AmountInput, {
    propsData: { ...props },
    i18n,
  })
}

const MIN = new BN("1000000000000000000")
const MAX = new BN("10000000000000000000")

describe("AmountInput: Valid amount cases", () => {
  it("Should not show an error message when the amount is valid", () => {
    const wrapper = factory({ min: MIN, max: MAX })
    wrapper.setData({ amount: 5 })
    // @ts-ignore
    wrapper.vm.validateAmount()
    expect(wrapper.find(".error").exists()).to.equal(false)
  })

  it("Should not show an error message when the amount is equal to minimum", () => {
    const wrapper = factory({ min: MIN, max: MAX })
    wrapper.setData({ amount: formatTokenAmount(MIN) })
    // @ts-ignore
    wrapper.vm.validateAmount()
    expect(wrapper.find(".error").exists()).to.equal(false)
  })

  it("Should not show an error message when the amount is equal to maximum", () => {
    const wrapper = factory({ min: MIN, max: MAX })
    wrapper.setData({ amount: formatTokenAmount(MAX) })
    // @ts-ignore
    wrapper.vm.validateAmount()
    expect(wrapper.find(".error").exists()).to.equal(false)
  })

  it("Amount should equal to maximum after clicked the `All` button", () => {
    const wrapper = factory({ min: MIN, max: MAX })
    // @ts-ignore
    wrapper.vm.setAllAmount()
    // @ts-ignore
    expect(wrapper.vm.amount).to.equal(+formatTokenAmount(MAX))
  })

  it("Should not show an error message when the amount with decimals is valid", () => {
    const wrapper = factory({ min: MIN, max: MAX, round: false })
    wrapper.setData({ amount: 1.23 })
    // @ts-ignore
    wrapper.vm.validateAmount()
    expect(wrapper.find(".error").exists()).to.equal(false)
  })

  it("Amount with decimals should equal to maximum after clicked the `All` button", () => {
    const _max = new BN("10500000000000000000")
    const wrapper = factory({ min: MIN, max: _max, round: false })
    // @ts-ignore
    wrapper.vm.setAllAmount()
    // @ts-ignore
    expect(wrapper.vm.amount).to.equal(+formatTokenAmount(_max))
  })
})

describe("AmountInput: Invalid amount cases", () => {
  const wrapper = factory({ min: MIN, max: MAX })

  it("Should show an error message when the amount is zero", () => {
    wrapper.setData({ amount: 0 })
    // @ts-ignore
    wrapper.vm.validateAmount()
    expect(wrapper.find(".error").text()).to.equal("Please enter a valid amount")
  })

  it("Should show an error message when the amount is less than minimum", () => {
    wrapper.setData({ amount: -1 })
    // @ts-ignore
    wrapper.vm.validateAmount()
    expect(wrapper.find(".error").text()).to.equal(
      i18n.t("messages.amount_input_should_more", { amount: formatTokenAmount(MIN) }).toString(),
    )
  })

  it("Should show an error message when the amount is more than maximum", () => {
    wrapper.setData({ amount: 11 })
    // @ts-ignore
    wrapper.vm.validateAmount()
    expect(wrapper.find(".error").text()).to.equal(
      i18n.t("messages.amount_input_should_less", { amount: formatTokenAmount(MAX) }).toString(),
    )
  })

  it("Should show an error message when the amount has decimals", () => {
    wrapper.setData({ amount: 1.23 })
    // @ts-ignore
    wrapper.vm.validateAmount()
    expect(wrapper.find(".error").text()).to.equal("Only round amounts allowed")
  })
})
