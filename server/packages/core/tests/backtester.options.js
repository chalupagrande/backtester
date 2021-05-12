const opts = {
  start: '2021-01-01T00:00:00Z',
  end: '2021-03-31T23:59:59Z',
  cash: 1000,
  inc: 'DAY',
  portfolio: ['GME', 'TSLA'],
}

const orders = {
  BUY_MARKET: {
    direction: 'BUY',
    type: 'MARKET',
    shares: 5,
    symbol: 'GME',
  },
  SELL_MARKET: {
    direction: 'SELL',
    type: 'MARKET',
    shares: 5,
    symbol: 'GME',
  },
  BUY_LIMIT: {
    direction: 'BUY',
    type: 'LIMIT',
    shares: 5,
    symbol: 'GME',
    price: 18.5,
  },
  SELL_LIMIT: {
    direction: 'SELL',
    type: 'LIMIT',
    shares: 5,
    symbol: 'GME',
    price: 23,
  },
  ORDER_TO_CANCEL: {
    direction: 'BUY',
    type: 'LIMIT',
    shares: 10,
    symbol: 'GME',
    price: 100,
  },
}

module.exports = { opts, orders }
