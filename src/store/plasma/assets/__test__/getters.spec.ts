import "mocha"
import { Contract } from "web3-eth-contract"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import BoosterPackJSON from "@/contracts/BoosterPack.json"
import MigratedZBGCardJSON from "@/contracts/MigratedZBGCard.json"
import packAddresses from "@/data/ZBGPackAddresses.json"
import { AssetsState } from "../types"
import { PACKS_NAME } from "@/store/plasma/assets/reactions"
import { expect } from "chai"
import * as getters from "../getters"

const initialState = (): AssetsState => {
  return {
    packsContract: {},
    cardContract: null,
    cardBalance: [],
    packBalance: [],
    cardToTransferSelected: {
      id: "0",
      amount: 0,
      display_name: "default",
      image: "default",
      title: "default",
      variant: "default",
      variation: "default",
      mould_type: "default",
      element: "default",
      originalID: "default",
    },
    packToTransferSelected: {
      type: "Booster",
      amount: 0,
    },
    allCardsToTransferSelected: {
      edition: "none",
      cards: [],
      amount: 0,
    },
  }
}

describe("Game Assets, Getters", () => {
  let gameAssetState: AssetsState
  let packType: String[]
  let contract: Contract
  const envName = ["local", "asia1", "us1", "plasma"]

  before(() => {
    packType = PACKS_NAME
    gameAssetState = initialState()
  })

  it("getPacksInstance", () => {
    const randomPack = packType[Math.floor(Math.random() * packType.length)].toString()
    const randomEnv = envName[Math.floor(Math.random() * envName.length)]
    // Pack contract
    contract = {
      jsonInterface: BoosterPackJSON.abi,
      address: packAddresses[randomEnv][randomPack],
    }
    gameAssetState.packsContract[randomPack] = contract
    const packsInstance = getters.getPacksInstance(gameAssetState)
    expect(gameAssetState.packsContract).to.eql(packsInstance)
    // console.log(packsInstance)
  })

  it.skip("getCardInstance", () => {
    // for environment on MigratedZBGCard, there is no 'local' env
    envName.shift()
    const randomEnv = envName[Math.floor(Math.random() * envName.length)]
    // Card contract
    contract = {
      jsonInterface: MigratedZBGCardJSON.abi,
      address: MigratedZBGCardJSON.networks[randomEnv].address,
    }
    gameAssetState.cardContract = (contract as MigratedZBGCard)
    const cardInstance = getters.getCardInstance(gameAssetState)
    expect(gameAssetState.cardContract).to.eql(cardInstance)
  })
})
