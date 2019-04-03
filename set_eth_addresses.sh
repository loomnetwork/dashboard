gsed -i 's/LOOM_ADDRESS = "[^"]*"/LOOM_ADDRESS = "'$LOOM_ADDRESS'"/' src/store/dappChainStore.js; 
gsed -i 's/GW_ADDRESS = "[^"]*"/GW_ADDRESS = "'$GW_ADDRESS'"/' src/store/dappChainStore.js;
