// init asset state from index.ts
import "mocha"
import { CardDetail, PackDetail } from "../../types"
import { Contract } from "web3-eth-contract"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import BoosterPackJSON from "@/contracts/BoosterPack.json"
import MigratedZBGCardJSON from "@/contracts/MigratedZBGCard.json"
import packAddresses from "@/data/ZBGPackAddresses.json"
import { AssetsState } from "../types"
import { PACKS_NAME } from "@/store/plasma/assets/reactions"
import * as mutations from "../mutations"
import { expect } from "chai"

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

describe("Game Assets, Mutations", () => {
  let gameAssetState: AssetsState
  let packType: string[]
  let contract: Contract
  const envName = ["local", "asia1", "plasma"]
  const exCard: CardDetail = {
    id: "1",
    amount: 1,
    display_name: "Example",
    image: "Example",
    title: "Example",
    variant: "Example edition",
    variation: "Example",
    mould_type: "Example",
    element: "Air",
    originalID: "Example",
  }
  const exPack: PackDetail = {
    type: "Booster",
    amount: 1,
  }

  before(() => {
    packType = PACKS_NAME
    gameAssetState = initialState()
  })

  it("setPackContract by a random pack type and environment", () => {
    const randomPack = packType[Math.floor(Math.random() * packType.length)].toString()
    const randomEnv = envName[Math.floor(Math.random() * envName.length)]
    // Pack contract
    contract = {
      jsonInterface: BoosterPackJSON.abi,
      address: packAddresses[randomEnv][randomPack],
    }
    mutations.setPacksContract(gameAssetState, { name: randomPack, contract })
    expect(gameAssetState.packsContract).to.eql({ [randomPack]: contract })
  })

  it("setCardContract by random environment", () => {
    const randomEnv = envName[Math.floor(Math.random() * (envName.length - 1)) + 1]
    // Card contract
    contract = {
      jsonInterface: MigratedZBGCardJSON.abi,
      address: MigratedZBGCardJSON.networks[randomEnv].address,
    }
    mutations.setCardContract(gameAssetState, contract as MigratedZBGCard)
    expect(gameAssetState.cardContract).to.eql(contract)
  })

  it("setCardBalance", () => {
    const exCardDetail: CardDetail[] = []
    exCardDetail.push(exCard)
    mutations.setCardBalance(gameAssetState, exCardDetail)
    expect(gameAssetState.cardBalance).to.eql(exCardDetail)
  })

  it("setPackBalance", () => {
    const exPackDetail: PackDetail[] = []
    exPackDetail.push(exPack)
    mutations.setPackBalance(gameAssetState, exPackDetail)
    expect(gameAssetState.packBalance).to.eql(exPackDetail)
  })

  it("setCardToTransferSelected", () => {
    mutations.setCardToTransferSelected(gameAssetState, exCard)
    expect(gameAssetState.cardToTransferSelected).to.eql(exCard)
  })

  it("setPackToTransferSelected", () => {
    mutations.setPackToTransferSelected(gameAssetState, exPack)
    expect(gameAssetState.packToTransferSelected).to.eql(exPack)
  })

  it("setAllCardsToTransferSelected", () => {
    const exCardDetail: CardDetail[] = [exCard]
    const allCard = {
      edition: "Standard Edition",
      cards: exCardDetail,
      amount: 1,
    }
    mutations.setAllCardsToTransferSelected(gameAssetState, allCard)
    expect(gameAssetState.allCardsToTransferSelected).to.eql(allCard)
  })
})
