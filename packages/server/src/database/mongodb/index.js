const mongoose = require('mongoose')
const connection = mongoose.connect(
  `mongodb://localhost:27017/${process.env.MONGO_DB_NAME}`,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) console.log('\n\nERROR: \n', err)
    else console.log(`Connected to MongodDB: ${process.env.MONGO_DB_NAME}`)
  }
)

module.exports = connection
