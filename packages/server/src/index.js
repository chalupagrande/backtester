const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
})
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const AlpacaService = require('@backtester/services/AlpacaService')
const Backtester = require('@backtester/core/src/Backtester')
// const db = require('./db')
const { Response } = require('./utils')

const BT = new Backtester()

app.use(express.json())

app.get('/', (req, res) => res.send('ok'))

// creates an alpaca study instance
app.post('/alpaca', async (req, res) => {
  const { start, end, cash, inc, portfolio, description } = req.body
  const Alpaca = new AlpacaService({
    start,
    end,
    inc,
    portfolio,
    alpacaId: process.env.ALPACA_API_KEY_ID,
    alpacaSecret: process.env.ALPACA_API_SECRET_KEY,
  })
  await Alpaca.fetch()
  const id = BT.prepare({ cash, service: Alpaca, portfolio, description })
  res.send(new Response(true, { study: id }, 'Service created'))
})

// get everything in the backtester
app.get('/all', (req, res) => {
  let d = BT.all()
  res.send(new Response(true, d))
})

// get a specific study
app.get('/study/:id', (req, res) => {
  const { id } = req.params
  const study = BT.studies[id]
  res.send(new Response(true, study))
})

// delete a specific study
app.delete('/study/:id', (req, res) => {
  let { id } = req.params
  if (!BT.getStudy(id)) {
    res.send(new Response(false, null, 'Study not found'))
  } else {
    delete BT.clear(id)
    res.send(new Response(true, { study: id }, 'Study deleted'))
  }
})

// gets the data from a study with specific intervals.
app.get('/study/:id/data', (req, res) => {
  const { id } = req.params
  const { start, end, prev } = req.query
  const data = BT.getStudy(id).get(-prev || start, end)
  res.send(new Response(true, data))
})

// reset all orders, filled orders, queue, and cash (does not refetch)
app.get('/study/:id/reset', (req, res) => {
  const { id } = req.params
  BT.getStudy(id).reset()
  res.send(new Response(true))
})

// get the current tick
app.get('/study/:id/tick', (req, res) => {
  const { id } = req.params
  const curTick = BT.getStudy(id).curTick
  res.send(new Response(true, curTick))
})

// increment the tick on the study
app.put('/study/:id/tick', (req, res) => {
  const { id } = req.params
  const data = BT.getStudy(id).tick()
  res.send(new Response(true, data))
})

// set tick
app.post('/study/:id/tick', (req, res) => {
  const { id } = req.params
  const { tick } = req.body
  let newTick = BT.getStudy(id).setTick(tick)
  res.send(new Response(true, newTick))
})

// place an order
app.post('/study/:id/order', (req, res) => {
  const { id } = req.params
  try {
    const { direction, type, shares, price, symbol } = req.body
    const order = BT.getStudy(id).order({
      direction,
      type,
      shares,
      price,
      symbol,
    })
    res.send(new Response(true, order))
  } catch (err) {
    res.send(new Response(false, err, 'Order not placed', [err.message]))
  }
})

// cancel order
app.delete('/study/:id/order/:orderId', (req, res) => {
  const { id, orderId } = req.params
  const orders = BT.getStudy(id).cancelOrder(orderId)
  res.send(new Response(true, orders))
})

// get open orders
app.get('/study/:id/orders', (req, res) => {
  const { id } = req.params
  let open = BT.getStudy(id).getOpenOrders()
  let filled = BT.getStudy(id).getFilledOrders()
  res.send(new Response(true, { open, filled }))
})

// process the orders
app.get('/study/:id/process', (req, res) => {
  const { id } = req.params
  const filledOrders = BT.getStudy(id).process()
  res.send(
    new Response(
      true,
      { filledOrders },
      `Study processed for tick: ${BT.getStudy(id).curTick} `
    )
  )
})

// get Holdings
app.get('/study/:id/holdings', (req, res) => {
  const { id } = req.params
  let holdings = BT.getStudy(id).getHoldings()
  res.send(new Response(true, holdings))
})

app.get('/study/:id/portfolio', (req, res) => {
  const { id } = req.params
  let portfolio = BT.getStudy(id).getPortfolio()
  res.send(new Response(true, portfolio))
})

app.get('/study/:id/service', (req, res) => {
  const { id } = req.params
  let service = BT.getStudy(id).service
  res.send(new Response(true, service))
})

app.listen(PORT, () => console.log(`Backtester listening on ${PORT}`))
