const moment = require('moment')
const nock = require('nock')
const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

const companyToken = 'b61a6d542f9036550ba9c401c80f00eb'
const defaultCPF = '38686682170'
let defaultCustomerId = 4

const defaultBusinessPartner = {
  cnpj: '45066368000190',
  fantasy_name: 'Corp Test',
  foundation_date: '01/01/2000',
  status: 'ATIVO'
}

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

describe('CRUD Customer Business Partner', () => {
    beforeAll(async () => {
      await createCustomer(defaultCustomerId, { customer_cpfcnpj: defaultCPF, prefix_index_elastic: 'test-prefix' })
    })
    
    it('Should to create an vehicle', async (done) => {
      request.post(`/api/v1/customers/${defaultCustomerId}/business_partners`)
        .set('token', companyToken)
        .send(defaultBusinessPartner)
        .end((err, res) => {
          if (err) done(err)

          expect(res.statusCode).toBe(201)
          done()
        })
    })

    it('Should to list business partners by customer', done => {
      request.get(`/api/v1/customers/${defaultCustomerId}/business_partners`)
        .set('token', companyToken)
        .end((err, res) => {
          if (err) done(err)

          expect(res.statusCode).toBe(200)
          expect(res.body[0]).toHaveProperty('id')
          expect(res.body[0]).toHaveProperty('cnpj')
          expect(res.body[0]).toHaveProperty('fantasy_name')
          expect(res.body[0]).toHaveProperty('foundation_date')
          expect(res.body[0]).toHaveProperty('status')

          done()
        })
    })

    it('Should to update an business partner by id', async (done) => {
      const updatedBusinessPartner = {
        cnpj: '45066368000191',
        fantasy_name: 'Corp Test - Updated',
        foundation_date: '01/01/2001',
        status: 'INATIVO'
      }
      request.put(`/api/v1/customers/${defaultCustomerId}/business_partners/6`)
        .set('token', companyToken)
        .send(updatedBusinessPartner)
        .end((err, res) => {
          if (err) done(err)

          expect(res.statusCode).toBe(200)
          expect(res.body.id).toBe(6)
          expect(res.body.cnpj).toBe(updatedBusinessPartner.cnpj)
          expect(res.body.fantasy_name).toBe(updatedBusinessPartner.fantasy_name)
          expect(res.body.foundation_date).toBe(updatedBusinessPartner.foundation_date)
          expect(res.body.status).toBe(updatedBusinessPartner.status)

          done()
        })
  })
})