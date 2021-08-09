const mongoose = require('mongoose')
const Order = require('./Order')
const StudySchema = new mongoose.Schema({
  id: String,
  description: String,
  originalCash: Number,
  cash: Number,
  value: Number,
  curTick: Number,
  portfolio: [String],
  queue: [Order],
  filledOrders: [Order],
  canceledOrders: [Order],
})

module.exports = mongoose.model('Study', StudySchema)
