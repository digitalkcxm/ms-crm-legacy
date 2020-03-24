const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

const { truncateCustomer } = require('../utils/customer')

const companyToken = 'b61a6d542f9036550ba9c401c80f00ef'

describe('CRUD Customer', () => {
  beforeEach(async () => {
    await truncateCustomer()
  })

  it('Create Single Customer', async (done) => {
    const newCustomer = {
      customer_cpfcnpj: '11401316646',
      customer_name: 'Silas',
      prefix_index_elastic: 'test'
    }
    request
      .post('/api/v1/customer')
      .send(newCustomer)
      .set('Accept', 'application/json')
      .set('token', companyToken)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('customer_cpfcnpj')
        expect(res.body).toHaveProperty('customer_name')
        expect(res.body).toHaveProperty('prefix_index_elastic')
        done()
      })
  })

  it('Should to return customer by cpf', async(done) => {
    const newCustomer = {
      customer_cpfcnpj: '11401316646',
      customer_name: 'Silas',
      prefix_index_elastic: 'test'
    }
    await request
      .post('/api/v1/customer')
      .send(newCustomer)
      .set('Accept', 'application/json')
      .set('token', companyToken)

    request
      .get(`/api/v1/customers?cpfcnpj=${newCustomer.customer_cpfcnpj}`)
      .set('Accept', 'application/json')
      .set('token', companyToken)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.statusCode).toBe(200)
        expect(res.body.cpfcnpj).toBe(newCustomer.customer_cpfcnpj)
        expect(res.body.name).toBe(newCustomer.customer_name)
        expect(res.body).toHaveProperty('email')
        expect(res.body).toHaveProperty('phone')
        expect(res.body).toHaveProperty('address')
        expect(res.body).toHaveProperty('vehicle')
        expect(res.body).toHaveProperty('business_partner')
        done()
      })
  })
})