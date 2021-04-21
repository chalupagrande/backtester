const AlpacaService = require('@backtester/services/AlpacaService')
const Backtester = require('../src/Backtester')
const Service = require('../src/Service')
const Study = require('../src/Study')
const { opts, orders } = require('./backtester.options.js')

let BT = null
let Alpaca = null
let id = null
let study = null

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
    Alpaca = new AlpacaService(opts)
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
    expect(study.holdings).toEqual({ GME: 0, TSLA: 0 })
    console.log('STUDY HOLDINGS', study.holdings)
  })

  test('can track ticks', () => {
    let curTick = study.tick()
    expect(curTick).toBe(1)
    expect(study.curTick).toBe(1)
  })

  test('can get data', () => {
    let tick1 = study.get()
    let tick1And2 = study.get(1, 3)
    expect(Object.keys(tick1And2)).toEqual(['GME', 'TSLA'])
    expect(Array.isArray(tick1['GME'])).toBe(true)
    expect(tick1And2['GME'].length).toBe(2)
    expect(tick1['GME'][0].openPrice).toBe(19)
  })

  describe('Orders', () => {
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

    describe('MARKET orders', () => {
      test('can place BUY MARKET order', () => {
        const order = study.order(orders.BUY_MARKET)
        expect(order.price).toBe(18.12)
        expect(
          Object.keys(order).reduce((a, e) => a && targetKeys.includes(e), true)
        ).toBe(true)
        expect(order.direction).toBe('BUY')
        expect(order.type).toBe('MARKET')
        expect(study.queue.length).toBe(1)
      })

      test('can process BUY MARKET order', () => {
        const filledOrders = study.process()
        const order = filledOrders[0]
        expect(filledOrders.length).toBe(1)
        expect(order.filledAt).toBe(1)
        expect(order.status).toBe('COMPLETED')
        expect(order.value).toBe(-90.6)
        expect(study.filledOrders.length).toBe(1)
        expect(study.queue.length).toBe(0)
        expect(study.cash).toBe(909.4)
        expect(study.holdings['GME']).toBe(5)
      })

      test('can place SELL MARKET order', () => {
        const order = study.order(orders.SELL_MARKET)
        expect(order.price).toBe(18.12)
        expect(order.price).toBe(18.12)
        expect(order.value).toBe(90.6)
        expect(order.direction).toBe('SELL')
        expect(order.type).toBe('MARKET')
        expect(study.queue.length).toBe(1)
      })

      test('can process SELL MARKET order', () => {
        const filledOrders = study.process()
        const order = filledOrders[0]
        expect(filledOrders.length).toBe(1)
        expect(order.filledAt).toBe(1)
        expect(order.status).toBe('COMPLETED')
        expect(study.filledOrders.length).toBe(2)
        expect(study.queue.length).toBe(0)
        expect(study.cash).toBe(1000)
        expect(study.holdings['GME']).toBe(0)
      })
    })

    describe('LIMIT orders', () => {
      beforeAll(() => {
        study.tick()
      })

      test('can place BUY LIMIT order', () => {
        const order = study.order(orders.BUY_LIMIT)
        expect(order.price).toBe(18.5)
        expect(order.placedAt).toBe(2)
        expect(order.direction).toBe('BUY')
        expect(order.type).toBe('LIMIT')
        expect(study.queue.length).toBe(1)
      })

      test('can place SELL LIMIT order', () => {
        const order = study.order(orders.SELL_LIMIT)
        expect(order.price).toBe(23)
        expect(order.value).toBe(115)
        expect(order.direction).toBe('SELL')
        expect(order.type).toBe('LIMIT')
        expect(order.placedAt).toBe(2)
        expect(study.queue.length).toBe(2)
        expect(study.filledOrders.length).toBe(2)
      })

      test('LIMIT ORDERS will not fill if price is not met', () => {
        const filledOrders = study.process()
        const order = filledOrders[0]
        expect(filledOrders.length).toBe(0)
        expect(order).toBeFalsy()
        expect(study.filledOrders.length).toBe(2)
        // both buy and sell limit orders have not posted
        expect(study.queue.length).toBe(2)
        expect(study.cash).toBe(1000)
        expect(study.holdings['GME']).toBe(0)
      })

      test('BUY LIMIT will post when price is met, and study is processed', () => {
        study.tick()
        const filledOrders = study.process()
        expect(filledOrders.length).toBe(1)
        const order = filledOrders[0]
        expect(order.price).toBe(18.5)
        expect(order.status).toBe('COMPLETED')
        expect(order.placedAt).toBe(2)
        expect(order.filledAt).toBe(3)
        expect(order.value).toBe(-92.5)
        expect(study.holdings['GME']).toBe(5)
        expect(study.cash).toBe(907.5)
        // the sell order remains
        expect(study.queue.length).toBe(1)
        expect(study.filledOrders.length).toBe(3)
      })

      test('SELL LIMIT will post when price is met, and study is processed', () => {
        ;[1, 2, 3, 4].forEach(() => {
          study.tick()
          study.process()
        })
        expect(study.queue.length).toBe(1)
        expect(study.filledOrders.length).toBe(3)
        expect(study.holdings['GME']).toBe(5)
        study.tick()
        const filledOrders = study.process()
        const order = filledOrders[0]

        expect(filledOrders.length).toBe(1)
        expect(study.filledOrders.length).toBe(4)
        expect(order.filledAt).toBe(8)
        expect(study.queue.length).toBe(0)
        expect(study.cash).toBe(1022.5)
        expect(order.status).toBe('COMPLETED')
        expect(study.holdings['GME']).toBe(0)
      })
    })

    test('can cancel an order', () => {
      const order = study.order(orders.ORDER_TO_CANCEL)
      expect(order.price).toBe(100)
      study.tick()
      expect(study.queue.length).toBe(1)
      expect(order.status).toBe('PENDING')
      study.cancelOrder(order.id)
      study.process()
      expect(study.cash).toBe(1022.5)
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

  test('original cash remains unchanged after orders', () => {
    expect(study.originalCash).toBe(1000)
  })

  test('study should track filled orders', () => {
    expect(study.filledOrders.length).toBe(4)
  })
})
