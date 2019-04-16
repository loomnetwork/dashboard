#!/bin/bash

# This script deploys all relevant contracts to a local DAppChain node & Ganache,
# both of which should already be running when the script is executed.
# All the deployed scripts are also copied into src/contracts so the Marketplace frontend code
# has the most up to date ABI for the deployed contracts.
# By default the script will expect all the repos to be checked out under the same parent directory,
# but this can be overriden via the script options.
#
# Example usage:
# ./setup_local_test_env.sh --deploy-dappchain-contracts --deploy-ethereum-contracts --update-contracts --map-contracts

TRANSFER_GATEWAY_REPO="../transfer-gateway-v2"
DAPPCHAIN_CONTRACTS_REPO="../CardFaucet"
ETHEREUM_CONTRACTS_REPO="../zombie-battleground-erc721cards"
MARKETPLACE_REPO=`pwd`
UPDATE_CONTRACTS=false
MAP_CONTRACTS=false
DEPLOY_TO_DAPPCHAIN=false
DEPLOY_TO_ETHEREUM=false

# Script options
while [[ "$#" > 0 ]]; do case $1 in
    --transfer-gateway-repo) TRANSFER_GATEWAY_REPO="$2"; shift; shift;;
    --dappchain-contracts-repo) DAPPCHAIN_CONTRACTS_REPO="$2"; shift; shift;;
    --ethereum-contracts-repo) ETHEREUM_CONTRACTS_REPO="$2"; shift; shift;;
    --update-contracts) UPDATE_CONTRACTS=true; shift;;
    --map-contracts) MAP_CONTRACTS=true; shift;;
    --deploy-dappchain-contracts) DEPLOY_TO_DAPPCHAIN=true; shift;;
    --deploy-ethereum-contracts) DEPLOY_TO_ETHEREUM=true; shift;;
    *) echo "Unknown parameter: $1"; shift; shift;;
esac; done

cd $TRANSFER_GATEWAY_REPO
GATEWAY_ETH_ADDR=`cat mainnet/gateway_eth_addr`
#./loom_e2e_tests.sh --init --launch-dappchain --launch-ganache \
#                    --skip-tests --wait-on-exit --persist

if [[ "$DEPLOY_TO_ETHEREUM" == true ]]; then
    cd $ETHEREUM_CONTRACTS_REPO

    GATEWAY_ETH_ADDR=$GATEWAY_ETH_ADDR \
    yarn deploy:ganache
fi

if [[ "$DEPLOY_TO_DAPPCHAIN" == true ]]; then
    cd $DAPPCHAIN_CONTRACTS_REPO

    GATEWAY_ETH_ADDR=$GATEWAY_ETH_ADDR \
    yarn migrate:dappchain
fi

if [[ "$UPDATE_CONTRACTS" == true ]]; then
    # Extract the ABI & networks from compiled contracts so they can be called via web3
    EXTRACTION_PATTERN="{abi,networks}"
    cd $MARKETPLACE_REPO
    for d in $DAPPCHAIN_CONTRACTS_REPO/build/contracts/*.json ; do
        echo "updating ${d}"
        cat ${d} | jq $EXTRACTION_PATTERN > $MARKETPLACE_REPO/src/contracts/${d##*/}
    done
    cat $TRANSFER_GATEWAY_REPO/mainnet/build/contracts/Gateway.json | jq $EXTRACTION_PATTERN > src/contracts/Gateway.json
fi

if [[ "$MAP_CONTRACTS" == true ]]; then
    cd $MARKETPLACE_REPO
    node ./add-contract-mapping.js \
        "$DAPPCHAIN_CONTRACTS_REPO/dappchain_deployment_info.json" \
        "$ETHEREUM_CONTRACTS_REPO/ganache_deployment_info.json" \
        "$DAPPCHAIN_CONTRACTS_REPO/private_key"
fi
