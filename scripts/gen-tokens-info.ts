import { Client, CryptoUtils, Address } from "loom-js"

import production from "../src/config/production"
import stage from "../src/config/stage"
import dev from "../src/config/dev"

import { createDefaultClient } from "loom-js/dist/helpers"
import { TransferGateway, BinanceTransferGateway } from "loom-js/dist/contracts"
// @ts-ignore
import ERC20_ABI from "./ERC20_frag.json"
import { ethers } from "ethers"

import { from, zip } from "rxjs"
import { concatMap, map, toArray, switchMap, mergeMap, tap, filter } from "rxjs/operators"

import fs from "fs"

const envs = [production] // , stage, exDev]

interface Mapping {
    plasma: string,
    ethereum?: string,
    binance?: string
}

from(envs)
    .pipe(concatMap(generate))
    .subscribe(
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
            map(({ from, to }) => ({
                plasma: (from.chainId === "eth" ? to : from).local.toString().toLocaleLowerCase(),
                ethereum: (from.chainId === "eth" ? from : to).local.toString().toLocaleLowerCase(),
            })),
            filter((x) => x.plasma === "0xcf2851b1ad63d093238ea296524be8d7cd920e0b"),
            toArray<Mapping>(),
        )

    const binance = from(loadBinanceMappings(client, address))
        .pipe(
            mergeMap((mappings) => mappings.confirmed),
            map(({ from, to }) => ({
                plasma: (from.chainId === "binance" ? to : from).local.toString().toLocaleLowerCase(),
                binance: (from.chainId === "binance" ? from : to).local.toString().toLocaleLowerCase(),
            })),
            toArray<Mapping>(),
        )

    return zip(ethereum, binance)
        .pipe(
            tap(() => client.disconnect()),
            map(mergeMappings),
            mergeMap((mappings) => mappings),
            mergeMap((mapping) => ethereumTokenInfo(mapping, provider), 2),
            toArray(),
            switchMap((x) => {
                console.log("saving file for env", x)
                fs.writeFileSync(__dirname + "/" + config.name + ".json", JSON.stringify(x, null, 2))
                return config.name
            }),
        ).toPromise()
    // mergeMap((mapping) => ethereumTokenInfo(mapping, provider), 2),
}

async function loadEthereumMappings(client: Client, address: Address) {
    const gateway = await TransferGateway.createAsync(client, address)
    const mappings = await gateway.listContractMappingsAsync()
    return mappings
}

async function loadBinanceMappings(client: Client, address: Address) {
    const gateway = await BinanceTransferGateway.createAsync(client, address)
    const mappings = await gateway.listContractMappingsAsync()
    console.log("BINANCE MAPPING", mappings.confirmed)
    return mappings
}

async function ethereumTokenInfo(mapping: Mapping, provider: ethers.providers.Provider,
) {
    const chains = mapping
    console.log("token info", chains)
    const info: any = {}

    if (!chains.ethereum) {
        return { chains }
    }

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

function mergeMappings(byChain: Mapping[][]) {
    return byChain.reduce((joined, chainMappings) => {
        if (!joined) return chainMappings
        chainMappings.forEach((mapping) => {
            const entry = joined.find((entry) => entry.plasma === mapping.plasma)
            if (entry) {
                Object.assign(entry, mapping)
            } else {
                joined.push(mapping)
            }
        })
        return joined
    })
}
