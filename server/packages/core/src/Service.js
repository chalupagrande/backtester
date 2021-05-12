class Service {
  /**
   *
   * @param {DateTime} start - ISO Formatted Date
   * @param {DateTime} end - ISO Formatted Date
   * @param {Enum} inc - MINUTE, DAY,
   * @param {Array} portfolio - Array of Stock symbols
   */
  constructor(start, end, inc, portfolio = []) {
    this.timeframe = [start, end]
    this.inc = inc
    this.portfolio = portfolio // array of symbols
    this.data = {} // data cache.
    this.client = null // the connection object
    this.length = 0
  }

  /**
   *
   * @param {int} tick - the index of the price in the data array to get
   * @return {array} [low, high] - the spread of prices that the market is at in that step
   *                               NOTE: if there is only 1 price, pass that price as both the low and the high
   */
  get(start, end) {
    let result = {}
    for (let [symbol, data] of Object.entries(this.data)) {
      result[symbol] = data.slice(start, end)
    }
    return result
  }

  /**
   * Fetches the original data and populates the data cache
   */
  fetch(symbols, startTime, endTime) {
    // fetches the actual data for the portfolio.
  }
}

module.exports = Service
