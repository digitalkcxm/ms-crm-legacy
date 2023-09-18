function buildCustomer(data, companyToken) {
  const dataCustomer = {
    customer: {},
    address: [],
    email: [],
    phone: [],
    vehicle: [],
    business_partner: [],
    _id_register: ''
  }
  dataCustomer.customer = {
    company_token: companyToken
  }

  if (Array.isArray(data) && data.length > 1) {
    data = data[0]
  }
  dataCustomer._id_register = data._id

  if (data.customer_name) dataCustomer.customer.name = data.customer_name
  if (data.customer_cpfcnpj) dataCustomer.customer.cpfcnpj = data.customer_cpfcnpj
  if (data.customer_person_type) dataCustomer.customer.person_type = data.customer_person_type
  if (data.customer_cpfcnpj_status) dataCustomer.customer.cpfcnpj_status = data.customer_cpfcnpj_status
  if (data.customer_gender) dataCustomer.customer.gender = data.customer_gender
  if (data.customer_mother_name) dataCustomer.customer.mother_name = data.customer_mother_name

  if (data.customer_occupation) dataCustomer.customer.occupation = data.customer_occupation

  if (data.customer_deceased) {
    if (data.customer_deceased.toUpperCase().indexOf('N') === 0) {
      dataCustomer.customer.deceased = false
    } else {
      dataCustomer.customer.deceased = true
    }
  }

  if (data.customer_credit_risk) dataCustomer.customer.credit_risk = data.customer_credit_risk

  if (data.customer_birthdate) {
    if (data.customer_birthdate.indexOf('/') > 0) {
      let arrDate = data.customer_birthdate.split('/')
      let strData = `${arrDate[2]}-${arrDate[1]}-${arrDate[0]}`
      dataCustomer.customer.birthdate = strData
    } else if (data.customer_birthdate.indexOf('/') > 0) {
      dataCustomer.customer.birthdate = data.customer_birthdate
    } else {
      dataCustomer.customer.birthdate = '2000-01-01'
    }
  } else {
    dataCustomer.customer.birthdate = '2000-01-01'
  }

  if (data.customer_income) {
    if (isNaN(data.customer_income)) {
      dataCustomer.customer.income = 0
    } else {
      dataCustomer.customer.income = data.customer_income
    }
  }

  if (data.customer_responsible) {
    if (isNaN(data.customer_responsible.user_id)) {
      dataCustomer.customer.responsible_user_id = 0
    } else {
      dataCustomer.customer.responsible_user_id = parseInt(data.customer_responsible.user_id)
    }
  }

  let address = []
  if (data.customer_address && Array.isArray(data.customer_address)) {
    data.customer_address.forEach((ad) => {
      let dataAddress = buildAddress(ad)
      if (dataAddress.street && dataAddress.cep) {
        address.push(dataAddress)
      }
    })
  } else {
    let dataAddress = buildAddress(data)
    if (dataAddress.street && dataAddress.cep) {
      address.push(dataAddress)
    }
  }
  dataCustomer.address = address

  let email = []
  if (data.customer_email && Array.isArray(data.customer_email)) {
    data.customer_email
      .filter((e) => e.customer_email)
      .forEach((e) => {
        let dataEmail = buildEmail(e)

        if (dataEmail.email) {
          email.push(dataEmail)
        }
      })
  } else if (data.customer_email_address) {
    data.customer_email = data.customer_email_address
    let dataEmail = buildEmail(data)

    if (dataEmail.email) {
      email.push(dataEmail)
    }
  } else if (data.customer_email) {
    let dataEmail = buildEmail(data)

    if (dataEmail.email) {
      email.push(dataEmail)
    }
  }
  dataCustomer.email = email

  let phone = []
  if (data.customer_phone && Array.isArray(data.customer_phone)) {
    data.customer_phone
      .filter((p) => p.customer_phone_number && parseInt(p.customer_phone_number) > 0)
      .forEach((pn) => {
        let dataPhone = buildPhone(pn)

        if (dataPhone.number) {
          phone.push(dataPhone)
        }
      })
  } else if (data.customer_phone_number && parseInt(data.customer_phone_number) > 0) {
    let dataPhone = buildPhone(data)

    if (dataPhone.number) {
      phone.push(dataPhone)
    }
  }

  dataCustomer.phone = phone

  let vehicle = []
  if (data.customer_vehicle && Array.isArray(data.customer_vehicle)) {
    data.customer_vehicle.forEach((v) => {
      let dataVehicle = buildVehicle(v)

      if (dataVehicle.plate) {
        vehicle.push(dataVehicle)
      }
    })
  } else {
    let dataVehicle = buildVehicle(data)

    if (dataVehicle.plate) {
      vehicle.push(dataVehicle)
    }
  }

  dataCustomer.vehicle = vehicle

  let businessPartner = []
  if (data.customer_business_partner && Array.isArray(data.customer_business_partner)) {
    data.customer_business_partner.forEach((b) => {
      let business_partner = buildBusinessPartner(b)

      if (business_partner.cnpj) {
        businessPartner.push(business_partner)
      }
    })
  } else {
    let business_partner = buildBusinessPartner(data)

    if (business_partner.cnpj) {
      businessPartner.push(business_partner)
    }
  }
  dataCustomer.business_partner = businessPartner

  return dataCustomer
}

function buildAddress(data) {
  let dataAddress = {
    street: data.customer_address_street,
    cep: data.customer_address_cep
  }
  if (data.customer_address_city) dataAddress.city = data.customer_address_city
  if (data.customer_address_state) dataAddress.state = data.customer_address_state
  if (data.customer_address_district) dataAddress.district = data.customer_address_district
  if (data.customer_address_type) dataAddress.type = data.customer_address_type

  return dataAddress
}

function buildEmail(data) {
  const email = encodeURI(String(data.customer_email)).replace(new RegExp('s/\x00//g'), '').replace('%00', '')
  let dataEmail = {
    email
  }
  return dataEmail
}

function buildPhone(data) {
  let dataPhone = { number: data.customer_phone_number }
  if (data.customer_phone_type) dataPhone.type = data.customer_phone_type
  return dataPhone
}

function buildVehicle(data) {
  let dataVehicle = { plate: data.customer_vehicle_plate }

  if (data.customer_vehicle_model) dataVehicle.model = data.customer_vehicle_model
  if (data.customer_vehicle_year) dataVehicle.year = data.customer_vehicle_year
  if (data.customer_vehicle_renavam) dataVehicle.renavam = data.customer_vehicle_renavam
  if (data.customer_vehicle_chassi) dataVehicle.chassi = data.customer_vehicle_chassi
  if (data.customer_vehicle_license) dataVehicle.license = data.customer_vehicle_license
  return dataVehicle
}

function buildBusinessPartner(data) {
  let dataBusinessPartner = { cnpj: data.customer_business_partner_cnpj }
  if (data.customer_business_partner_fantasy_name) dataBusinessPartner.fantasy_name = data.customer_business_partner_fantasy_name
  if (data.customer_business_partner_status) dataBusinessPartner.status = data.customer_business_partner_status
  if (data.customer_business_partner_foundation_date) dataBusinessPartner.foundation_date = data.customer_business_partner_foundation_date
  return dataBusinessPartner
}

module.exports = { buildCustomer }
