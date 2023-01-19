const RabbitMQ = require('./rabbitmq')

const customerService = require('../services/customer-service')

async function startConsumersQueues() {
  const connRabbit = await RabbitMQ.newConnection()
  RabbitMQ.addConsumer(customerService.processCustomer)

  RabbitMQ.startConsumers(connRabbit)
}

module.exports = startConsumersQueues
