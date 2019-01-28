/* eslint-disable class-methods-use-this */
import axios from 'axios'

export default class ApiClient {
  constructor() {
    this.axios = axios.create({})
    this.baseUrl = this.getBaseUrl()
  }

  getBaseUrl() {
    if (process.env.NODE_ENV === 'production') {
      return 'https://api-faucet.dappchains.com'
    } else if (process.env.NODE_ENV === 'localdev') {
      return 'http://localhost:3000'
    }
    return 'https://api-faucet.dappchains.com'
  }

  async setAccessToken(token) {
    this.axios.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  get(endpoint) {
    return axios.get(this.baseUrl + endpoint)
  }

  post(endpoint, payload) {
    return this.axios.post(this.baseUrl + endpoint, payload)
  }

  postWithoutBase(endpoint, payload) {
    const instance = axios.create({})
    delete instance.defaults.headers.common.Authorization
    return instance.post(endpoint, payload)
  }
}
