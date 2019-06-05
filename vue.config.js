/* eslint-disable */
var PrerenderSpaPlugin = require("prerender-spa-plugin")
var path = require("path")
const Renderer = PrerenderSpaPlugin.PuppeteerRenderer
const SentryCliPlugin = require("@sentry/webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")

const baseUrl = "/"

module.exports = {
  //publicPath: baseUrl,
  //baseUrl: baseUrl,
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
    https: true,
    disableHostCheck: true
  },
  configureWebpack: config => {
    console.log("nodeenv:", process.env.NODE_ENV)
    let plugins = []
    config.optimization = {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            sourceMap: true,
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {},
            mangle: false, // Note `mangle.properties` is `false` by default.
            module: false,
            output: null,
            toplevel: false,
            nameCache: null,
            ie8: false,
            keep_classnames: undefined,
            keep_fnames: true,
            safari10: false
          }
        })
      ]
    }
    return {
      plugins: plugins
    }
  },
  chainWebpack: config => {
    config.module.rules.delete("eslint")
    config.resolve.set("symlinks", false) // makes yarn link loom-js work
    config.module.rules.delete("uglify")
  }
}
