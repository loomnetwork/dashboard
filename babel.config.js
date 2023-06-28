module.exports = {
  presets: ["@vue/cli-plugin-babel/preset", "@babel/preset-env"],
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
