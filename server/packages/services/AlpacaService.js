const Service = require('@backtester/core/src/Service')
const Alpaca = require('@alpacahq/alpaca-trade-api')

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

  async fetch() {
    const r = await this.client.getBars(
      this.inc.toLowerCase(),
      this.portfolio,
      {
        limit: 1000,
        start: this.timeframe[0], // 30 days ago
        end: this.timeframe[1],
      }
    )
    this.data = r
    this.length = r[this.portfolio[0]].length
    return this.data
  }
}

module.exports = AlpacaService
