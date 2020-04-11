const moment = require('moment')
const nock = require('nock')
const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

const { truncateCustomer } = require('../utils/customer')

const companyToken = 'b61a6d542f9036550ba9c401c80f00ef'
const defaultCPF = '58310918488'

const fullAddress = {
  customer_address_street: 'Rua Idalina',
  customer_address_cep: '333350-000',
  customer_address_city: 'São Paulo',
  customer_address_state: 'São Paulo',
  customer_address_district: 'Lapa',
  customer_address_type: 'Comercial'
}

const fullPhone = {
  customer_phone_number: '5511912345678',
  customer_phone_type: 'Celular'
}

const fullEmail = {
  customer_email: 'email@email.com'
}

const fullVehicle = {
  customer_vehicle_plate: 'AAA-2020',
  customer_vehicle_model: 'Gol',
  customer_vehicle_year: '2020',
  customer_vehicle_renavam: 'ZZZ4567',
  customer_vehicle_chassi: '100000000021020',
  customer_vehicle_license: '002020202112'
}

const fullBusinessPartner = {
  customer_business_partner_cnpj: '45066368000190',
  customer_business_partner_fantasy_name: 'Corp Test',
  customer_business_partner_foundation_date: '01/01/2000',
  customer_business_partner_status: 'ATIVO'
}

const fullCustomer = {
  customer_name: 'Cústomerçãóü',
  customer_cpfcnpj: '58310918488',
  customer_cpfcnpj_status: 'ATIVO',
  customer_gender: 'MASCULINO',
  customer_mother_name: 'Nome da Mãe',
  customer_occupation: 'Software Engineer',
  customer_deceased: 'N',
  customer_credit_risk: 'ALTO',
  customer_birthdate: '24/03/2020',
  customer_income: '500000.00',
  customer_address: [fullAddress],
  customer_phone: [fullPhone],
  customer_email: [fullEmail],
  customer_vehicle: [fullVehicle],
  customer_business_partner: [fullBusinessPartner],
  prefix_index_elastic: 'test',
}

function checkAddressCreated (response, compare = fullAddress) {
  return (response.street === compare.customer_address_street) &&
    (response.cep === compare.customer_address_cep) &&
    (response.city === compare.customer_address_city) &&
    (response.state === compare.customer_address_state) &&
    (response.district === compare.customer_address_district) &&
    (response.type === compare.customer_address_type)
}

function checkPhoneCreated (response, compare = fullPhone) {
  return (response.number === compare.customer_phone_number) &&
    (response.type === compare.customer_phone_type)
}

function checkBusinessPartnerCreated (response, compare = fullBusinessPartner) {
  return (response.cnpj === compare.customer_business_partner_cnpj) &&
  (response.fantasy_name === compare.customer_business_partner_fantasy_name) &&
  (moment(response.foundation_date).format('DD/MM/YYYY') === compare.customer_business_partner_foundation_date) &&
  (response.status === compare.customer_business_partner_status)
}

function checkVehicleCreated (response, compare = fullVehicle) {
  return (response.plate === compare.customer_vehicle_plate) && 
  (response.model === compare.customer_vehicle_model) &&
  (response.year === compare.customer_vehicle_year) &&
  (response.renavam === compare.customer_vehicle_renavam) &&
  (response.chassi === compare.customer_vehicle_chassi) &&
  (response.license === compare.customer_vehicle_license)
}

function checkEmailCreated (response, compare = fullEmail) {
  return response.address === compare.customer_email_address
}

function newCustomer() {
  const customer = {}
  Object.keys(fullCustomer)
    .forEach(k => {
      customer[k] = fullCustomer[k]
    })
  return customer
}

