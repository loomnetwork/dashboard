import BN from "bn.js"

import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import { Client, Address, ITxMiddlewareHandler, LoomProvider } from "loom-js"
import { Coin, EthCoin } from "loom-js/dist/contracts"
import Contract from "web3/eth/contract"
import Web3 from "web3"
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
export interface HasPlasmaState {
  plasma: PlasmaState
}

export interface PlasmaState {
  client: Client
  provider: LoomProvider | null
  // for normal contracts
  web3: Web3 | null
  address: string
  signer: PlasmaSigner | null

  appKey: {
    private: string;
    public: string;
    address: string;
  }

  erc20Addresses: {
    [erc20Symbol: string]: string;
  }

  coins: {
    loom: TokenInfo<Coin>;
    eth: TokenInfo<EthCoin>;
    [tokenSymbol: string]: TokenInfo<Coin | EthCoin | ERC20>;
  }

  packsContract: {
    [name: string]: Contract;
  }
  cardContract: MigratedZBGCard | null
  cardBalance: CardDetail[]
  packBalance: PackDetail[]
  cardToTransferSelected: CardDetail | null
  allCardsToTransferSelected: {
    edition: string;
    cards: CardDetail[];
    amount: number;
  }

  packToTransferSelected: null| {
     type: string;
    amount: number;
  }
}

export interface TokenInfo<C> {
  contract: C | null
  balance: BN
  loading: boolean
}

export interface TransferRequest {
  symbol: string
  tokenAmount: BN
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
