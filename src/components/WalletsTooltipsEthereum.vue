<template>
  <div>
    <b-popover
      class="popover"
      target="metamask-button"
      title="Metamask"
      triggers="hover"
    >
      <p>
        This wallet also supports <strong>Ledger</strong> and
        <strong>Trezor</strong>.
      </p>
      <p>
        If you want to use a Ledger or Trezor open the Metamask extension and
        select
        <strong>Connect Hardware Wallet</strong> from the menu, then follow the
        steps to setup your device for use with Metamask.
      </p>
      <img
        style="width: 100%"
        src="@/assets/metamask-hardware-screencap.png"
        alt="Screenshot of setting up hardware wallet in Metamask"
      />
    </b-popover>
    <b-popover
      class="popover"
      target="eth-walletconnect-button"
      title="WalletConnect Protocol"
      triggers="hover"
    >
      WalletConnect supports many <strong>iOS</strong> and
      <strong>Android</strong> wallets. It's easy to use and there's nothing to
      install, just scan a QR code to connect. See the
      <a href="https://walletconnect.org/wallets" target="_blank"
        >list of mobile wallets supported by WalletConnect</a
      >
    </b-popover>
    <b-popover
      class="popover"
      target="eth-walletlink-button"
      title="Coinbase Wallet"
      triggers="hover"
    >
      <a href="https://www.coinbase.com/wallet" target="_blank">Coinbase Wallet</a>
      is available on <strong>iOS</strong>, <strong>Android</strong>, and as a desktop Chrome extension.
    </b-popover>
  </div>
</template>
<style scoped>
.popover-body img {
  width: 100%;
}
</style>