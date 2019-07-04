import { mount } from "@vue/test-utils"
import { expect } from "chai"
import InputAddress from "../../src/components/InputAddress.vue"

const factory = (props = {}) => {
  return mount(InputAddress, {
    propsData: { ...props },
  })
}

const LOOM_CHAIN = "loom"
const BNB_CHAIN = "bnb"
const ANY_CHAIN = "any"
const LOOM_ADDRESS = "looma777afeF41c00b2570A9ac3878F5D92e838f3371"
const BNB_ADDRESS = "0xa777afeF41c00b2570A9ac3878F5D92e838f3371"

describe("InputAddress: Valid address cases", () => {
  it("Should not show an error message when loom address is valid", () => {
    const wrapper = factory({ value: "", chain: LOOM_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput(LOOM_ADDRESS)
    expect(wrapper.find(".error").exists()).to.equal(false)
  })

  it("Should not show an error message when bnb address is valid", () => {
    const wrapper = factory({ value: "", chain: BNB_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput(BNB_ADDRESS)
    expect(wrapper.find(".error").exists()).to.equal(false)
  })

  it("Should not show an error message when any address is valid", () => {
    const wrapper = factory({ value: "", chain: ANY_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput(LOOM_ADDRESS)
    expect(wrapper.find(".error").exists()).to.equal(false)
  })

  it("Should not show an error message when any address is valid", () => {
    const wrapper = factory({ value: "", chain: ANY_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput(BNB_ADDRESS)
    expect(wrapper.find(".error").exists()).to.equal(false)
  })
})

describe("InputAddress: Invalid address cases", () => {
  it("Should not show an error message when address is empty", () => {
    const wrapper = factory({ value: "" })
    expect(wrapper.find(".error").exists()).to.equal(false)
  })

  it("Should not show an error message after clear invalid address", () => {
    const wrapper = factory({ value: "" })
    // @ts-ignore
    wrapper.vm.onInput("")
    expect(wrapper.find(".error").exists()).to.equal(false)
  })

  it("Should show an error message when loom address is invalid", () => {
    const wrapper = factory({ value: "", chain: LOOM_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput("LOOMa777afeF41c00b2570A9ac3878F5D92e838f3371")
    expect(wrapper.find(".error").text()).to.equal(`Invalid ${LOOM_CHAIN} address.`)
  })

  it("Should show an error message when loom address has more than 44 char", () => {
    const wrapper = factory({ value: "", chain: LOOM_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput("looma777afeF41c00b2570A9ac3878F5D92e838f33710")
    expect(wrapper.find(".error").text()).to.equal(`Invalid ${LOOM_CHAIN} address.`)
  })

  it("Should show an error message when any address has more than 44 char", () => {
    const wrapper = factory({ value: "", chain: ANY_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput("looma777afeF41c00b2570A9ac3878F5D92e838f33710")
    expect(wrapper.find(".error").text()).to.equal(`Invalid ${ANY_CHAIN} address.`)
  })

  it("Should show an error message when loom address has less than 44 char", () => {
    const wrapper = factory({ value: "", chain: LOOM_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput("looma777afeF41c00b2570A9ac3878F5D92e838f337")
    expect(wrapper.find(".error").text()).to.equal(`Invalid ${LOOM_CHAIN} address.`)
  })

  it("Should show an error message when any address has less than 44 char", () => {
    const wrapper = factory({ value: "", chain: ANY_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput("looma777afeF41c00b2570A9ac3878F5D92e838f337")
    expect(wrapper.find(".error").text()).to.equal(`Invalid ${ANY_CHAIN} address.`)
  })

  it("Should show an error message when bnb address is invalid", () => {
    const wrapper = factory({ value: "", chain: BNB_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput("0Xa777afeF41c00b2570A9ac3878F5D92e838f3371")
    expect(wrapper.find(".error").text()).to.equal(`Invalid ${BNB_CHAIN} address.`)
  })

  it("Should show an error message when bnb address has more than 42 char", () => {
    const wrapper = factory({ value: "", chain: BNB_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput("0xa777afeF41c00b2570A9ac3878F5D92e838f33710")
    expect(wrapper.find(".error").text()).to.equal(`Invalid ${BNB_CHAIN} address.`)
  })

  it("Should show an error message when any address has more than 42 char", () => {
    const wrapper = factory({ value: "", chain: ANY_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput("0xa777afeF41c00b2570A9ac3878F5D92e838f33710")
    expect(wrapper.find(".error").text()).to.equal(`Invalid ${ANY_CHAIN} address.`)
  })

  it("Should show an error message when bnb address has less than 42 char", () => {
    const wrapper = factory({ value: "", chain: BNB_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput("0xa777afeF41c00b2570A9ac3878F5D92e838f337")
    expect(wrapper.find(".error").text()).to.equal(`Invalid ${BNB_CHAIN} address.`)
  })

  it("Should show an error message when any address has less than 44 char", () => {
    const wrapper = factory({ value: "", chain: ANY_CHAIN })
    // @ts-ignore
    wrapper.vm.onInput("0xa777afeF41c00b2570A9ac3878F5D92e838f337")
    expect(wrapper.find(".error").text()).to.equal(`Invalid ${ANY_CHAIN} address.`)
  })
})

describe("Checking default chain", () => {
  it("Default chain should be loom", () => {
    const wrapper = factory({ value: "" })
    // @ts-ignore
    expect(wrapper.vm.chain).to.equal(LOOM_CHAIN)
  })
})
