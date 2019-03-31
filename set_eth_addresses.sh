TARGET='src/store/dappChainStore.js';

normal_sed() {
    sed -i 's/LOOM_ADDRESS = "[^"]*"/LOOM_ADDRESS = "'$LOOM_ADDRESS'"/' $TARGET; 
    sed -i 's/GW_ADDRESS = "[^"]*"/GW_ADDRESS = "'$GW_ADDRESS'"/' $TARGET;
}
darwin_sed() {
    echo $TARGET;
    sed -i '' 's/LOOM_ADDRESS = "[^"]*"/LOOM_ADDRESS = "'$LOOM_ADDRESS'"/' $TARGET; 
    sed -i '' 's/GW_ADDRESS = "[^"]*"/GW_ADDRESS = "'$GW_ADDRESS'"/' $TARGET;
}

normal_sed || darwin_sed;