async function createCustomer(customerId = 0, customer = fullCustomer) {
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

describe('CRUD Customer', () => {
  beforeEach(async () => {
    // await truncateCustomer()
  })

  afterAll(() => {
    nock.restore()
    nock.activate()
  })
  afterEach(nock.cleanAll)

  it('Create Single Customer', async (done) => {
    const elasticIndex = fullCustomer.prefix_index_elastic
    
    let newDate = moment(new Date()).format('YYYYMM')
    nock('http://localhost:9200')
      .intercept('\/' + `${elasticIndex}-crm-${newDate}/customer/1`, 'OPTIONS')
      .reply(200, '', {'Access-Control-Allow-Origin': '*'})
      .put('\/' + `${elasticIndex}-crm-${newDate}/customer/1`)
      .reply(200, '', {'Access-Control-Allow-Origin': '*'})

    request
      .post('/api/v1/customer')
      .send(fullCustomer)
      .set('Accept', 'application/json')
      .set('token', companyToken)
      .end((err, res) => {
        if (err) return done(err)

        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('customer_cpfcnpj')
        expect(res.body).toHaveProperty('customer_name')
        expect(res.body).toHaveProperty('customer_id')
        done()
      })
  })

  it('Should to return customer by CPF', async(done) => {
    const customerId = 2
    const customer = newCustomer()
    customer.customer_cpfcnpj = '24867743860'
    createCustomer(customerId, customer)
      .then(() => {
        request
          .get(`/api/v1/customers?cpfcnpj=${customer.customer_cpfcnpj}`)
          .set('Accept', 'application/json')
          .set('token', companyToken)
          .end((err, res) => {
            if (err) return done(err)
            expect(res.statusCode).toBe(200)
            expect(res.body.name).toBe(customer.customer_name)
            expect(res.body.cpfcnpj).toBe(customer.customer_cpfcnpj)
            expect(res.body.cpfcnpj_status).toBe(customer.customer_cpfcnpj_status)
            expect(res.body.gender).toBe(customer.customer_gender)
            expect(res.body.mother_name).toBe(customer.customer_mother_name)
            expect(res.body.occupation).toBe(customer.customer_occupation)
            expect(res.body.deceased).toBe(false)
            expect(res.body.credit_risk).toBe(customer.customer_credit_risk)
            expect(res.body.birthdate).toBe(customer.customer_birthdate)
            expect(res.body.income).toBe(customer.customer_income)
            expect(res.body).toHaveProperty('address')
            expect(res.body).toHaveProperty('phone')
            expect(res.body).toHaveProperty('email')
            expect(res.body).toHaveProperty('vehicle')
            expect(res.body).toHaveProperty('business_partner')
            
            done()
          })
      })
  })

  it('Should to return customer by ID', async(done) => {
    const customerId = 3
    const customer = newCustomer()
    customer.customer_cpfcnpj = '91724663593'
    createCustomer(customerId, customer)
      .then(() => {
        request
          .get(`/api/v1/customers/${customerId}`)
          .set('Accept', 'application/json')
          .set('token', companyToken)
          .end((err, res) => {
            if (err) return done(err)

            expect(res.statusCode).toBe(200)
            expect(res.body.name).toBe(customer.customer_name)
            expect(res.body.cpfcnpj).toBe(customer.customer_cpfcnpj)
            expect(res.body.cpfcnpj_status).toBe(customer.customer_cpfcnpj_status)
            expect(res.body.gender).toBe(customer.customer_gender)
            expect(res.body.mother_name).toBe(customer.customer_mother_name)
            expect(res.body.occupation).toBe(customer.customer_occupation)
            expect(res.body.deceased).toBe(false)
            expect(res.body.credit_risk).toBe(customer.customer_credit_risk)
            expect(res.body.birthdate).toBe(customer.customer_birthdate)
            expect(res.body.income).toBe(customer.customer_income)
            expect(res.body).toHaveProperty('address')
            expect(res.body).toHaveProperty('phone')
            expect(res.body).toHaveProperty('email')
            expect(res.body).toHaveProperty('vehicle')
            expect(res.body).toHaveProperty('business_partner')
            
            done()
          })
      })
  })

  

  it('Should to return list of customers searched by CPF', async (done) => {
    const elasticIndex = 'test'
    nock('http://localhost:9200')
      .intercept('\/' + `${elasticIndex}-crm-*/_search?q=*${defaultCPF}*`, 'OPTIONS')
      .reply(200, '', {'Access-Control-Allow-Origin': '*'})
      .get('\/' + `${elasticIndex}-crm-*/_search?q=*${defaultCPF}*`)
      .reply(200, '', {'Access-Control-Allow-Origin': '*'})

    request.get(`/api/v1/customers/search?search=${defaultCPF}`)
      .set('Accept', 'application/json')
      .set('token', companyToken)
      .set('prefix-index-elastic', elasticIndex)
      .end((err, res) => {
        if (err) done(err)

        expect(res.statusCode).toBe(200)

        expect(res.body[0]).toHaveProperty('customer_cpfcnpj')
        expect(res.body[0]).toHaveProperty('customer_name')
        expect(res.body[0]).toHaveProperty('customer_phome')
        expect(res.body[0]).toHaveProperty('customer_email')
        expect(res.body[0]).toHaveProperty('business_list')
        expect(res.body[0]).toHaveProperty('business_template_list')

        done()
      })
  })

  it('Should to return list of all customers by company', async (done) => {
    request.get('/api/v1/customers/all')
      .set('token', companyToken)
      .end((err, res) => {
        if (err) done(err)

        expect(res.body).toHaveProperty('pagination')
        expect(res.body).toHaveProperty('customers')
        expect(res.body.customers.length).not.toBe(1)

        done()
      })
  })

  // it('Should to return customer by ID with fields formatted', async (done) => {
  //   request.get('/api/v1/customers/1/formatted')
  //     .set('token', companyToken)
  //     .end((err, res) => {
  //       if (err) done(err)

  //       expect(res.body.id).toBe(1)
  //       expect(res.body).toContainKeys(['business_list', 'business_template_list', 'customer_name',
  //       'customer_cpfcnpj', 'customer_cpfcnpj_status', 'customer_gender', 'customer_mother_name',
  //       'customer_occupation', 'customer_deceased', 'customer_credit_risk', 'customer_birthdate',
  //       'customer_income'])
  //       expect(res.body).toContainKeys(['customer_address', 'customer_phone', 'customer_email', 'customer_vehicle', 
  //       'customer_business_partner'])

  //       done()
  //     })
  // })

  it('Should to update a customer', async (done) => {
    const elasticIndex = 'test'
    const newDate = moment(new Date()).format('YYYYMM')
    const customerId = 1
    nock('http://localhost:9200')
      .intercept('\/' + `${elasticIndex}-crm-${newDate}/customer/${customerId}`, 'OPTIONS')
      .reply(200, '', {'Access-Control-Allow-Origin': '*'})
      .put('\/' + `${elasticIndex}-crm-${newDate}/customer/${customerId}`)
      .reply(200, '', {'Access-Control-Allow-Origin': '*'})

    request.put(`/api/v1/customers/${customerId}`)
      .set('token', companyToken)
      .set('prefix-index-elastic', elasticIndex)
      .set('Content-type', 'application/json')
      .send({ customer_name: 'João JJ' })
      .end((err, res) => {
        if (err) done(err)

        expect(res.statusCode).toBe(204)
        
        done()
      })
  })

  it('Should to create list of customers', async(done) => {
    const prefixIndexElastic = 'testindex'
    const businessId = '1ab2c3'
    const businessTemplateId = '1c2bca'
    const customerIds = [4,5]
    const customers = []
    const customer1 = newCustomer()
    customer1.customer_cpfcnpj = '07280216250'
    customers.push(customer1)
    const customer2 = newCustomer()
    customer2.customer_cpfcnpj = '85628387134'
    customers.push(customer2)
    const listKeyFields = ['customer_cpfcnpj']
    const requestBody = {
      customers,
      business_id: businessId,
      business_template_id: businessTemplateId,
      field_key_list: listKeyFields,
      prefix_index_elastic: prefixIndexElastic
    }

    const newDate = moment(new Date()).format('YYYYMM')

    nock('http://localhost:9200')
      .intercept('\/' + `${prefixIndexElastic}-crm-${newDate}/customer/${customerIds[0]}`, 'OPTIONS')
      .reply(200, '', {'Access-Control-Allow-Origin': '*'})
      .put('\/' + `${prefixIndexElastic}-crm-${newDate}/customer/${customerIds[0]}`)
      .reply(200, '', {'Access-Control-Allow-Origin': '*'})
      
    nock('http://localhost:9200')
      .intercept('\/' + `${prefixIndexElastic}-crm-${newDate}/customer/${customerIds[1]}`, 'OPTIONS')
      .reply(200, '', {'Access-Control-Allow-Origin': '*'})
      .put('\/' + `${prefixIndexElastic}-crm-${newDate}/customer/${customerIds[1]}`)
      .reply(200, '', {'Access-Control-Allow-Origin': '*'})
    
      nock(process.env.MSBUSINESS_URL)
      .intercept('\/business/customer-storaging', 'OPTIONS')
      .reply(200, null, {'Access-Control-Allow-Origin': '*', 'Access-Control-Request-Headers': '*'})
      .post('\/business/customer-storaging')
      .reply(200, null, {'Access-Control-Allow-Origin': '*', 'Access-Control-Request-Headers': '*'})
    
    request.post(`/api/v1/customers`)
      .send(requestBody)
      .set('Accept', 'application/json')
      .set('token', companyToken)
      .end(async (err, res) => {
        if (err) done(err)
      
        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('customers')

        done()
      })
  })
})