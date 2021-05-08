<template>
  <div>
    <b-popover
      class="popover"
      target="bsc-binance-wallet"
      title="Binance Chain Wallet"
      triggers="hover"
    >
      <p>This wallet also supports <strong>Ledger</strong>.</p>
      <p>
        If you want to use a Ledger open the Binance Chain Wallet extension and
        select
        <strong>Hardware Wallet</strong> from the menu, then follow the steps to
        setup your device for use with Binance Chain Wallet.
      </p>
      <img
        style="width: 100%"
        src="../assets/binance-wallet-ledger.png"
        alt="Screenshot of setting up Ledger in Binance Chain Wallet"
      />
    </b-popover>
    <b-popover
      class="popover"
      target="bsc-metamask-wallet"
      title="Metamask Wallet"
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
      target="bsc-walletconnect"
      title="WalletConnect Protocol"
      triggers="hover"
    >
      WalletConnect supports many <strong>iOS</strong> and
      <strong>Android</strong> wallets. It's easy to use and there's nothing to
      install, just scan a QR code to connect.
    </b-popover>
  </div>
</template>
