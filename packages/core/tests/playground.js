const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
})
const AlpacaService = require('@backtester/services/AlpacaService')
const Backtester = require('../src/Backtester')
const Service = require('../src/Service')
const Study = require('../src/Study')
const { opts, orders } = require('./backtester.options.js')

const alpacaOptions = {
  ...opts,
  alpacaId: process.env.ALPACA_API_KEY_ID,
  alpacaSecret: process.env.ALPACA_API_SECRET_KEY,
}

const BT = new Backtester()
const Alpaca = new AlpacaService(alpacaOptions)
const id = BT.prepare({
  cash: opts.cash,
  service: Alpaca,
  portfolio: opts.portfolio,
})
const study = BT.getStudy(id)

async function run() {
  await Alpaca.fetchOHLC()
  let r = study.get()
  console.log('R', r)
  r = study.get(1)
  console.log('R2', r)
  r = study.get(2, 4)
  console.log('R3', r)
  debugger
  /**
   *
   *
   * WRITE CODE HERE
   */
}

run()
console.log('DONE')
