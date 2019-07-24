import { Client, CryptoUtils, Address, LoomProvider } from "loom-js"

import production from "../src/config/production"
import stage from "../src/config/stage"
import dev from "../src/config/dev"

import { createDefaultClient } from "loom-js/dist/helpers"
import { TransferGateway, BinanceTransferGateway } from "loom-js/dist/contracts"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
// @ts-ignore
import ERC20_ABI from "./ERC20_frag.json"
import { ethers } from "ethers"

import { from, combineLatest } from "rxjs"
import { concatMap, map, toArray, switchMap, mergeMap, tap } from "rxjs/operators"

import fs from "fs"

const envs = [production, stage]

from(envs).pipe(
    concatMap(generate),
).subscribe(
    (env) => console.log("done with " + env),
    console.error,
    () => console.log("done"),
)

function generate(config) {
    console.log("\n=======\n " + config.name)
    console.log(config.ethereum.endpoint)
    const dappchainKey = CryptoUtils.generatePrivateKey()
    const { client, address } = createDefaultClient(
        CryptoUtils.Uint8ArrayToB64(dappchainKey),
        config.plasma.endpoint,
        config.plasma.chainId,
    )
    const provider = new ethers.providers.JsonRpcProvider(config.ethereum.endpoint)
    const ethereum = from(loadEthereumMappings(client, address))
        .pipe(
            mergeMap((mappings) => mappings.confirmed),
            mergeMap((mapping) => ethereumTokenInfo(mapping, provider), 2),
            toArray(),
            switchMap((x) => {
                console.log("saving file for env", x)
                fs.writeFileSync(__dirname + "/" + config.name, JSON.stringify(x))
                return config.name
            }),
        ).toPromise()

    const binance = from(loadBinanceMappings(client, address))
        .pipe(
            mergeMap((mappings) => mappings.confirmed),
            mergeMap((mapping) => ethereumTokenInfo(mapping, provider), 2),
            toArray(),
            switchMap((x) => {
                console.log("saving file for env", x)
                fs.writeFileSync(__dirname + "/" + config.name, JSON.stringify(x))
                return config.name
            }),
        ).toPromise()

    return combineLatest(ethereum, binance)
        .pipe(
            map(([tokens, binanceMappings]) => {
                addBinance(tokens, binanceMappings)
            }),
        )
}

async function loadEthereumMappings(client: Client, address: Address) {
    const gateway = await TransferGateway.createAsync(client, address)
    const mappings = await gateway.listContractMappingsAsync()
    return mappings
}

async function loadBinanceMappings(client: Client, address: Address) {
    const gateway = await BinanceTransferGateway.createAsync(client, address)
    const mappings = await gateway.listContractMappingsAsync()
    return mappings
}

async function ethereumTokenInfo(mapping: IAddressMapping, provider: ethers.providers.Provider,
) {
    const chains = {
        plasma: mapping.from.local.toString().toLowerCase(),
        ethereum: mapping.to.local.toString().toLowerCase(),
    }
    console.log("token info", chains)
    const info: any = {}

    const erc20 = new ethers.Contract(chains.ethereum, ERC20_ABI, provider)
    try {
        info.symbol = await erc20.functions.symbol()
        console.log("> symbol", info.symbol)
    } catch (error) {
        console.error(error.message)
    }
    try {
        info.name = await erc20.functions.name()
        console.log("> name", info.name)
    } catch (error) {
        console.error(error.message)
    }
    try {
        info.decimals = await erc20.functions.decimals()
        console.log("> decimals", info.decimals)
    } catch (error) {
        console.error(error.message)
    }
    info.chains = chains
    return info
}

function binanceTokenInfo() {

}

function addBinance(tokens: any[], bnbMappings: Array<{ plasma: string, binance: string }>) {
    // filter out binanceOnlyTokens
    const binanceOnly = bnbMappings.filter((bnbMapping) => {
        const token = tokens.find((t) => t.chains.plasma === bnbMapping.plasma)
        if (token) {
            token.chains.binance = bnbMapping.binance
            return false
        }
        return true
    })
}
