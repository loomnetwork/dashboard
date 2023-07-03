import BN from "bn.js"

import { Client, LoomProvider } from "loom-js"
import Web3 from "web3"
import { BareActionContext } from "vuex-typex"
import { ethers } from "ethers"

export interface PlasmaConfig {
  networkId: string
  chainId: string
  endpoint: string
  blockExplorer: string
  loomGamesEndpoint: string
  historyUrl: string
}

export interface HasPlasmaState {
  env: string
  plasma: PlasmaState
}

export interface PlasmaState extends PlasmaConfig {
  client: Client | null
  provider: LoomProvider | null
  // for normal contracts
  web3: Web3 | null
  ethersProvider: ethers.providers.Provider | null
  address: string
  signer: PlasmaSigner | null
  history: any[]
  appId: {
    private: string,
    public: string,
    address: string,
  }

  coins: {
    LOOM: BalanceInfo,
    [tokenSymbol: string]: BalanceInfo,
  }
  selectedToken: string

}

export enum PlasmaTokenKind {
  ETH = "ETH",
  ERC20 = "erc20",
  ERC721 = "erc721",
  ERC721X = "erc721x",
  LOOMCOIN = "LOOM",
}

export interface BalanceInfo {
  decimals: number
  balance: BN
  loading: boolean
}

export interface TransferRequest {
  symbol: string
  weiAmount: BN
  to: string
  fee?: {
    token: string
    amount: BN,
  }
}

export interface PackDetail {
  type: string
  amount: number
}

export interface PlasmaSigner {
  // chain id to be used with this signer (ex. eth for ethSigner, default for plasama pk)
  readonly chain: string
  getAddress(): Promise<string>
  signAsync(message: string): Promise<string>
  configureClient(client: Client)
}

export interface CardDetail {
  id: string
  amount: number
  display_name: string
  image: string
  title: string
  variant: string
  variation: string
  mould_type: string
  element: string
  originalID: string
}

export enum TierID {
  DEFAULT = 0,
}

// helper/shorthand for plasma module action context
export declare type PlasmaContext = BareActionContext<
  PlasmaState,
  HasPlasmaState
>
