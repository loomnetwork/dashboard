<template>
  <div class>
    <div class="pt-3">
      <main>
        <div class="container-fluid mb-5 rmv-padding">
          <b-modal
            no-close-on-esc
            no-close-on-backdrop
            id="modal-lg"
            size="lg"
            @hide="onClose"
            v-model="maybeRelentlessUser"
          >
            <div class="confirm-link text-center">
              <h3>
                {{ $t("views.first_page.ask_from_relentless_marketplace") }}
              </h3>
              <p>{{ $t("views.first_page.if_from_relentless_marketplace") }}</p>
              <div class="linking-div">
                <img src="../assets/images/relentless.png" />
                <i style="font-size: 56px" class="fa">&#8651;</i>
                <loom-icon width="56px" height="56px" color="#6eccd8" />
              </div>
              <div class="linking-div-choice">
                <b-button
                  block
                  variant="outline-primary"
                  :href="loomGamesUrl"
                  >{{ $t("views.first_page.link_my_account") }}</b-button
                >
              </div>
            </div>
            <div slot="modal-footer" class="w-100" style="text-align: center">
              <b-button
                v-show="!reconsider"
                variant="link"
                style="color: gray"
                @click="reconsider = true"
                >{{
                  $t("views.first_page.not_from_relentless_marketplace")
                }}</b-button
              >
              <div class="reconsider" v-show="reconsider">
                <h5>{{ $t("views.first_page.you_sure") }}</h5>
                <p style="color: red">{{ $t("views.first_page.warn_note") }}</p>
                <b-button
                  variant="outline-dark"
                  @click="maybeRelentlessUser = false"
                  >{{ $t("views.first_page.create_new_account") }}</b-button
                >
              </div>
            </div>
          </b-modal>
          <b-row
            id="main-main"
            class="container-fluid center-content"
            style="justify-content: center"
            v-once
          >
            <b-card-group deck>
              <!-- Binance Smart Chain wallets -->
              <b-card v-if="bscWalletsEnabled">
                <b-card-title>
                  <img
                    class="d-block mx-auto"
                    width="64px"
                    height="64px"
                    src="../assets/binance_logo.png"
                    alt="Binance Logo"
                  />
                  <div class="text-center mt-2">Binance Smart Chain</div>
                  <div class="text-center h6 font-weight-normal font-italic">
                    Stake your LOOM BEP20 tokens!
                  </div>
                </b-card-title>
                <div class="text-center">
                  {{ $t("views.first_page.select_wallet") }}...
                </div>
                <b-card-body>
                  <div class="wallet-provider-container">
                    <div class="row">
                      <div class="col-sm-12 mb-3">
                        <b-card
                          id="bsc-binance-wallet"
                          class="wallet-selection-card text-center"
                          @click="setWallet('binance', 'binance')"
                        >
                          <div>
                            <img :src="wallets.get('binance').logo" />
                            <span>{{ wallets.get("binance").name }}</span>
                          </div>
                        </b-card>
                      </div>
                      <div class="col-sm-12 mb-3">
                        <b-card
                          id="bsc-metamask-wallet"
                          class="wallet-selection-card text-center"
                          @click="setWallet('binance', 'metamask')"
                        >
                          <div>
                            <img :src="wallets.get('metamask').logo" />
                            <span>{{ wallets.get("metamask").name }}</span>
                          </div>
                        </b-card>
                      </div>
                      <div class="col-sm-12 mb-3">
                        <b-card
                          id="bsc-walletconnect"
                          class="wallet-selection-card text-center"
                          @click="setWallet('binance', 'walletconnect')"
                        >
                          <img :src="wallets.get('walletconnect').logo" />
                          <span>{{ wallets.get("walletconnect").name }}</span>
                        </b-card>
                      </div>
                      <div class="col-sm-12 mb-3">
                        <b-card style="box-shadow: none">
                          <h5>
                            <img
                              src="../assets/metamask_logo.png"
                              height="32"
                            />
                            Using Metamask?
                          </h5>
                          <b-card-text>
                            Select <strong>Binance Smart Chain</strong> in your
                            Metamask wallet first. If you don't see it there
                            <b-button
                              @click="addBSCToMetamask()"
                              size="sm"
                              variant="outline-primary"
                              >add BSC Network
                            </b-button>
                          </b-card-text>
                        </b-card>
                      </div>
                    </div>
                  </div>
                </b-card-body>
                <WalletsTooltipsBSC v-if="!isTouchDevice" />
              </b-card>
              <!-- Ethereum wallets -->
              <b-card v-once>
                <b-card-title>
                  <img
                    class="d-block mx-auto"
                    width="54px"
                    height="64px"
                    src="../assets/ethereum_logo.png"
                    alt="Ethereum Logo"
                  />
                  <div class="text-center mt-2">Ethereum</div>
                  <div class="text-center h6 font-weight-normal font-italic">
                    Stake your LOOM ERC20 tokens!
                  </div>
                </b-card-title>
                <div class="text-center">
                  {{ $t("views.first_page.select_wallet") }}...
                </div>
                <b-card-body>
                  <div class="wallet-provider-container">
                    <div class="row">
                      <div class="col-sm-12 mb-3">
                        <b-card
                          id="metamask-button"
                          class="wallet-selection-card text-center"
                          @click="setWallet('ethereum', 'metamask')"
                        >
                          <div>
                            <img :src="wallets.get('metamask').logo" />
                            <span>{{ wallets.get("metamask").name }}</span>
                          </div>
                        </b-card>
                      </div>
                      <div class="col-sm-12 mb-3">
                        <b-card
                          id="eth-walletconnect-button"
                          class="wallet-selection-card text-center"
                          @click="setWallet('ethereum', 'walletconnect')"
                        >
                          <div>
                            <img :src="wallets.get('walletconnect').logo" />
                            <span>{{ wallets.get("walletconnect").name }}</span>
                          </div>
                        </b-card>
                      </div>
                      <div class="col-sm-12 mb-3">
                        <b-card
                          id="eth-walletlink-button"
                          class="wallet-selection-card text-center"
                          @click="setWallet('ethereum', 'walletlink')"
                        >
                          <div>
                            <img :src="wallets.get('walletlink').logo" />
                            <span>{{ wallets.get("walletlink").name }}</span>
                          </div>
                        </b-card>
                      </div>
                      <div class="col-sm-12">
                        <b-card
                          id="explore-button"
                          class="wallet-selection-card text-center"
                          @click="addressModalShow = !addressModalShow"
                        >
                          <div>
                            <fa icon="search" class="search-icon" />
                            <span>{{
                              $t("views.first_page.wallets.explore")
                            }}</span>
                          </div>
                        </b-card>
                      </div>
                    </div>
                  </div>
                </b-card-body>
                <WalletsTooltipsEthereum v-if="!isTouchDevice" />
              </b-card>
            </b-card-group>
            <template v-if="env">
              <div class="d-none d-xl-block">
                <div id="announcement" v-if="env.announcement.home">
                  <a href="https://cryptozombies.io/libra" target="_blank">
                    <img
                      src="../assets/images/ads/Libra-Banner-Homepage-300x250px.jpg"
                      class="ad-img"
                    />
                  </a>
                </div>
              </div>
            </template>
          </b-row>
          <template v-if="env">
            <div class="d-xl-none" v-if="env.announcement.home">
              <div id="announcement-mobile">
                <a href="https://cryptozombies.io/libra" target="_blank">
                  <img
                    src="../assets/images/ads/Libra-Banner-Homepage-300x250px.jpg"
                    class="ad-img"
                  />
                </a>
              </div>
            </div>
          </template>

          <b-modal v-model="showMetamaskInstallPrompt" ok-only>
            <template slot="modal-title">
              <img
                class="mr-2"
                id="metamask-mini-icon"
                src="../assets/metamask_logo.png"
              />
              Metamask Wallet not found
            </template>
            <p>
              The Metamask Wallet extension is not installed, or not enabled.
            </p>
            <ul>
              <li>
                If you have previously installed this extension please enable it
                now and reload the page.
              </li>
              <li>
                Otherwise, you can download and install from the
                <a href="https://metamask.io/" target="_blank">official site</a
                >.
              </li>
            </ul>
          </b-modal>

          <b-modal v-model="showBinanceInstallPrompt" ok-only>
            <template slot="modal-title">
              <img
                class="mr-2"
                id="metamask-mini-icon"
                src="../assets/binance_wallet_logo.svg"
              />
              Binance Chain Wallet not found
            </template>
            <p>
              The Binance Chain Wallet extension is not installed, or not
              enabled.
            </p>
            <ul>
              <li>
                If you have previously installed this extension please enable it
                now and reload the page.
              </li>
              <li>
                Otherwise, you can download and install it in
                <a
                  href="https://chrome.google.com/webstore/detail/binance-chain-wallet/fhbohimaelbohpjbbldcngcnapndodjp"
                  target="_blank"
                >
                  Chrome
                </a>
                or
                <a
                  href="https://addons.mozilla.org/en-US/firefox/addon/binance-chain/?src=search"
                  target="_blank"
                >
                  Firefox </a
                >. If you need any help with the installation please check out
                the
                <a
                  href="https://docs.binance.org/smart-chain/wallet/binance.html"
                  target="_blank"
                  >Binance docs</a
                >.
              </li>
            </ul>
          </b-modal>

          <b-modal v-model="addressModalShow" hide-header hide-footer>
            <div>
              <b-form-input
                v-model="address"
                class="mb-2"
                :placeholder="$t('input_placeholder.enter_your_addr')"
              ></b-form-input>
              <b-button
                type="submit"
                @click="setExploreMode(address)"
                variant="primary"
                >{{ $t("button.submit") }}</b-button
              >
            </div>
          </b-modal>

          <ChainSelector
            style="width: 250px; margin: 0 auto"
            class="connection-status"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import ChainSelector from "@/components/ChainSelector.vue"
