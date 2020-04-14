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

const defaultPhone = { number: '912349876', type: 'celular' }

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
    })
    
    it('Should to create an phone', async (done) => {
        request.post(`/api/v1/customers/${defaultCustomerId}/phones`)
            .set('token', companyToken)
            .send(defaultPhone)
            .end((err, res) => {
                if (err) done(err)

                expect(res.statusCode).toBe(201)
                done()
            })
    })

    it('Should to list phones by customer', done => {
      request.get(`/api/v1/customers/${defaultCustomerId}/phones`)
        .set('token', companyToken)
        .end((err, res) => {
          if (err) done(err)

          expect(res.statusCode).toBe(200)
          expect(res.body[0]).toHaveProperty('id')
          expect(res.body[0]).toHaveProperty('number')
          expect(res.body[0]).toHaveProperty('type')

          done()
        })
    })

    it('Should to update an phone by id', async (done) => {
        const phoneUpdated = { number: '912346780234', type: 'residencial' }
      request.put(`/api/v1/customers/${defaultCustomerId}/phones/6`)
          .set('token', companyToken)
          .send(phoneUpdated)
          .end((err, res) => {
              if (err) done(err)

              expect(res.statusCode).toBe(200)
              expect(res.body.id).toBe(6)
              expect(res.body.number).toBe(phoneUpdated.number)
              expect(res.body.type).toBe(phoneUpdated.type)

              done()
          })
  })
})