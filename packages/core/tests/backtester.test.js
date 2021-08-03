const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
})
const AlpacaService = require('@backtester/services/AlpacaService')
const Backtester = require('../src/Backtester')
const Service = require('../src/Service')
const Study = require('../src/Study')
const { opts, orders } = require('./backtester.options.js')

const targetKeys = [
  'id',
  'name',
  'placedAt',
  'filledAt',
  'symbol',
  'direction',
  'type',
  'shares',
  'price',
  'status',
  'value',
]

let BT = null
let Alpaca = null
let id = null
let study = null

const alpacaOptions = {
  ...opts,
  alpacaId: process.env.ALPACA_API_KEY_ID,
  alpacaSecret: process.env.ALPACA_API_SECRET_KEY,
}

describe('Backtester', () => {
  beforeAll(() => {
    BT = new Backtester()
  })
  test('created instance', () => {
    expect(BT instanceof Backtester).toBe(true)
  })
})

describe('Services', () => {
  beforeAll(() => {
    Alpaca = new AlpacaService(alpacaOptions)
  })

  test('created instance', () => {
    expect(Alpaca instanceof Service).toBe(true)
  })

  test('can fetch, and set length', () => {
    return Alpaca.fetch().then(() => {
      expect(Object.keys(Alpaca.data)).toEqual([...opts.portfolio])
      expect(Alpaca.length).toBe(62)
    })
  })
})

describe('Studies', () => {
  beforeAll(() => {
    id = BT.prepare({
      cash: opts.cash,
      service: Alpaca,
      portfolio: opts.portfolio,
    })
    study = BT.getStudy(id)
  })

  beforeEach(() => {
    study.reset()
  })

  test('can create Study', () => {
    expect(study instanceof Study).toBe(true)
  })

  test('has correct properties', () => {
    expect(study.cash).toBe(1000)
    expect(study.originalCash).toBe(1000)
    expect(Array.isArray(study.queue)).toBe(true)
    expect(Array.isArray(study.filledOrders)).toBe(true)
    expect(study.curTick).toBe(0)
    expect(study.service instanceof AlpacaService).toBe(true)
    expect(Object.keys(study.holdings)).toEqual(['GME', 'TSLA'])
    expect(study.holdings['GME']).toEqual({
      shares: 0,
      value: 0,
    })
    console.log('STUDY HOLDINGS', study.holdings)
  })

  test('can track ticks', () => {
    let curTick = study.tick()
    expect(curTick).toBe(1)
    expect(study.curTick).toBe(1)
  })

  test('can get data', () => {
    expect(study.curTick).toBe(0)
    study.tick()
    expect(study.curTick).toBe(1)
    let tick1 = study.get()
    let tick1And2 = study.get(1, 3)
    expect(Object.keys(tick1And2)).toEqual(['GME', 'TSLA'])
    expect(Array.isArray(tick1['GME'])).toBe(true)
    expect(tick1And2['GME'].length).toBe(2)
    expect(tick1['GME'][0].openPrice).toBe(19)
  })

  test('original cash remains unchanged after orders', () => {
    expect(study.originalCash).toBe(1000)
  })

  test('study should track filled orders', () => {
    expect(study.curTick).toBe(0)
    expect(study.filledOrders.length).toBe(0)
    const order = study.order(orders.BUY_MARKET)
    expect(study.filledOrders.length).toBe(0)
    study.process()
    expect(study.filledOrders.length).toBe(1)
  })

  test('holdings changes value with the ticks', () => {
    expect(study.curTick).toBe(0)
    expect(study.holdings['GME'].shares).toBe(0)
    let order = study.order(orders.BUY_MARKET)
    study.process()
    expect(study.holdings['GME'].shares).toBe(5)
    expect(study.holdings['GME'].value).toBe(94.05)
    study.tick()
    study.process()
    study.tick()
    study.process()
    expect(study.holdings['GME'].value).toBe(86.8)
    study.tick()
    study.process()
    expect(study.holdings['GME'].value).toBe(91.95)
  })
})

describe('Orders', () => {
  beforeAll(() => {
    study.reset()
  })

  test('can cancel an order', () => {
    const order = study.order(orders.ORDER_TO_CANCEL)
    expect(order.price).toBe(100)
    study.tick()
    expect(study.queue.length).toBe(1)
    expect(order.status).toBe('PENDING')
    study.cancelOrder(order.id)
    study.process()
    expect(study.cash).toBe(1000)
    expect(study.queue.length).toBe(0)
    expect(study.canceledOrders.length).toBe(1)
  })

  test('can give an order a name', () => {
    const order = study.order({
      ...orders.ORDER_TO_CANCEL,
      name: 'TEST ORDER TO CANCEL',
    })
    expect(order.name).toBe('TEST ORDER TO CANCEL')
    study.cancelOrder(order.id)
    study.process()
  })
})

