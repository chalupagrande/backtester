const Sequelize = require('sequelize')

const username = process.env.POSTGRES_USER
const password = process.env.POSTGRES_PASSWORD
const dbName = process.env.POSTGRES_DB
const dbPort = process.env.POSTGRES_PORT

console.log('POSTGRESS STYFF', username, password, dbName, dbPort)

const connectionString = `postgres://${username}:${password}@database:${dbPort}/${dbName}`
const sequelize = new Sequelize(connectionString)

// const sequelize = new Sequelize(
//   process.env.POSTGRES_DB,
//   process.env.POSTGRES_USER,
//   process.env.POSTGRES_PASSWORD,
//   {
//     host: 'database',
//     dialect: 'postgres',
//   }
// )

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
