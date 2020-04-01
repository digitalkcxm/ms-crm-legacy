const moment = require('moment')
const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

const { truncateCustomer } = require('../utils/customer')

const companyToken = 'b61a6d542f9036550ba9c401c80f00ef'

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

function checkAddressCreated (response) {
  return (response.street === fullAddress.customer_address_street) &&
    (response.cep === fullAddress.customer_address_cep) &&
    (response.city === fullAddress.customer_address_city) &&
    (response.state === fullAddress.customer_address_state) &&
    (response.district === fullAddress.customer_address_district) &&
    (response.type === fullAddress.customer_address_type)
}

function checkPhoneCreated (response) {
  return (response.number === fullPhone.customer_phone_number) &&
    (response.type === fullPhone.customer_phone_type)
}

function checkBusinessPartnerCreated (response) {
  return (response.cnpj === fullBusinessPartner.customer_business_partner_cnpj) &&
  (response.fantasy_name === fullBusinessPartner.customer_business_partner_fantasy_name) &&
  (moment(response.foundation_date).format('DD/MM/YYYY') === fullBusinessPartner.customer_business_partner_foundation_date) &&
  (response.status === fullBusinessPartner.customer_business_partner_status)
}

function checkVehicleCreated (response) {
  return (response.plate === fullVehicle.customer_vehicle_plate) && 
  (response.model === fullVehicle.customer_vehicle_model) &&
  (response.year === fullVehicle.customer_vehicle_year) &&
  (response.renavam === fullVehicle.customer_vehicle_renavam) &&
  (response.chassi === fullVehicle.customer_vehicle_chassi) &&
  (response.license === fullVehicle.customer_vehicle_license)
}

function checkEmailCreated (response) {
  return response.address === fullEmail.customer_email_address
}

describe('CRUD Customer', () => {
  beforeEach(async () => {
    await truncateCustomer()
  })

  it('Create Single Customer', async (done) => {
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
        expect(res.body).toHaveProperty('prefix_index_elastic')
        done()
      })
  })

  it('Should to return customer by cpf', async(done) => {
    await request
      .post('/api/v1/customer')
      .send(fullCustomer)
      .set('Accept', 'application/json')
      .set('token', companyToken)

    setTimeout(() => {
      request
        .get(`/api/v1/customers?cpfcnpj=${fullCustomer.customer_cpfcnpj}`)
        .set('Accept', 'application/json')
        .set('token', companyToken)
        .end((err, res) => {
          if (err) return done(err)
          expect(res.statusCode).toBe(200)
          expect(res.body.name).toBe(fullCustomer.customer_name)
          expect(res.body.cpfcnpj).toBe(fullCustomer.customer_cpfcnpj)
          expect(res.body.cpfcnpj_status).toBe(fullCustomer.customer_cpfcnpj_status)
          expect(res.body.gender).toBe(fullCustomer.customer_gender)
          expect(res.body.mother_name).toBe(fullCustomer.customer_mother_name)
          expect(res.body.occupation).toBe(fullCustomer.customer_occupation)
          expect(res.body.deceased).toBe(false)
          expect(res.body.credit_risk).toBe(fullCustomer.customer_credit_risk)
          expect(res.body.birthdate).toBe(fullCustomer.customer_birthdate)
          expect(res.body.income).toBe(fullCustomer.customer_income)
          expect(checkAddressCreated(res.body.address[0])).toBe(true)
          expect(checkPhoneCreated(res.body.phone[0])).toBe(true)
          expect(checkEmailCreated(res.body.email[0])).toBe(true)
          expect(checkVehicleCreated(res.body.vehicle[0])).toBe(true)
          expect(checkBusinessPartnerCreated(res.body.business_partner[0])).toBe(true)
          
          done()
        })
    }, 1000)
  })

  it('Should to return customer by ID', async(done) => {
    let idCreated = 1
    await request
      .post('/api/v1/customer')
      .send(fullCustomer)
      .set('Accept', 'application/json')
      .set('token', companyToken)

    setTimeout(async () => {
      const response = await request
        .get(`/api/v1/customers?cpfcnpj=${fullCustomer.customer_cpfcnpj}`)
        .set('Accept', 'application/json')
        .set('token', companyToken)

      idCreated = response.body.id
    
      request
        .get(`/api/v1/customers/${idCreated}`)
        .set('Accept', 'application/json')
        .set('token', companyToken)
        .end((err, res) => {
          if (err) return done(err)
          expect(res.statusCode).toBe(200)
          expect(res.body.name).toBe(fullCustomer.customer_name)
          expect(res.body.cpfcnpj).toBe(fullCustomer.customer_cpfcnpj)
          expect(res.body.cpfcnpj_status).toBe(fullCustomer.customer_cpfcnpj_status)
          expect(res.body.gender).toBe(fullCustomer.customer_gender)
          expect(res.body.mother_name).toBe(fullCustomer.customer_mother_name)
          expect(res.body.occupation).toBe(fullCustomer.customer_occupation)
          expect(res.body.deceased).toBe(false)
          expect(res.body.credit_risk).toBe(fullCustomer.customer_credit_risk)
          expect(res.body.birthdate).toBe(fullCustomer.customer_birthdate)
          expect(res.body.income).toBe(fullCustomer.customer_income)
          expect(checkAddressCreated(res.body.address[0])).toBe(true)
          expect(checkPhoneCreated(res.body.phone[0])).toBe(true)
          expect(checkEmailCreated(res.body.email[0])).toBe(true)
          expect(checkVehicleCreated(res.body.vehicle[0])).toBe(true)
          expect(checkBusinessPartnerCreated(res.body.business_partner[0])).toBe(true)
          
          done()
        })
    }, 1000)
  })
})