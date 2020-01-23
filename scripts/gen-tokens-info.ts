import { Client, CryptoUtils, Address, LoomProvider } from "loom-js"

import production from "../src/config/production"
import dev from "../src/config/dev"
import extDev from "../src/config/ext-dev"

import { DashboardConfig } from "../src/types"

import { createDefaultClient } from "loom-js/dist/helpers"
import { TransferGateway, BinanceTransferGateway } from "loom-js/dist/contracts"
// @ts-ignore
import ERC20_ABI from "./ERC20_frag.json"
import { ethers } from "ethers"

import { from, zip } from "rxjs"
import { concatMap, map, toArray, switchMap, mergeMap } from "rxjs/operators"

import Web3 from "web3"

import fs from "fs"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"

const ERC20GatewayABI_v1 = require("loom-js/dist/mainnet-contracts/ERC20Gateway.json")

const envName = process.argv[2]

const envs = envName === undefined ?
    [production, dev, extDev] :
    [production, dev, extDev].filter((env) => env.name === envName)

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
    decimals?: number
    chains: Mapping
}

const chainNames = {
    binance: "binance",
    eth: "ethereum",
}
// todo add an exclude list
function generate(config: DashboardConfig) {
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
            switchMap(async (list) => {
                const loomMapping = await loadEthereumLoomMapping(client, config)
                list.unshift(
                    {
                        symbol: "LOOM",
                        name: "Loom",
                        decimals: 18,
                        ...loomMapping,
                        binance: "",
                    },
                    {
                        symbol: "ETH",
                        name: "Ether",
                        decimals: 18,
                        ethereum: "0x".padEnd(42, "0"),
                        // Not used but should set to the real one
                        plasma: "0x".padEnd(42, "0"),
                        binance: "",
                    },
                )
                console.log("saving file for env", list.length, config.name)
                fs.writeFileSync(__dirname + "/" + config.name + ".json", JSON.stringify(list, null, 2))
                return config.name
            }),
        ).toPromise().then((x) => {
            client.disconnect()
            return x
        })
    // mergeMap((mapping) => ethereumTokenInfo(mapping, provider), 2),
}

async function loadEthereumLoomMapping(client: Client, config: DashboardConfig) {
    const ethereumLoomTGAddr = config.ethereum.contracts.loomGateway
    const net = config.name === "production" ? "homestead" : "rinkeby"
    const gateway = new ethers.Contract(ethereumLoomTGAddr, ERC20GatewayABI_v1, ethers.getDefaultProvider(net))
    const ethereum = await gateway.functions.loomAddress()
    const plasma = await client.getContractAddressAsync("coin")
    console.log("LOOM ethereum", ethereum)
    return {
        ethereum,
        plasma: plasma!.local.toString().toLowerCase(),
    } as Mapping
}

async function loadEthereumMappings(client: Client, address: Address) {
    console.time("Ethereum mappings")
    const gateway = await TransferGateway.createAsync(client, address)
    const mappings = await gateway.listContractMappingsAsync()
    console.timeEnd("Ethereum mappings")
    console.log(mappings.confirmed.length)
    return mappings
}

async function loadBinanceMappings(client: Client, address: Address) {
    console.time("Binance mappings")
    const gateway = await BinanceTransferGateway.createAsync(client, address)
    const mappings = await gateway.listContractMappingsAsync()
    console.timeEnd("Binance mappings")
    console.log(mappings.confirmed.length)
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
            if (prop === "decimals") info[prop] = Number(info[prop])
            console.log("> " + prop, info[prop])
        } catch (error) {
            console.error(error)
        }
    })
    await Promise.all(proms)
    console.log({ ...info, ...mapping })
    return { ...info, ...mapping }
}

function convertMapping({ from, to }: IAddressMapping, chainId: string) {
    const chainName = chainNames[chainId]
    return {
        plasma: (from.chainId === chainId ? to : from).local.toString().toLowerCase(),
        [chainName]: (from.chainId === chainId ? from : to).local.toString().toLowerCase(),
    }

}
