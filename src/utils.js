/* eslint-disable no-undef, func-names */
import Web3 from 'web3'
import BigNumber from 'bignumber.js'

const unitMap = {
  'noether':      '0',
  'wei':          '1',
  'kwei':         '1000',
  'Kwei':         '1000',
  'babbage':      '1000',
  'femtoether':   '1000',
  'mwei':         '1000000',
  'Mwei':         '1000000',
  'lovelace':     '1000000',
  'picoether':    '1000000',
  'gwei':         '1000000000',
  'Gwei':         '1000000000',
  'shannon':      '1000000000',
  'nanoether':    '1000000000',
  'nano':         '1000000000',
  'szabo':        '1000000000000',
  'microether':   '1000000000000',
  'micro':        '1000000000000',
  'finney':       '1000000000000000',
  'milliether':   '1000000000000000',
  'milli':        '1000000000000000',
  'ether':        '1000000000000000000',
  'kether':       '1000000000000000000000',
  'grand':        '1000000000000000000000',
  'mether':       '1000000000000000000000000',
  'gether':       '1000000000000000000000000000',
  'tether':       '1000000000000000000000000000000'
}

export function toBigNumber(number) {
  number = number || 0
  if (isBigNumber(number))
    return number

  if (isString(number) && (number.indexOf('0x') === 0 || number.indexOf('-0x') === 0)) {
    return new BigNumber(number.replace('0x',''), 16)
  }
  return new BigNumber(number.toString(10), 10)
}

export function isBigNumber(object) {
  return (object && (object instanceof BigNumber || (object.constructor && object.constructor.name === 'BigNumber')))      
}

const isString = function (object) {
  return typeof object === 'string' ||
      (object && object.constructor && object.constructor.name === 'String')
}

export function getValueOfUnit(unit) {
  unit = unit ? unit.toLowerCase() : 'ether'
  var unitValue = unitMap[unit]
  if (unitValue === undefined) {
      throw new Error('This unit doesn\'t exists, please use the one of the following units' + JSON.stringify(unitMap, null, 2))
  }
  return new BigNumber(unitValue, 10)
}


const web3js = new Web3(Web3.currentProvider)

export const getDomainType = function() {
  const host = window.location.host
  if (host && !host.includes('local')) {
    return host.split('.')[0]
  }
  return 'local'
}

export const getNetworkType = async function() {
  if (typeof window.web3 !== 'undefined') {
    return new Promise(resolve => {
      web3.version.getNetwork((err, netId) => {
        resolve(netId)
      })
    })
  }
  return null
}

export const formatToCrypto = (amount) => {
  let conversion = amount / 10 ** 18
  let limitDecimals = conversion.toFixed(2)
  return limitDecimals
}

export const DOMAIN_NETWORK_ID = {
  '1': ['loom'],
  '4': ['rinkeby', 'stage', 'local']
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

export const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


export const EMAIL_REGEX = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/