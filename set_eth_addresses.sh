sed_linux () {
  sed -i 's/LOOM_ADDRESS = "[^"]*"/LOOM_ADDRESS = "'$LOOM_ADDRESS'"/' src/store/dappChainStore.js; 
  sed -i 's/GW_ADDRESS = "[^"]*"/GW_ADDRESS = "'$GW_ADDRESS'"/' src/store/dappChainStore.js;  
}

sed_osx () {
  gsed -i 's/LOOM_ADDRESS = "[^"]*"/LOOM_ADDRESS = "'$LOOM_ADDRESS'"/' src/store/dappChainStore.js; 
  gsed -i 's/GW_ADDRESS = "[^"]*"/GW_ADDRESS = "'$GW_ADDRESS'"/' src/store/dappChainStore.js;  
}

(sed_linux || sed_osx) 2> /dev/null

if [[ -n $LOOM_ADDRESS ]] || [[ -n $GW_ADDRESS ]]
then
  echo "============================"
  echo "LOOM ADDRESS: $LOOM_ADDRESS"
  echo "GW_ADDRESS:   $GW_ADDRESS"
  echo "============================"
fi


