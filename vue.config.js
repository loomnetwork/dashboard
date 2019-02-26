/* eslint-disable */
var PrerenderSpaPlugin = require('prerender-spa-plugin')
var path = require('path')
const Renderer = PrerenderSpaPlugin.PuppeteerRenderer
const SentryCliPlugin = require('@sentry/webpack-plugin');

var baseUrl = '/'
/*
if (process.env.ASSET_ENV === 'production') {
  baseUrl = 'https://d1yfcrdiemhp2q.cloudfront.net'
} else if (process.env.ASSET_ENV === 'staging') {
  baseUrl = 'https://d1enfopzuihz6a.cloudfront.net'
} else if (process.env.ASSET_ENV === 'dev') {
  baseUrl = 'https://faucet.dappchains.com'
}
*/

const proxyUrl = 'https://rinkeby.loom.games'
const proxyFaucetUrl = 'https://api-faucet.dappchains.com'


module.exports = {
  baseUrl: baseUrl,
  pages: {
      index: {
        title: 'Index Page',
       entry: 'src/index.js',
        template: 'public/index.html',
        filename: 'index.html'
      }
  },
  runtimeCompiler: true,
  devServer: {
    https: true,
    proxy: {
      '^/auth/*': {
        target: proxyUrl,
        ws: true,
        changeOrigin: true
      },
      '^/user/*': {
        target: proxyUrl,
        ws: true,
        changeOrigin: true
      },
      '^/backer/*': {
        target: proxyUrl,
        ws: true,
        changeOrigin: true
      },
      '^/erc721/*': {
        target: proxyUrl,
        ws: true,
        changeOrigin: true
      },
      '^/lottery/*': {
        target: proxyUrl,
        ws: true,
        changeOrigin: true
      },
      '^/karma/*': {
        target: proxyFaucetUrl,
        ws: true,
        changeOrigin: true
      },
      '^/fiat/*': {
        target: proxyUrl,
        ws: true,
        changeOrigin: true
      }
    }
  },
  configureWebpack: config => {
    console.log('nodeenv:', process.env.NODE_ENV)
    let plugins = []
    // if(process.env.NODE_ENV !== 'development') plugins.push(
    //   new PrerenderSpaPlugin({
    //     staticDir: path.resolve(__dirname, 'dist'),
    //     routes: ['/', '/browse', '/trading', '/cards', '/earlybacker'],
    //     server: {
    //       // Normally a free port is autodetected, but feel free to set this if needed.
    //       port: 8001
    //     },
    //     renderer: new Renderer({
    //       // renderAfterElementExists: '#app'
    //       // Wait to render until a specified event is fired on the document.
    //       // renderAfterDocumentEvent: 'render-event',
    //       renderAfterTime: 5000,
    //           // headless: false,
    //         maxConcurrentRoutes: 1
    //     })
    //   })
    // )
    return {
      plugins: plugins
    }
  },
  chainWebpack: config => {
    config.module.rules.delete('eslint');
    config.resolve.set('symlinks', false); // makes yarn link loom-js work
  }
}
