const moment = require('moment')
const nock = require('nock')
const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

const Customer = require('../../src/models/customer')
const customerModel = new Customer()

const PhoneModel = require('../../src/models/phone')
const phoneModel = new PhoneModel()

const { truncateCustomer } = require('../utils/customer')

const companyToken = 'b61a6d542f9036550ba9c401c80f00eb'
const defaultCPF = '38686682171'
let defaultCustomerId = 4

const defaultPhone = { number: '5511912349876', type: 'celular' }

async function createCustomer(customerId = 0, customer = {}) {
  return new Promise((resolve, reject) => {
    request
      .post('/api/v1/customer')
      .send(customer)
      .set('Accept', 'application/json')
      .set('token', companyToken)
      .end((err, res) => {
        if (err) reject()

        defaultCustomerId = res.body.customer_id

        resolve()
      })
  })
}

describe('CRUD Customer Phone', () => {
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

        done()
      })
  })

  // it('Should to update an phone by id', async (done) => {

  //   const phoneCreated = await phoneModel.createOrUpdate(defaultCustomerId, { number: '11900001111', type: 'casa' })
  //   console.log('created', defaultCustomerId, phoneCreated)
  //   const phoneUpdated = { number: '912346780234', type: 'residencial' }
  //   request.put(`/api/v1/customers/${defaultCustomerId}/phones/${phoneCreated.id}`)
  //     .set('company_token', companyToken)
  //     .send(phoneUpdated)
  //     .end((err, res) => {
  //       console.log(err)
  //       console.log(res.body)
  //       if (err) done(err)

  //       expect(res.statusCode).toBe(200)
  //       expect(res.body.id).toBe(6)
  //       expect(res.body.number).toBe(phoneUpdated.number)
  //       expect(res.body.type).toBe(phoneUpdated.type)

  //       done()
  //     })
  // })
})