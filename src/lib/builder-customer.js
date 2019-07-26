function buildCustomer (data, userId, businessId) {
  const customer = {
    name: (data.customer_name) ? data.customer_name : '',
    cpf: (data.customer_cpf) ? data.customer_cpf : '',
    cpf_status: (data.customer_cpf_status) ? data.cpf_status : null,
    birthdate: (data.customer_birthdate) ? data.customer_birthdate : null,
    gender: (data.customer_gender) ? data.customer_gender : null,
    mother_name: (data.customer_mother) ? data.customer_mother : null,
    deceased: (data.customer_deceased) ? data.deceased : false,
    occupation: (data.customer_occupation) ? data.occupation : null,
    income: (data.customer_income) ? data.customer_income : null,
    credit_risk: (data.customer_credit_risk) ? data.customer_credit_risk : null,
    user_id: userId,
    businessId: businessId
  }

  return customer 
}

module.exports = { buildCustomer }