import WalletsTooltipsBSC from "@/components/WalletsTooltipsBSC.vue"
import WalletsTooltipsEthereum from "@/components/WalletsTooltipsEthereum.vue"

import { ethereumModule } from "@/store/ethereum"
import { DashboardState } from "../types"

import LoomIcon from "@/components/LoomIcon.vue"
import { gatewayModule } from "../store/gateway"
import { feedbackModule } from "../feedback/store"

import { MetaMaskAdapter, addNetwork as mmAddNetwork } from "../store/ethereum/wallets/metamask"
import { BinanceChainWalletAdapter } from "../store/ethereum/wallets/binance"
import { tokenService } from "@/services/TokenService"
import { getTokenList } from "../utils"

import { wallets } from "@/store/ethereum"

@Component({
  components: {
    WalletsTooltipsBSC,
    WalletsTooltipsEthereum,
    ChainSelector,
    LoomIcon,
  },
})
export default class FirstPage extends Vue {

  wallets = wallets

  get $state() { return (this.$store.state as DashboardState) }

  get maybeRelentlessUser() {
    return this.$state.gateway.maybeRelentlessUser
  }
  set maybeRelentlessUser(val) {
    if (val === false) {
      gatewayModule.setMaybeRelentlessUser(val)
    }
  }

  get loomGamesUrl() {
    return this.$state.plasma.loomGamesEndpoint
  }

