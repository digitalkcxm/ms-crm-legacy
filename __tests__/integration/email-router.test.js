const moment = require('moment')
const nock = require('nock')
const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

const Email = require('../../src/models/email')
const emailModel = new Email()

const companyToken = 'b61a6d542f9036550ba9c401c80f00eb'
const defaultCPF = '38686682170'
let defaultCustomerId = 4

const defaultEmail = { email: 'email@test.com' }

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

describe('CRUD Customer Email', () => {
    beforeAll(async () => {
      await createCustomer(defaultCustomerId, { customer_cpfcnpj: defaultCPF, prefix_index_elastic: 'test-prefix' })
    })
    
    it('Should to create an email', async (done) => {
        request.post(`/api/v1/customers/${defaultCustomerId}/emails`)
            .set('token', companyToken)
            .send(defaultEmail)
            .end((err, res) => {
                if (err) done(err)

                expect(res.statusCode).toBe(201)
                done()
            })
    })

    it('Should to list emails by customer', done => {
      request.get(`/api/v1/customers/${defaultCustomerId}/emails`)
        .set('token', companyToken)
        .end((err, res) => {
          if (err) done(err)

          expect(res.statusCode).toBe(200)
          expect(res.body[0]).toHaveProperty('id')
          expect(res.body[0]).toHaveProperty('email')

          done()
        })
    })

    it('Should to update an email by id', async (done) => {
      const emailId = await emailModel.create(defaultCustomerId, 'teste1@test.com')
      request.put(`/api/v1/customers/${defaultCustomerId}/emails/${emailId}`)
          .set('token', companyToken)
          .send({ email: 'teste1-updated@email.com' })
          .end((err, res) => {
              if (err) done(err)

              expect(res.statusCode).toBe(200)
              expect(res.body.id).toBe(emailId)
              expect(res.body.email).toBe('teste1-updated@email.com')

              done()
          })
  })
})