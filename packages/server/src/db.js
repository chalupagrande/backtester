const Sequelize = require('sequelize')

const username = process.env.POSTGRES_USER
const password = process.env.POSTGRES_PASSWORD
const dbName = process.env.POSTGRES_DB
const dbPort = process.env.POSTGRES_PORT

// use @database here because that is the name of the serive outlined in the docker.yml
const connectionString = `postgres://${username}:${password}@database:${dbPort}/${dbName}`
const sequelize = new Sequelize(connectionString)

async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

setTimeout(testConnection, 10000)

module.exports = sequelize
