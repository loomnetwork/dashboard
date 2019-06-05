// module.exports = {
//   presets: ['@vue/app']
// }
module.exports = {
  presets: [
    '@vue/app',
    "@babel/preset-env"
  ],
  "env": {
    "test": {
      "plugins": ["istanbul"]
    }
  }
}

