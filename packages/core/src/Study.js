const Order = require('./Order')
class Study {
  /**
   *
   * @param {string} id - ID to use for the study
   * @param {*} start - start date of the study
   * @param {*} end - end date of the study
   * @param {*} cash - amount of money to use
   */
  constructor({ id, cash, service, portfolio }) {
    this.id = id
    this.originalCash = cash
    this.cash = cash
    this.queue = []
    this.filledOrders = []
    this.canceledOrders = []
    this.curTick = 0
    this.service = service
    this.holdings = portfolio.reduce((a, s) => {
      a[s] = 0
      return a
    }, {})
  }

  /**
   * Places an order in the queue
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

  cancelOrder(id) {
    let toCancel = this.queue.filter((order) => order.id === id)
    toCancel.forEach((order) => order.cancel())
  }

  /**
   * This function expects a high and a low from the Service
   *
   * runs through queue and determines if any of the orders should be executed
   */
  process() {
    const filledOrders = []
    const newQueue = this.queue.filter((order) => {
      const data = this.service.get(this.curTick)
      // TODO: Add check to ensure you have shares to sell
      const { lowPrice: l, highPrice: h } = data[order.symbol][0]

      // removes canceled orders from the queue
      if (order.status === 'CANCELED') {
        this.canceledOrders.push(order)
        return false
      }

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
        this.holdings[order.symbol] += sharesDelta

        // adjust the porfolio value based off the value of that order
        this.cash += delta
        // add it to the completed orders stack
        this.filledOrders.push(order)
        filledOrders.push(order)
        // return false to filter it from the queue
        return false
      }
      return true
    })
    this.queue = newQueue
    return filledOrders
  }

  get(start, end) {
    // if nothing is passed, just get the tick
    if (
      (start === undefined && end === undefined) ||
      (start !== undefined && end === undefined)
    ) {
      return this.service.get(this.curTick, this.curTick + 1)
    } else {
      return this.service.get(start, end)
    }
  }

  tick() {
    this.curTick += 1
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
}

module.exports = Study
