import BN from "bn.js"

import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { UserDeployerState } from "loom-js/dist/proto/user_deployer_whitelist_pb"
import { Client, Address, ITxMiddlewareHandler, LoomProvider } from "loom-js"
import { Coin, EthCoin } from "loom-js/dist/contracts"
import { Contract } from "web3-eth-contract"
import Web3 from "web3"
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { BareActionContext } from "vuex-typex"
import { Provider } from "ethers/providers"
import { DashboardState } from "@/types"
import { TokenSymbol } from '../ethereum/types';

export interface HasPlasmaState {
  plasma: PlasmaState
}

export interface PlasmaState {
  networkId: string
  chainId: "default" | "asia1"
  client: Client
  provider: LoomProvider | null
  // for normal contracts
  web3: Web3 | null
  ethersProvider: Provider | null
  address: string
  signer: PlasmaSigner | null

  appId: {
    private: string
    public: string
    address: string,
  }

  coins: {
    loom: BalanceInfo
    [tokenSymbol: string]: BalanceInfo,
  }

  userDeployerWhitelist: UserDeployerWhitelist | null
  userDeployersAddress: UserDeployerState[] | []

  // packsContract: {
  //   [name: string]: Contract,
  // }
  // cardContract: MigratedZBGCard | null
  // cardBalance: CardDetail[]
  // packBalance: PackDetail[]
  // cardToTransferSelected: CardDetail | null
  // allCardsToTransferSelected: {
  //   edition: string
  //   cards: CardDetail[]
  //   amount: number,
  // }

  // packToTransferSelected: null | {
  //   type: string
  //   amount: number,
  // }

  selectedToken: string

}

export enum PlasmaTokenKind {
  ETH = "eth",
  ERC20 = "erc20",
  ERC721 = "erc721",
  ERC721X = "erc721x",
  LOOMCOIN = "loom",
}

export interface BalanceInfo {
  decimals?: number
  balance: BN
  loading: boolean
}

export interface TransferRequest {
  symbol: string
  weiAmount: BN
  to: string
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
