const Sequelize = require('sequelize')

function connect() {
  return new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: 'postgres'
  })
}

module.exports = { connect }