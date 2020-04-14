const moment = require('moment')
const nock = require('nock')
const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

const companyToken = 'b61a6d542f9036550ba9c401c80f00eb'
const defaultCPF = '38686682170'
let defaultCustomerId = 4

const defaultVehicle = {
  plate: 'AAA-2020',
  model: 'Gol',
  year: '2020',
  renavam: 'ZZZ4567',
  chassi: '100000000021020',
  license: '002020202112'
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

describe('CRUD Customer Vehicle', () => {
    beforeAll(async () => {
      await createCustomer(defaultCustomerId, { customer_cpfcnpj: defaultCPF, prefix_index_elastic: 'test-prefix' })
    })
    
    it('Should to create an vehicle', async (done) => {
      request.post(`/api/v1/customers/${defaultCustomerId}/vehicles`)
        .set('token', companyToken)
        .send(defaultVehicle)
        .end((err, res) => {
          if (err) done(err)

          expect(res.statusCode).toBe(201)
          done()
        })
    })

    it('Should to list vehicles by customer', done => {
      request.get(`/api/v1/customers/${defaultCustomerId}/vehicles`)
        .set('token', companyToken)
        .end((err, res) => {
          if (err) done(err)

          expect(res.statusCode).toBe(200)
          expect(res.body[0]).toHaveProperty('id')
          expect(res.body[0]).toHaveProperty('plate')
          expect(res.body[0]).toHaveProperty('model')
          expect(res.body[0]).toHaveProperty('year')
          expect(res.body[0]).toHaveProperty('renavam')
          expect(res.body[0]).toHaveProperty('chassi')
          expect(res.body[0]).toHaveProperty('license')

          done()
        })
    })

    it('Should to update an vehicle by id', async (done) => {
      const updatedVehicle = {
        plate: 'AAA-2021',
        model: 'Gal',
        year: '2021',
        renavam: 'ZZZ4561',
        chassi: '100000000021021',
        license: '002020202113'
      }
      request.put(`/api/v1/customers/${defaultCustomerId}/vehicles/6`)
        .set('token', companyToken)
        .send(updatedVehicle)
        .end((err, res) => {
          if (err) done(err)

          expect(res.statusCode).toBe(200)
          expect(res.body.id).toBe(6)
          expect(res.body.plate).toBe(updatedVehicle.plate)
          expect(res.body.model).toBe(updatedVehicle.model)
          expect(res.body.year).toBe(updatedVehicle.year)
          expect(res.body.renavam).toBe(updatedVehicle.renavam)
          expect(res.body.chassi).toBe(updatedVehicle.chassi)
          expect(res.body.license).toBe(updatedVehicle.license)

          done()
        })
  })
})