  get env() {
    let networkId = this.$state.plasma.networkId
    // for production networkId = "plasma" and chainId = "default"
    if (networkId === "plasma") {
      networkId = "default"
    }
    return this.$state.envs.find((env) => env.plasma.chainId === networkId)!
  }

  get bscWalletsEnabled(): boolean {
    return this.$state.activeConfig ? this.$state.activeConfig.features.bscWallets : false
  }
  address = ""
  addressModalShow = false
  mappedModalShow = false
  reconsider = false
  showMetamaskInstallPrompt = false
  showBinanceInstallPrompt = false

  setExploreMode = ethereumModule.setToExploreMode

  get isTouchDevice() {
    return "ontouchstart" in window
  }

  setWallet(chain: "ethereum" | "binance", walletType: string) {
    switch (walletType) {
      case "metamask":
      case "test_wallet":
        if (!MetaMaskAdapter.detect()) {
          this.showMetamaskInstallPrompt = true
          return
        }
        break

      case "binance":
        if (!BinanceChainWalletAdapter.detect()) {
          this.showBinanceInstallPrompt = true
          return
        }
        break
    }

    if (chain === "ethereum") {
      tokenService.setTokens(getTokenList(this.env.name))
      ethereumModule.setConfig(this.env.ethereum)
    } else if (chain === "binance" && this.env.binance !== undefined) {
      tokenService.setTokens(getTokenList(`${this.env.name}.${chain}`))
      ethereumModule.setConfig(this.env.binance)
    }

    ethereumModule.setWalletType(walletType)
  }

  async addBSCToMetamask() {
    const bscConf = this.env.binance
    if (!bscConf) throw new Error("binance config not set in current env")

    await mmAddNetwork(bscConf)
  }

