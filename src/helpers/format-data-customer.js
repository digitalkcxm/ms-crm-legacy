const moment = require('moment')

function formatCustomer(customer) {
  if (customer) {
    let customerFormatted = customer
    if (customerFormatted.birthdate) 
      customerFormatted.birthdate = moment(customerFormatted.birthdate).format('DD/MM/YYYY')

    return customerFormatted
  }
  return customer
}

module.exports = { formatCustomer }