/* eslint-disable */
var PrerenderSpaPlugin = require("prerender-spa-plugin")
var path = require("path")
const TerserPlugin = require("terser-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const webpack = require("webpack")

module.exports = {
  pages: {
    index: {
      title: "Index Page",
      entry: "src/index.ts",
      template: "public/index.html",
      filename: "index.html"
    }
  },
  runtimeCompiler: true,
  devServer: {
    server: "http",
    allowedHosts: "all"
  },
  configureWebpack: config => {
    console.log("nodeenv:", process.env.NODE_ENV)

    // https://github.com/sindresorhus/got/issues/345
    let plugins = [
      new webpack.IgnorePlugin({ resourceRegExp: /^electron$/ }),
      new webpack.EnvironmentPlugin(['NODE_ENV', 'INFURA_PROJECT_ID', 'EXT_VALIDATORS_URL', 'WALLETCONNECT_PROJECT_ID']),
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"] // set the global Buffer to the Buffer export from the buffer package
      })
    ]
    
    config.optimization = {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            sourceMap: true,
            ecma: undefined,
            warnings: false,
            compress: {},
            mangle: false, // Note `mangle.properties` is `false` by default.
            module: false,
            keep_classnames: undefined,
            keep_fnames: true,
          }
        })
      ]
    }

    if (process.env.NODE_ENV === "test") {
      config.externals = {
        scrypt: "require('scrypt')"
      }
      config.target = "node"
    }

    plugins.push(
      new CopyPlugin({
        patterns: [{
          from: "src/assets/tokens/",
          to: "tokens"
        }]
      })
    )

    return {
      devtool: 'source-map',
      resolve: {
        alias: {
          "bn.js": path.resolve(__dirname, "node_modules/bn.js/lib/bn.js"),
          "web3-core": path.resolve(__dirname, "node_modules/web3-core"),
          "web3-core-method": path.resolve(__dirname, "node_modules/web3-core-method"),
          "web3-core-helpers": path.resolve(__dirname, "node_modules/web3-core-helpers"),
          "web3-eth-accounts": path.resolve(__dirname, "node_modules/web3-eth-accounts"),
          "web3-eth-contract": path.resolve(__dirname, "node_modules/web3-eth-contract"),
          "web3-utils": path.resolve(__dirname, "node_modules/web3-utils"),
        },
        fallback: {
          buffer: require.resolve("buffer/"),
          stream: require.resolve("stream-browserify"),
          http: require.resolve("stream-http"),
          https: require.resolve("https-browserify"),
          net: false,
          child_process: false,
          fs: false,
        }
      },
      externals: {
        "shelljs": "shelljs"
      },
      plugins: plugins
    }
  },
  chainWebpack: config => {
    config.module.rules.delete("eslint")
    config.resolve.set("symlinks", false) // makes yarn link loom-js work
    config.module.rules.delete("uglify")
  }
}
