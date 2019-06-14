// module.exports = {
//   presets: ['@vue/app']
// }
module.exports = {
  presets: ["@vue/app", "@babel/preset-env"],
  env: {
    test: {
      plugins: [
        "@babel/plugin-transform-runtime",
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread",
        "istanbul"
      ]
    }
  }
}
