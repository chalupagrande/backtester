const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
})

const AlpacaService = require('@backtester/services/AlpacaService')

const alpacaOptions = {
  start: '2021-01-01T00:00:00Z',
  end: '2021-03-31T23:59:59Z',
  cash: 1000,
  inc: 'day',
  portfolio: ['GME', 'TSLA'],
  alpacaId: process.env.ALPACA_API_KEY_ID,
  alpacaSecret: process.env.ALPACA_API_SECRET_KEY,
}

const Alpaca = new AlpacaService(alpacaOptions)

Alpaca.fetchBidAsk()
setTimeout(()=> {
  console.log(Alpaca.data)
  debugger
}, 5000)



console.log(alpacaOptions)