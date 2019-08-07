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

  var address = []
  if (data.customer_address && Array.isArray(data.customer_address)) {
    data.customer_address.forEach(ad => {
      var dataAddress = {
        street: (ad.customer_address_street) ? ad.customer_address_street : null,
        city: (ad.customer_address_city) ? ad.customer_address_city : null,
        cep: (ad.customer_address_cep) ? ad.customer_address_cep : null,
        state: (ad.customer_address_state) ? ad.customer_address_state : null,
        district: (ad.customer_address_district) ? ad.customer_address_district : null,
        type: (ad.customer_address_type) ? ad.customer_address_type : null
      }
      if (dataAddress.street && dataAddress.cep) {
        address.push(dataAddress)
      }
    })
  } else {
    var dataAddress = {
      street: (data.customer_address_street) ? data.customer_address_street : null,
      city: (data.customer_address_city) ? data.customer_address_city : null,
      cep: (data.customer_address_cep) ? data.customer_address_cep : null,
      state: (data.customer_address_state) ? data.customer_address_state : null,
      district: (data.customer_address_district) ? data.customer_address_district : null,
      type: (data.customer_address_type) ? data.customer_address_type : null
    }
    if (dataAddress.street && dataAddress.cep) {
      address.push(dataAddress)
    }
  }

  dataCustomer.address = address
  

  var email = []
  if (data.customer_email && Array.isArray(data.customer_email)) {
    data.customer_email.forEach(e => {
      var dataEmail = {
        email: (e.customer_email) ? e.customer_email : null
      }
  
      if (dataEmail.email) {
        email.push(dataEmail)
      }
    })
  } else {
    var dataEmail = {
      email: (data.customer_email) ? data.customer_email : null
    }

    if (dataEmail.email) {
      email.push(dataEmail)
    }
  }
  dataCustomer.email = email

  var phone = []
  if (data.customer_phone && Array.isArray(data.customer_phone)) {
    data.customer_phone.forEach(pn => {
      var dataPhone = {
        number: (pn.customer_phone_number) ? pn.customer_phone_number : null,
        type: (pn.customer_phone_type) ? pn.customer_phone_type : null
      }
    
      if (dataPhone.number) {
        phone.push(dataPhone)
      }
    })
  } else {
    var dataPhone = {
      number: (data.customer_phone_number) ? data.customer_phone_number : null,
      type: (data.customer_phone_type) ? data.customer_phone_type : null
    }
  
    if (dataPhone.number) {
      phone.push(dataPhone)
    }
  }

  dataCustomer.phone = phone

  
  var vehicle = []
  if (data.customer_vehicle && Array.isArray(data.customer_vehicle)) {
    data.customer_vehicle.forEach(v => {
      var dataVehicle = {
        plate: (v.customer_vehicle_plate) ? v.customer_vehicle_plate : null,
        model: (v.customer_vehicle_model) ? v.customer_vehicle_model : null,
        year: (v.customer_vehicle_year) ? v.customer_vehicle_year : null,
        renavam: (v.customer_vehicle_renavam) ? v.customer_vehicle_renavam : null,
        chassi: (v.customer_vehicle_chassi) ? v.customer_vehicle_chassi : null,
        license: (v.customer_vehicle_license) ? v.customer_vehicle_license : null
      }
    
      if (dataVehicle.plate) {
        vehicle.push(dataVehicle)
      }
    })
  } else {
    var dataVehicle = {
      plate: (data.customer_vehicle_plate) ? data.customer_vehicle_plate : null,
      model: (data.customer_vehicle_model) ? data.customer_vehicle_model : null,
      year: (data.customer_vehicle_year) ? data.customer_vehicle_year : null,
      renavam: (data.customer_vehicle_renavam) ? data.customer_vehicle_renavam : null,
      chassi: (data.customer_vehicle_chassi) ? data.customer_vehicle_chassi : null,
      license: (data.customer_vehicle_license) ? data.customer_vehicle_license : null
    }
  
    if (dataVehicle.plate) {
      vehicle.push(dataVehicle)
    }
  }

  dataCustomer.vehicle = vehicle
  

  var businessPartner = []
  if (data.customer_business_partner && Array.isArray(data.customer_business_partner)) {
    data.customer_business_partner.forEach(b => {
      var business_partner = {
        cnpj: (b.customer_business_partner_cnpj) ? b.customer_business_partner_cnpj : null,
        fantasy_name: (b.customer_business_partner_fantasy_name) ? b.customer_business_partner_fantasy_name : null,
        status: (b.customer_business_partner_status) ? b.customer_business_partner_status : null,
        foundation_date: (b.customer_business_partner_foundation_date) ? b.customer_business_partner_foundation_date : null
      }
    
      if (business_partner.cnpj) {
        businessPartner.push(business_partner)
      }
    })
  } else {
    var business_partner = {
      cnpj: (data.customer_business_partner_cnpj) ? data.customer_business_partner_cnpj : null,
      fantasy_name: (data.customer_business_partner_fantasy_name) ? data.customer_business_partner_fantasy_name : null,
      status: (data.customer_business_partner_status) ? data.customer_business_partner_status : null,
      foundation_date: (data.customer_business_partner_foundation_date) ? data.customer_business_partner_foundation_date : null
    }
  
    if (business_partner.cnpj) {
      businessPartner.push(business_partner)
    }
  }
  

  dataCustomer.business_partner = businessPartner

  return dataCustomer 
}

module.exports = { buildCustomer }