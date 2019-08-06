function buildCustomer (data, companyToken) {
  const dataCustomer = { customer: {}, address: [], email: [], phone: [], vehicle: [], business_partner: [] }
  dataCustomer.customer = {
    name: (data.customer_name) ? data.customer_name : '',
    cpfcnpj: (data.customer_cpfcnpj) ? data.customer_cpfcnpj : '',
    cpfcnpj_status: (data.customer_cpfcnpj_status) ? data.cpfcnpj_status : null,
    birthdate: (data.customer_birthdate) ? data.customer_birthdate : null,
    gender: (data.customer_gender) ? data.customer_gender : null,
    mother_name: (data.customer_mother) ? data.customer_mother : null,
    deceased: (data.customer_deceased) ? data.deceased : false,
    occupation: (data.customer_occupation) ? data.occupation : null,
    income: (data.customer_income) ? data.customer_income : null,
    credit_risk: (data.customer_credit_risk) ? data.customer_credit_risk : null,
    company_token: companyToken
  }

  const address = {
    street: (data.customer_address_street) ? data.customer_address_street : null,
    city: (data.customer_address_city) ? data.customer_address_city : null,
    cep: (data.customer_address_cep) ? data.customer_address_cep : null,
    state: (data.customer_address_state) ? data.customer_address_state : null,
    district: (data.customer_address_district) ? data.customer_address_district : null,
    type: (data.customer_address_type) ? data.customer_address_type : null
  }

  if (address.street && address.cep) {
    dataCustomer.address.push(address)
  }

  const email = {
    email: (data.customer_email) ? data.customer_email : null
  }

  if (email.email) {
    dataCustomer.email.push(email)
  }

  const phone = {
    number: (data.customer_phone_number) ? data.customer_phone_number : null,
    type: (data.customer_phone_type) ? data.customer_phone_type : null
  }

  if (phone.number) {
    dataCustomer.phone.push(phone)
  }

  const vehicle = {
    plate: (data.customer_vehicle_plate) ? data.customer_vehicle_plate : null,
    model: (data.customer_vehicle_model) ? data.customer_vehicle_model : null,
    year: (data.customer_vehicle_year) ? data.customer_vehicle_year : null,
    renavam: (data.customer_vehicle_renavam) ? data.customer_vehicle_renavam : null,
    chassi: (data.customer_vehicle_chassi) ? data.customer_vehicle_chassi : null,
    license: (data.customer_vehicle_license) ? data.customer_vehicle_license : null
  }

  if (vehicle.plate) {
    dataCustomer.vehicle.push(vehicle)
  }

  const business_partner = {
    cnpj: (data.customer_business_partner_cnpj) ? data.customer_business_partner_cnpj : null,
    fantasy_name: (data.customer_business_partner_fantasy_name) ? data.customer_business_partner_fantasy_name : null,
    status: (data.customer_business_partner_status) ? data.customer_business_partner_status : null,
    foundation_date: (data.customer_business_partner_foundation_date) ? data.customer_business_partner_foundation_date : null
  }

  if (business_partner.cnpj) {
    dataCustomer.business_partner.push(business_partner)
  }

  return dataCustomer 
}

module.exports = { buildCustomer }