  onClose() {
    if (!this.$state.ethereum.signer) feedbackModule.endTask()
  }
}
</script>

<style lang="scss" scoped>
#main-main {
  flex-direction: row;
}

#announcement {
  margin: 0 34px;
  width: 300px;
  height: 250px;
}

#announcement-mobile {
  margin: auto;
  width: 300px;
  height: 250px;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  border-left: 2px solid #f2f1f3;
}
.banner-container .col {
  padding: 0 36px;
}

.button-inner-container {
  width: 250px;
}

.rmv-padding {
  padding: 0 !important;
}

#login-tab {
  .actions {
    display: flex;
    justify-content: center;
    button {
      width: 250px;
      margin: 16px;
    }
  }
}

.wizard-img-container {
  background-color: #6f6f6f;
  overflow: hidden;
  .wizard-img {
    display: block;
    margin: 0 auto;
    max-width: 220px;
    box-shadow: rgba(23, 21, 21, 0.56) 0px 3px 8px 0px;
  }
}

@media (max-width: 767px) {
  #main-main {
    flex-direction: column;
  }
  #login-tab {
    .actions {
      display: flex;
      flex-direction: column;
      button {
        width: 100%;
        margin: 8px 0;
      }
    }
  }
}

@media (max-width: 1024px) {
  .wallet-provider-container {
    margin: auto;
  }
}
</style>

<style lang="scss">
.header {
  .navbar {
    padding: 0;
    width: 100%;
    .navbar-brand {
      display: block;
      padding: 0;
      img {
        height: 56px;
      }
    }
  }
}

.popover {
  h3 {
    color: black;
  }
}

.nav-pills .nav-link.active span {
  display: inline-block;
  color: #ffffff;
  margin-right: 6px;
}

.tab-title {
  display: inline-block;
  margin-right: 6px;
}

.loomy-graphic {
  display: block;
  max-height: 200px;
  margin: 0 auto;
}

.faucet {
  main {
    min-height: 620px;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  color: gray;
  h3,
  h1 {
    color: gray;
  }
  .bottom-border {
    border-bottom: 2px solid lightgray;
  }
  .top-border {
    border-top: 2px solid lightgray;
  }
  .no-top-border {
    border-top: 0;
  }
  .no-bottom-border {
    border-bottom: 0;
  }
  .button {
    border-left: 0;
    border-right: 0;
    border-radius: 0;
    background-color: transparent;
    padding: 20px;
  }
}

.center-content {
  margin: 24px auto;
}

.wallet-provider-container {
  max-width: 350px;
  .wallet-selection-card {
    position: relative;
    cursor: pointer;
    div {
      display: flex;
      align-items: center;
      width: 100%;
    }
    img {
      height: 32px !important;
      width: auto;
      margin-right: 3px;
      height: auto;
    }
    small {
      display: block;
    }
    span {
      flex: 1;
      text-align: center;
      margin-left: -24px;
      font-size: 14px;
    }
    span.qa {
      display: inline-block;
      line-height: 20px;
      right: 12px;
      bottom: 12px;
      position: absolute;
      font-weight: bold;
      width: 20px;
      height: 20px;
      color: white;
      background-color: grey;
      border-radius: 50%;
    }
    .card-body {
      padding: 0.4rem 0.8rem;
    }
    .search-icon {
      margin-right: 6px;
      height: 16px;
      width: 16px;
    }
  }
  .wallet-selection-card.disabled {
    pointer-events: none;
    opacity: 0.3;
  }
}

.metamask-suggest {
  position: relative;
  margin-top: 12px;
  .text-inline {
    margin-left: 10px;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.2;
    display: inline;
  }
}

.confirm-link {
  display: flex;
  flex-direction: column;
  h3 {
    color: black;
  }
}

.reconsider {
  margin-bottom: 10px;
}

.linking-div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 35%;
  align-self: center;
  margin: 0em 0.5em;
}

.linking-div-choice {
  margin-top: 20px;
  margin-left: 50px;
  margin-right: 50px;
}

#wallet-card-img-large {
  height: auto;
  width: 96px;
}
#metamask-mini-icon {
  width: 48px;
  height: auto;
}
#orange {
  color: #f29040;
}

.ad-img {
  width: 100%;
  border-radius: 0.25rem;
}
</style>

<style>
body {
  overflow-y: scroll;
}
</style>
