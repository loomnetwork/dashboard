import { PlasmaState, CardDetail, PackDetail } from "./types"
import { Contract } from "web3-eth-contract"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { UserDeployerState } from "loom-js/dist/proto/user_deployer_whitelist_pb"
import BN from "bn.js"

export function setBalance(
    state: PlasmaState,
    payload: {
        symbol: string,
        balance: BN,
    },
) {
    state.coins[payload.symbol].balance = payload.balance
    state.coins[payload.symbol].loading = false
}
