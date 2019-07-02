// init asset state from index.ts
import "mocha"
import sinon from "sinon"
import { PlasmaState, CardDetail, PackDetail } from "../../types"
import { Contract } from "web3-eth-contract"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import { BoosterPack } from "../web3-contracts/BoosterPack"
import { AssetsState } from "../types"
import { assetsModule } from "../index"

describe("Game Assets, Mutations", () => {
  let gameAssetState: AssetsState
  let contract: Contract

  before(() => {

  })

  it("setPackContract", () => {
    //   for (const pack of PACKS_NAME) {
    //     const packInstance = new web3.eth.Contract(
    //       // @ts-ignore
    //       BoosterPackJSON.abi,
    //       packAddresses[envName][pack],
    //     )
    //     assetsModule.setPacksContract({ name: pack, contract: packInstance })
    //   }
  })

  it("setCardContract", () => {
    // const envName = store.state.plasma.networkId
    //   const cardInstance = new web3.eth.Contract(
    //     // @ts-ignore
    //     MigratedZBGCardJSON.abi,
    //     MigratedZBGCardJSON.networks[envName].address,
    //   ) as MigratedZBGCard
    //   assetsModule.setCardContract(cardInstance)
  })

  it("setCardBalance", () => {
  //   const account = context.rootState.plasma.address
  // const caller = await plasmaModule.getCallerAddress()

  // const tokens = await context.state
  //   .cardContract!.methods.tokensOwned(account)
  //   // @ts-ignore
  //   .call({ from: caller.local.toString() })
  // const cards: CardDetail[] = []
  // tokens.indexes.forEach((id: string, i: number) => {
  //   const card = getCardByTokenId(id.toString())
  //   card.amount = parseInt(tokens.balances[i], 10)
  //   cards.push(card)
  // })
  // assetsModule.setCardBalance(cards)
  })

  it("setPackBalance", () => {
  // const account = context.rootState.plasma.address
  // const caller = await plasmaModule.getCallerAddress()
  // const packs: PackDetail[] = []

  // PACKS_NAME.forEach(async (type) => {
  //   const amount = await context.state.packsContract[type].methods
  //     .balanceOf(account)
  //     .call({ from: caller.local.toString() })
  //   packs.push({ type, amount })
  // })
  // assetsModule.setPackBalance(packs)
  })

  it("setCardToTransferSelected", () => {
  // init CardDetail obj. => set
  })

  it("setPackToTransferSelected", () => {
  // init obj(type, amount) => set
  })

  it("setAllCardsToTransferSelected", () => {
  // init obj(edition, CardDetail[], amount) => set
  })

})
