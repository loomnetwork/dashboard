import Web3 from 'web3'

export const connectToMetamask = async () => {

  let web3js
  if (window.ethereum) {
    window.web3 = new Web3(ethereum)
    web3js = new Web3(ethereum)
    await ethereum.enable();
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
    web3js = new Web3(window.web3.currentProvider)
  } else {
    throw 'Metamask is not Enabled'
  }
  
  if(web3js) {
    return web3js
  }

}

export const initWeb3 = () => {

  return new Promise(
    async (resolve, reject) => {
      let myWeb3 = null      
      if(window.ethereum) {
        myWeb3 = new Web3(ethereum)
        try {
          await ethereum.enable()
        } catch(err) {          
          reject("User denied access to Metamask")
        }
      } else if(window.web3) {
        myWeb3 = new Web3(window.web3.currentProvider)
      } else {
        reject("no Metamask installation detected")
      }
      window.web3 = myWeb3
      resolve(myWeb3)

    }
  )

}


export const init2 = async () => {
  let web3js
  if (window.ethereum) {
    window.web3 = new Web3(ethereum)
    web3js = new Web3(ethereum)
    try {
      await ethereum.enable();
    } catch (err) {
      // this.setErrorMsg("User denied access to Metamask")
      console.error(err)
      return
    }
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
    web3js = new Web3(window.web3.currentProvider)
  } else {
    // this.setErrorMsg('Metamask is not Enabled')
  }

  return web3js
}