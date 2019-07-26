import { Client, CryptoUtils, Address, LoomProvider } from "loom-js"

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

import Web3 from "web3"

import fs from "fs"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"

const envs = [production] // , stage, exDev]

from(envs)
    .pipe(concatMap(generate))
    .subscribe(
        (env) => console.log("done with " + env),
        console.error,
        () => console.log("done"),
    )

// =====================

interface Mapping {
    plasma: string,
    ethereum?: string,
    binance?: string
}

interface TokenInfo {
    symbol?: string
    name?: string
    decimals?: string
    chains: Mapping
}

const chainNames = {
    binance: "binance",
    eth: "ethereum",
}

function generate(config) {
    console.log("\n=======\n " + config.name)
    const dappchainKey = CryptoUtils.generatePrivateKey()
    const { client, address } = createDefaultClient(
        CryptoUtils.Uint8ArrayToB64(dappchainKey),
        config.plasma.endpoint,
        config.plasma.chainId,
    )
    const loomProvider = new LoomProvider(client, dappchainKey)
    const web3 = new Web3(loomProvider)

    const ethereum = from(loadEthereumMappings(client, address))
        .pipe(
            mergeMap((mappings) => mappings.confirmed),
            map((mapping) => convertMapping(mapping, "eth")),
            filter((x) => x.plasma === "0xcf2851b1ad63d093238ea296524be8d7cd920e0b"),
            toArray<Mapping>(),
        )

    const binance = from(loadBinanceMappings(client, address))
        .pipe(
            mergeMap((mappings) => mappings.confirmed),
            map((mapping) => convertMapping(mapping, "binance")),
            toArray<Mapping>(),
        )

    return zip(ethereum, binance)
        .pipe(
            map(mergeMappings),
            mergeMap((mappings) => mappings),
            concatMap((mapping) => tokenInfoFromPlasma(mapping, web3, address)),
            toArray(),
            switchMap((x) => {
                console.log("saving file for env", x)
                fs.writeFileSync(__dirname + "/" + config.name + ".json", JSON.stringify(x, null, 2))
                return config.name
            }),
        ).toPromise().then((x) => {
            return x
        })
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

function mergeMappings(byChain: Mapping[][]) {
    return byChain.reduce((joined, chainMappings) => {
        if (!joined) return chainMappings
        chainMappings.forEach((mapping) => {
            const entry = joined.find((entry) => entry.plasma === mapping.plasma)
            if (entry) Object.assign(entry, mapping)
            else joined.push(mapping)
        })
        return joined
    })
}

async function tokenInfoFromPlasma(mapping: Mapping, web3: Web3, address: Address) {
    console.log("tokenInfoFromPlasma")
    const erc20 = new web3.eth.Contract(ERC20_ABI, mapping.plasma)
    const info: any = {}
    const opts = { from: address.local.toString() }
    const proms = ["symbol", "name", "decimals"].map(async (prop) => {
        try {
            info[prop] = await erc20.methods[prop]().call(opts)
            console.log("> " + prop, info[prop])
        } catch (error) {
            console.error(error)
        }
    })
    await Promise.all(proms)
    info.chains = mapping
    console.log(info)
    return info as TokenInfo
}

function convertMapping({ from, to }: IAddressMapping, chainId: string) {
    const chainName = chainNames[chainId]
    return {
        plasma: (from.chainId === chainId ? to : from).local.toString().toLocaleLowerCase(),
        [chainName]: (from.chainId === chainId ? from : to).local.toString().toLocaleLowerCase(),
    }

}
