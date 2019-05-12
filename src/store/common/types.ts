
import Web3 from "web3";

export interface CommonState {
    web3: Web3|null,
    route: any|null,
    user: any|null,
    privateKey: any|null,
    retrievedBackerInfo: boolean,
    userIsLoggedIn: boolean,
    tiers: any[],
    errorMsg: string|null,
    successMsg: string|null,
    showLoadingSpinner: boolean,
    alternateBackground: boolean,
    loadingSpinnerMsg: string,
    packages: any[],
    ableToProceed: boolean, // everything is ready, MM installed and logged in, user has account, contract deployed
    hasPendingApprove: boolean,
    pendingApprove: number,
    metaMaskUserSignature: '',
    userTiers: number,
    modalTab: string,
}
