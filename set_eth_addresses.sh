sed -i 's/LOOM_ADDRESS = "[^"]*"/LOOM_ADDRESS = "'$LOOM_ADDRESS'"/' src/store/dappChainStore.js; 
sed -i 's/GW_ADDRESS = "[^"]*"/GW_ADDRESS = "'$GW_ADDRESS'"/' src/store/dappChainStore.js;
