function buildCustomer (data, companyToken) {
  const customer = {
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

  return customer 
}

module.exports = { buildCustomer }