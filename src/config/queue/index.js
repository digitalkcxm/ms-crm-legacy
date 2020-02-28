const Queue = require('bull')

const customerService = require('../../services/customer-service')

const persistQueue = new Queue('persist customer')

function processPersistQueue() {
  persistQueue.process(async ({ data }, done) => {
    console.log('aaaaa')
    console.log(customerService)
    await customerService.persistCustomer(data.customer, data.businessId, data.businessTemplateId, data.listKeyFields, data.prefixIndexElastic)
    done()
  })
}

module.exports = { persistQueue, processPersistQueue }