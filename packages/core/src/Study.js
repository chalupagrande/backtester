const Order = require('./Order')
class Study {
  /**
   *
   * @param {string} id - ID to use for the study
   * @param {string} description - Description of the study.
   * @param {*} start - start date of the study
   * @param {*} end - end date of the study
   * @param {*} cash - amount of money to use
   */
  constructor({ id, cash, service, portfolio, description }) {
    this.id = id
    this.description = description
    this.originalCash = cash
    this.cash = cash
    this.value = cash // market value
    this.curTick = 0
    this.portfolio = portfolio // array of symbols
    /**
     * holdings looks like this:
     * {
     *   GME: {
     *     shares: 10,
     *     value: 350.50
     *   },
     * .....
     * }
     */
    this.holdings = portfolio.reduce((a, s) => {
      a[s] = {
        shares: 0,
        value: 0,
      }
      return a
    }, {})
    this.queue = [] // array of orders that have not been processed
    this.filledOrders = [] // orders that have been processed
    this.canceledOrders = [] // array orders that have been canceled
    this.service = service // the service object (includes data cache)
  }

  /**
   * Places an order in the queue
   * @param {string} name -  Optional string describing order
   * @param {symbol} symbol - Stock symbol
   * @param {string} direction - BUY or SELL
   * @param {type} type - MARKET, LIMIT, etc...
   * @param {int} shares
   * @param {int} price - price to execute the order
   */
  order({ name, symbol, direction, type, shares, price = undefined }) {
    let priceToSet = price
    // if it is a MARKET order, set the price to the average of the open and close
    if (type === 'MARKET') {
      const data = this.get(this.curTick)
      const { openPrice: open, closePrice: close } = data[symbol][0]
      priceToSet = parseFloat(((open + close) / 2).toFixed(2))
    }

    // makes sure you cant have negative shares.
    const numSharesHolding = this.holdings[symbol].shares
    if (direction === 'SELL' && numSharesHolding < shares) {
      throw new Error(
        `Not enough shares to sell. You currently have ${numSharesHolding} and are trying to SELL ${shares}`
      )
    }

    // create the order
    const order = new Order({
      symbol,
      name,
      placedAt: this.curTick,
      direction,
      type,
      shares,
      price: priceToSet,
    })
    this.queue.push(order)
    return order
  }

  /**
   *
   * @param {string} id - order ID to cancel
   * @returns
   */
  cancelOrder(id) {
    let toCancel = this.queue.filter((order) => order.id === id)
    toCancel.forEach((order) => order.cancel())
    return toCancel
  }

  /**
   * This function expects a high and a low from the Service
   *
   * runs through queue and determines if any of the orders should be executed
   */
  process() {
    const filledOrders = []
    const data = this.service.get(this.curTick)

    /**
     * FILTERS AND PROCESSES THE QUEUE
     * */
    const newQueue = this.queue.filter((order) => {
      const { lowPrice: l, highPrice: h, closePrice: close } = data[
        order.symbol
      ][0]

      // removes canceled orders from the queue
      if (order.status === 'CANCELED') {
        this.canceledOrders.push(order)
        return false
      }

      // conditions to place the order
      if (
        order.type === 'MARKET' ||
        (order.type === 'LIMIT' &&
          order.direction === 'BUY' &&
          order.price <= h &&
          order.price >= l) ||
        (order.type === 'LIMIT' &&
          order.direction === 'SELL' &&
          order.price >= l &&
          order.price <= h)
      ) {
        let delta = order.execute(this.curTick)
        const sharesDelta = (order.direction === 'BUY' ? 1 : -1) * order.shares
        // adjust holdings
        this.holdings[order.symbol].shares += sharesDelta
        // adjust the portfolio cash based off the value of that order
        this.cash += delta
        // add it to the completed orders stack
        this.filledOrders.push(order)
        filledOrders.push(order)
        // return false to filter it from the queue
        return false
      }
      return true
    })

    /**
     * UPDATE HOLDINGS
     */
    for (let s in this.holdings) {
      this.holdings[s].value = this.holdings[s].shares * data[s][0].closePrice
    }

    this.queue = newQueue
    return filledOrders
  }

  get(windowStart, windowEnd) {
    // if nothing is passed, just get the tick
    const start = parseInt(windowStart)
    const end = parseInt(windowEnd)
    if (start < 0) {
      let tempLeft = this.curTick + start
      let left = tempLeft < 0 ? 0 : tempLeft
      let right = left - start
      console.log('vals', tempLeft, left, right)
      return this.service.get(left, right)
    } else if (
      (start === undefined && end === undefined) ||
      (start !== undefined && end === undefined)
    ) {
      return this.service.get(this.curTick, this.curTick + 1)
    } else {
      return this.service.get(windowStart, windowEnd)
    }
  }

  tick() {
    this.curTick += 1
    return this.curTick
  }

  setTick(val) {
    this.curTick = val
    return this.curTick
  }

  getHoldings() {
    return this.holdings
  }

  getOpenOrders() {
    return this.queue
  }

  getFilledOrders() {
    return this.filledOrders
  }

  getPortfolio() {
    return this.portfolio
  }
}

module.exports = Study
