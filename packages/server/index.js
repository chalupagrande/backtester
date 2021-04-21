require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const AlpacaService = require('@backtester/services/AlpacaService')
const Backtester = require('@backtester/core/src/Backtester')

const BT = new Backtester()

app.use(express.json())

app.get('/', (req, res) => res.send('ok'))

// creates an alpaca study instance
app.post('/alpaca', (req, res) => {
  const { start, end, cash, inc, portfolio } = req.body
  const Alpaca = new AlpacaService({ start, end, inc, portfolio })
  Alpaca.fetch()
  const id = BT.prepare({ cash, service: Alpaca, portfolio })
  res.send({ msg: 'Study prepared', data: { id } })
})

// gets the data from a study with specific intervals.
app.post('/data/:id', (req, res) => {
  const { id } = req.params
  const { start, end } = req.body
  const data = BT.getStudy(id).get(start, end)
  res.send({ msg: 'Success', data, id })
})

// gets the data from a study with at the current tick
app.get('/data/:id', (req, res) => {
  const { id } = req.params
  const data = BT.getStudy(id).get()
  res.send({ msg: 'Success', data, id })
})

// increment the tick on the study
app.get('/tick/:id', (req, res) => {
  const { id } = req.params
  const data = BT.getStudy(id).tick()
  res.send({ msg: 'Success', data, id })
})

// place an order
app.post('/order/:id', (req, res) => {
  const { id } = req.params
  const { direction, type, shares, price, symbol } = req.body
  const order = BT.getStudy(id).order({
    direction,
    type,
    shares,
    price,
    symbol,
  })
  res.send({ msg: 'Success', data: { order }, id })
})

// process the orders
app.get('/process/:id', (req, res) => {
  const { id } = req.params
  const filledOrders = BT.getStudy(id).process()
  res.send({ msg: 'Success', data: { filledOrders } })
})

// get a specific study
app.get('/study/:id', (req, res) => {
  const { id } = req.params
  res.send(BT.studies[id])
})

// get everything in the backtester
app.get('/all', (req, res) => {
  res.send(BT)
})

app.listen(PORT, () => console.log(`Backtester listening on ${PORT}`))
