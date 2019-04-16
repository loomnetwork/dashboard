/* eslint-disable */
import axios from 'axios'
import { getDomainType } from '../utils'

export default class ApiClient {

  constructor() {
    this.baseUrl = this.getBaseUrl()
  }

  getBaseUrl() {
    const domain = getDomainType()
    if (domain === 'local' || domain === 'rinkeby') {
      return 'https://dev-auth.loom.games'
    } else if (domain == 'stage') {
      return 'https://stage-auth.loom.games'
    } else {
      return 'https://auth.loom.games'
    }
  }

  configInterceptors() {
    let headers = this.getHeaders()
    this.axios.interceptors.request.use(
      config => {
        config.headers = headers
        return config
      },
      err => {
        return Promise.reject(err)
      })

    this.axios.interceptors.response.use(
      response => {
        return response
      },
      err => {
        Promise.reject(err)
      }
    )
  }

  getHeaders() {
    let accessToken = sessionStorage.getItem('accessToken')
    if (accessToken) {
      return { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
    }
    return {}
  }

  setAccessToken(token) {
    this.axios.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  post(endpoint, useHeaders, payload) {
    return axios({
      method: 'post',
      url: this.baseUrl + endpoint,
      headers: useHeaders ? this.getHeaders() : {},
      data: payload
    })
  }

  get(endpoint, useHeaders) {
    return axios({
      method: 'get',
      url: this.baseUrl + endpoint,
      headers: useHeaders ? this.getHeaders() : {}
    })
  }

  customPost(endpoint, headers, payload) {
    return axios({
      method: 'post',
      url: this.baseUrl + endpoint,
      headers: headers ? headers : this.getHeaders,
      data: payload
    })
  }

  customGet(endpoint, headers) {
    return axios({
      method: 'post',
      url: this.baseUrl + endpoint,
      headers: headers ? headers : this.getHeaders
    })
  }
}