describe('MARKET orders', () => {
  beforeEach(() => {
    study.reset()
  })

  test('can place BUY MARKET order', () => {
    expect(study.curTick).toBe(0)
    const order = study.order(orders.BUY_MARKET)
    expect(order.price).toBe(19.03)
    expect(
      Object.keys(order).reduce((a, e) => a && targetKeys.includes(e), true)
    ).toBe(true)
    expect(order.direction).toBe('BUY')
    expect(order.type).toBe('MARKET')
    expect(study.queue.length).toBe(1)
  })

  test('can process BUY MARKET order', () => {
    study.order(orders.BUY_MARKET)
    const filledOrders = study.process()
    const order = filledOrders[0]
    expect(filledOrders.length).toBe(1)
    expect(order.filledAt).toBe(0)
    expect(order.status).toBe('COMPLETED')
    expect(order.value).toBe(-95.15)
    expect(study.filledOrders.length).toBe(1)
    expect(study.queue.length).toBe(0)
    expect(study.cash).toBe(904.85)
    expect(study.holdings['GME'].shares).toBe(5)
    expect(parseFloat(study.holdings['GME'].value.toFixed(2))).toBe(94.05)
  })

  test('can place SELL MARKET order', () => {
    // have to place a buy order in order to have enough shares to sell
    study.order(orders.BUY_MARKET)
    study.process()

    const order = study.order(orders.SELL_MARKET)
    expect(order.price).toBe(19.03)
    expect(order.value).toBe(95.15)
    expect(order.direction).toBe('SELL')
    expect(order.type).toBe('MARKET')
    expect(study.queue.length).toBe(1)
  })

  test('can process SELL MARKET order', () => {
    // have to place a buy order in order to have enough shares to sell
    study.order(orders.BUY_MARKET)
    study.process()

    const order = study.order(orders.SELL_MARKET)
    const filledOrders = study.process()

    expect(filledOrders.length).toBe(1)
    expect(study.filledOrders.length).toBe(2)
    study.process()
    expect(filledOrders.length).toBe(1)
    expect(order.filledAt).toBe(0)
    expect(order.status).toBe('COMPLETED')
    expect(study.filledOrders.length).toBe(2)
    expect(study.queue.length).toBe(0)
    expect(study.cash).toBe(1000)
    expect(study.holdings['GME'].shares).toBe(0)
  })
})

describe('LIMIT orders', () => {
  beforeAll(() => {
    study.reset()
  })

  test('can place BUY LIMIT order', () => {
    const order = study.order(orders.BUY_LIMIT)
    expect(order.price).toBe(17.2)
    expect(order.placedAt).toBe(0)
    expect(order.direction).toBe('BUY')
    expect(order.type).toBe('LIMIT')
    expect(study.queue.length).toBe(1)
  })

  test('LIMIT ORDERS will not fill if price is not met', () => {
    const filledOrders = study.process()
    const order = filledOrders[0]
    expect(order).toBeFalsy()
    expect(study.filledOrders.length).toBe(0)
    // both buy and sell limit orders have not posted
    expect(study.queue.length).toBe(1)
    expect(study.cash).toBe(1000)
    expect(study.holdings['GME'].shares).toBe(0)
  })

  test('BUY LIMIT will post when price is met, and study is processed', () => {
    study.tick()
    const filledOrders = study.process()
    expect(filledOrders.length).toBe(1)
    const order = filledOrders[0]
    expect(order.price).toBe(17.2)
    expect(order.status).toBe('COMPLETED')
    expect(order.placedAt).toBe(0)
    expect(order.filledAt).toBe(1)
    expect(order.value).toBe(-86)
    expect(study.holdings['GME'].shares).toBe(5)
    expect(study.cash).toBe(914)
    expect(study.filledOrders.length).toBe(1)
  })

  test('can place SELL LIMIT order', () => {
    study.tick()
    const order = study.order(orders.SELL_LIMIT)
    expect(order.price).toBe(23)
    expect(order.value).toBe(115)
    expect(order.direction).toBe('SELL')
    expect(order.type).toBe('LIMIT')
    expect(order.placedAt).toBe(2)
    expect(study.queue.length).toBe(1)
    expect(study.filledOrders.length).toBe(1) // the buy order remains
  })

  test('SELL LIMIT will post when price is met, and study is processed', () => {
    expect(study.curTick).toBe(2)
    ;[3, 4, 5, 6, 7].forEach(() => {
      study.tick()
      study.process()
    })
    expect(study.queue.length).toBe(1)
    expect(study.filledOrders.length).toBe(1) // buy order remains
    expect(study.holdings['GME'].shares).toBe(5)

    study.tick()
    const filledOrders = study.process()

    const order = filledOrders[0]

    expect(filledOrders.length).toBe(1)
    expect(study.filledOrders.length).toBe(2)
    expect(order.filledAt).toBe(8)
    expect(study.queue.length).toBe(0)
    expect(study.cash).toBe(1029)
    expect(order.status).toBe('COMPLETED')
    expect(study.holdings['GME'].shares).toBe(0)
  })
})
