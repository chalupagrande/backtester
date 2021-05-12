const { uuid } = require('@backtester/tools/utils')
class Order {
  /**
   * @param {string} direction - BUY or SELL
   * @param {type} type - MARKET, LIMIT, etc...
   * @param {int} shares - number of shares
   * @param {int} price - price to execute the order
   */
  constructor({
    symbol,
    direction,
    type,
    shares,
    price,
    placedAt,
    name,
    status = 'PENDING',
  }) {
    this.id = uuid()
    this.name = name
    this.placedAt = placedAt //tick number
    this.filledAt = null
    this.symbol = symbol
    this.direction = direction
    this.type = type
    this.shares = shares
    this.price = price
    this.status = status // PENDING or COMPLETED
    this.value = parseFloat(
      ((direction === 'BUY' ? -1 : 1) * price * shares).toFixed(2)
    )
  }

  /**
   *
   * @param {Int} tick - TICK value that the order was executed at
   * @returns - The value to + to your previous portfolio balance to account for the
   *            execution of this order.
   */
  execute(tick) {
    this.status = 'COMPLETED'
    this.filledAt = tick
    return this.value
  }

  cancel() {
    this.status = 'CANCELED'
    return this.status
  }
}
module.exports = Order
