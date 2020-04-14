const moment = require('moment')
const nock = require('nock')
const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

const Customer = require('../../src/models/customer')
const customerModel = new Customer()

const { truncateCustomer } = require('../utils/customer')

const companyToken = 'b61a6d542f9036550ba9c401c80f00eb'
const defaultCPF = '38686682170'
let defaultCustomerId = 4

async function createCustomer(customerId = 0, customer = {}) {
    return new Promise((resolve, reject) => {
      const elasticIndex = customer.prefix_index_elastic
      const newDate = moment(new Date()).format('YYYYMM')
        
      nock('http://localhost:9200')
        .intercept('\/' + `${elasticIndex}-crm-${newDate}/customer/${customerId}`, 'OPTIONS')
        .reply(200, '', {'Access-Control-Allow-Origin': '*'})
        .put('\/' + `${elasticIndex}-crm-${newDate}/customer/${customerId}`)
        .reply(200, '', {'Access-Control-Allow-Origin': '*'})
  
      request
        .post('/api/v1/customer')
        .send(customer)
        .set('Accept', 'application/json')
        .set('token', companyToken)
        .end((err) => {
          if (err) resolve()
          resolve()
        })
    })
}

describe('CRUD Customer Email', () => {
    beforeAll(async () => {
      await createCustomer(defaultCustomerId, { customer_cpfcnpj: defaultCPF, prefix_index_elastic: 'test-prefix' })
      // defaultCustomerId = await customerModel.create({ id: 1000, cpfcnpj: defaultCPF, company_token: companyToken })
    })
    afterAll(async () => {
      // await truncateCustomer()
    })

    it('Should to create an email', async (done) => {
        const email = { email: 'email@test.com' }
        request.post(`/api/v1/customers/${defaultCustomerId}/emails`)
            .set('token', companyToken)
            .send(email)
            .end((err, res) => {
                if (err) done(err)

                expect(res.statusCode).toBe(201)
                done()
            })
    })
})