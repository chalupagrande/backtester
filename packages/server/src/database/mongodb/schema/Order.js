const mongoose = require('mongoose')
const OrderSchema = new mongoose.Schema({
  id: String,
  name: String,
  placedAt: Number,
  filledAt: Number,
  symbol: String,
  direction: String,
  type: String,
  shares: Number,
  price: Number,
  status: String,
  value: Number,
})

module.exports = OrderSchema
