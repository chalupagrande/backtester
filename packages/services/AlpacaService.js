const Service = require('@backtester/core/src/Service')
const Alpaca = require('@alpacahq/alpaca-trade-api')
const axios = require('axios')

class AlpacaService extends Service {
  constructor({ start, end, inc, portfolio, alpacaId, alpacaSecret }) {
    super(start, end, inc, portfolio)
    this.client = new Alpaca({
      keyId: alpacaId,
      secretKey: alpacaSecret,
      paper: true,
      usePolygon: false,
    })
  }

  async fetchOHLC() {
    const r = await this.client.getBars(this.inc, this.portfolio, {
      limit: 1000,
      start: this.timeframe[0], // 30 days ago
      end: this.timeframe[1],
    })
    this.data = this.format(r)
    this.length = r[this.portfolio[0]].length
    return this.data
  }

  format(d) {
    return d
  }

  async fetchBidAsk() {
    const promises = this.portfolio.map(async (symbol) => {
      try {
        let resp = await axios({
          method: 'GET',
          url: `${process.env.ALPACA_DATA_ENDPOINT}/v2/stocks/${symbol}/quotes`,
          headers: {
            'APCA-API-KEY-ID': process.env.ALPACA_API_KEY_ID,
            'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY,
          },
          params: {
            start: this.timeframe[0],
            end: this.timeframe[1],
            limit: 1000,
          },
        })
        return resp?.data
      } catch (err) {
        console.log('\n\n ERROR: \n', err)
      }
    })

    Promise.all(promises).then((r) => {
      const result = r.reduce((a, e) => {
        a[e.symbol] = e.quotes
        return a
      }, {})
      this.data = result
      return result
    })
  }
}

module.exports = AlpacaService
