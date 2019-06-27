<template>
  <footer id="faucet-footer" class="faucet-footer">
    <div class="block footer-block bg-blue-gradient py-5">
      <div class="container-fluid">
        <div class="inner-container">
          <div class="footer-title">
            <img src="../assets/logo-grey.svg">
          </div>
          <div class="d-flex flex-row row flex-wrap">
            <div class="col">
              <ul class="list-unstyled list-spaced">
                <li><a href="https://loomx.io" target="_blank" class="hover-warning">{{ $t('components.faucet_footer.loom_network') }}</a></li>
                <li><a href="https://EthFiddle.com" target="_blank" class="hover-warning">{{ $t('components.faucet_footer.eth_fiddle') }}</a></li>
                <li><a href="https://EthDeploy.com" target="_blank" class="hover-warning">{{ $t('components.faucet_footer.eth_deploy') }}</a></li>
                <li><a href="https://CryptoZombies.io" target="_blank" class="hover-warning">{{ $t('components.faucet_footer.crypto_zombies') }}</a></li>
                <li><a href="https://solidityx.org" target="_blank" class="hover-warning">{{ $t('components.faucet_footer.solidity_x') }}</a></li>
                <li><a href="https://delegatecall.com/what-is-blockchain" target="_blank" class="hover-warning hover-warning">{{ $t('components.faucet_footer.what_is_blockchain') }}</a></li>
                <li><a href="https://loomx.io/developers/" target="_blank" class="hover-warning hover-warning">{{ $t('components.faucet_footer.loom_sdk') }}</a></li>
                <li><a href="https://delegatecall.com" target="_blank" class="hover-warning">{{ $t('components.faucet_footer.delegatecall') }}</a></li>
              </ul>
            </div>
            <div class="col">
              <ul class="list-unstyled list-spaced">
                <li><a href="https://github.com/loomnetwork" target="_blank" class="hover-warning"><fa :icon="['fab', 'github']" fixed-width /> {{ $t('components.faucet_footer.github') }}</a></li>
                <li><a href="https://medium.com/loom-network" target="_blank" class="hover-warning"><fa :icon="['fab', 'medium']" fixed-width /> {{ $t('components.faucet_footer.medium') }}</a></li>
                <li><a href="https://angel.co/loom-network-1" target="_blank" class="hover-warning"><fa :icon="['fab', 'angellist']" fixed-width /> {{ $t('components.faucet_footer.angel_co') }}</a></li>
                <li><a href="https://twitter.com/loomnetwork" target="_blank" class="hover-warning"><fa :icon="['fab', 'twitter']" fixed-width /> {{ $t('components.faucet_footer.twitter') }}</a></li>
                <li><a href="https://t.me/loomnetwork" target="_blank" class="hover-warning"><fa :icon="['fab', 'telegram']" fixed-width /> {{ $t('components.faucet_footer.telegram') }}</a></li>
                <li><a href="mailto:satoshi@loomx.io" target="_blank" class="hover-warning"><fa :icon="['fas', 'envelope']" fixed-width /> {{ $t('components.faucet_footer.email') }}</a></li>
              </ul>
            </div>
            <div class="col text-left">
              <p>{{ $t('components.faucet_footer.loom_network_is_a_platform') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"

@Component({})
export default class FaucetFooter extends Vue {
}
</script>
<style lang="scss">
.faucet-footer {
  color: #495057;
  width: 100%;
  position: relative;
  bottom: 0;
  .footer-title {
    img {
      position: relative;
      left: -16px;
      width: 120px;
    }
    span {
      color: #495057; 
    }    
  }
  a {
    color: #495057;
  }
  @media (max-width: 529px) {
    & {
      position: relative;
    }
  }
  @media (max-height: 1200px) {
    & {
      position: relative;
    }
  }
}
h3,h1 {
  color: gray;
}
p {
  color: gray;
}
//Footer
.footer-block {
  background-color: #f9f7f7;
  padding: 7em 0 9.5em 0;
  .footer-title {
    font-size: 18px;
    color: #495057;
    font-style: italic;
    font-weight: 600;
    img {
      margin-right: .625rem;
    }
    margin-bottom: 1.125rem;
  }
  ul {
    display: table;
    li {
      a {
        font-size: 16px;
        font-weight:400;
        line-height: 2.63;        
        svg:not(:root).svg-inline--fa {
          width: 1.375rem;
          height: 1.375rem;
          margin-right: .75rem;
        }
      }
    }
  }
  p {
    font-size: 16px;
    line-height: 1.56;
    color: #495057;
    margin-bottom: 29px;
  }  
  .btn {
    border-radius: 23px;
    border: solid 2px #495057;
    font-size: 18px;
    font-weight: normal;
    color: #495057;
  }
}

.bg-blue-gradient {
  background-attachment: fixed;
  color: white;
}



a.hover-warning:hover {
  text-decoration: none;
  color: #f0ad4e !important;
}
</style>
