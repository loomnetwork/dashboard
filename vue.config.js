/* eslint-disable */
var PrerenderSpaPlugin = require("prerender-spa-plugin")
var path = require("path")
const Renderer = PrerenderSpaPlugin.PuppeteerRenderer
const SentryCliPlugin = require("@sentry/webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const webpack = require("webpack")
const baseUrl = "/"
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { DuplicatesPlugin } = require("inspectpack/plugin");

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

    // https://github.com/sindresorhus/got/issues/345
    let plugins = [
      new webpack.IgnorePlugin(/^electron$/),
      // new DuplicatesPlugin(),
      // new BundleAnalyzerPlugin(),
    ]
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

    if (process.env.NODE_ENV === "test") {
      plugins.push(
        new CopyPlugin([
          {
            from: "node_modules/scrypt/build",
            to: "dist"
          }
        ])
      )
      config.externals = {
        scrypt: "require('scrypt')"
      }
      config.target = "node"
    }
    return {
      resolve: {
        alias: {
          // bn is used by many dependencies so bundle gets bloated with dupe bn code
          "bn.js": path.resolve(__dirname, "node_modules/bn.js/lib/bn.js"),
        }
      },
      plugins: plugins
    }
  },
  chainWebpack: config => {
    config.module.rules.delete("eslint")
    config.resolve.set("symlinks", false) // makes yarn link loom-js work
    config.module.rules.delete("uglify")

    if (process.env.NODE_ENV === "test") {
      // config.module
      //   .rule("istanbul")
      //   .test(/\.(ts|vue)$/)
      //   .enforce("post")
      //   .include.add(path.resolve("src"))
      //   .end()
      //   .use("istanbul-instrumenter-loader")
      //   .loader("istanbul-instrumenter-loader")
      //   .options({ esModules: true })
    }
  }
}
