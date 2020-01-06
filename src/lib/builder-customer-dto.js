function buildCustomerDTO (customer) {
  let customerDto = {}

  if (customer) {
    if (customer.id) customerDto.id = customer.id
    if (customer.cpfcnpj) customerDto.customer_cpfcnpj = customer.cpfcnpj
    if (customer.name) customerDto.customer_name = customer.name
    if (customer.person_type) customerDto.customer_person_type = customer.person_type
    if (customer.cpfcnpj_status) customerDto.customer_cpfcnpj_status = customer.cpfcnpj_status
    if (customer.birthdate) customerDto.customer_birthdate = customer.birthdate
    if (customer.gender) customerDto.customer_gender = customer.gender
    if (customer.mother_name) customerDto.customer_mother_name = customer.mother_name
    if (customer.deceased) customerDto.customer_deceased = customer.deceased
    if (customer.occupation) customerDto.customer_occupation = customer.occupation
    if (customer.income) customerDto.customer_income = customer.income
    if (customer.credit_risk) customerDto.customer_credit_risk = customer.credit_risk

    if (customer.email) {
      let listEmail = customer.email
      let listEmailFormmated = []
      listEmail.forEach(e => {
        if (e.email) listEmailFormmated.push({ id: e.id, customer_email: e.email })
      })
      customerDto.customer_email = listEmailFormmated
    }

    if (customer.address) {
      let listAddress = customer.address
      let listAddressFormatted = []
      listAddress.forEach(a => {
        let address = {
          id: a.id,
          customer_address_street: a.street,
          customer_address_city: a.city,
          customer_address_cep: a.cep,
          customer_address_state: a.state,
          customer_address_district: a.district,
          customer_address_type: a.type
        }
        listAddressFormatted.push(address)
      })
      customerDto.customer_address = listAddressFormatted
    }

    if (customer.business_partner) {
      let listBusinessPartner = customer.business_partner
      let listBusinessPartnerFormatted = []
      listBusinessPartner.forEach(b => {
        let business = {
          id: b.id,
          customer_business_partner_cnpj: b.cnpj,
          customer_business_partner_fantasy_name: b.fantasy_name,
          customer_business_partner_status: b.status,
          customer_business_partner_foundation_date: b.foundation_name
        }
        listBusinessPartnerFormatted.push(business)
      })
      customerDto.customer_business_partner = listBusinessPartnerFormatted
    }

    if (customer.phone) {
      let listPhone = customer.phone
      let listPhoneFormatted = []
      listPhone.forEach(p => {
        let phone = {
          id: p.id,
          customer_phone_number: p.number,
          customer_phone_type: p.type
        }
        listPhoneFormatted.push(phone)
      })
      customerDto.customer_phone = listPhoneFormatted
    }

    if (customer.vehicle) {
      let listVehicle = customer.vehicle
      let listVehicleFormatted = []
      listVehicle.forEach(v => {
        let vehicle = {
          id: v.id,
          customer_vehicle_plate: v.plate,
          customer_vehicle_model: v.model,
          customer_vehicle_year: v.year,
          customer_vehicle_renavam: v.renavam,
          customer_vehicle_chassi: v.chassi,
          customer_vehicle_license: v.license
        }
        listVehicleFormatted.push(vehicle)
      })
      customerDto.customer_vehicle = listVehicleFormatted
    }

    if (customer.business_list) customerDto.business_list = customer.business_list
    if (customer.business_template_list) customerDto.business_template_list = customer.business_template_list
  }

  return customerDto
}

module.exports = { buildCustomerDTO }