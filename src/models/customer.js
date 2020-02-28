const database = require('../config/database/database')

const { formatCustomer } = require('../helpers/format-data-customer')
class Customer {
  async createOrUpdate(companyToken, data, businessId, businessTemplateId, listKeyFields = []) {
    try {
      let dataKeyFields = {}
      Object.keys(listKeyFields)
        .filter(c => c != undefined)
        .map(k => dataKeyFields[k] = listKeyFields[k])

      const customer = await this.getCustomerByKeyFields(dataKeyFields, companyToken)

      if (customer) {
        let business_list = customer.business_list
        let business_template_list = customer.business_template_list
        if (Array.isArray(business_list)) business_list = [...new Set(business_list.concat(businessId))]
        else business_list = businessId
        data.business_list = JSON.stringify(business_list)

        if (Array.isArray(business_template_list)) business_template_list = [... new Set(business_template_list.concat(businessTemplateId))]
        else business_template_list = businessTemplateId
        data.business_template_list = JSON.stringify(business_template_list)

        const result = await this.update(customer.id, data)
        return result
      } else {
        data.company_token = companyToken
        data.business_list = JSON.stringify(businessId)
        data.business_template_list = JSON.stringify(businessTemplateId)
        const result = await this.create(data)
        return result
      }
    } catch (err) {
      console.error('CUSTOMER SAVE ==>', err)
      return err
    }
  }

  async create (data) {
    try {
      const customerId = await database('customer')
        .insert(data, 'id')
      return formatCustomer(customerId[0])
    } catch (err) {
      console.error('CREATE CUSTOMER=>', err)
      return err
    }
  }

  async getCustomerByKeyFields (dataKeyFields, companyToken) {
    try {
      const params = dataKeyFields

      const customers = await database('customer')
        .select(['customer.id', 'cpfcnpj', 'name', 'person_type', 'email.email', 'phone.number', 'cpfcnpj_status', 'birthdate', 'gender', 'mother_name', 'deceased', 'occupation', 'income', 'credit_risk', 'customer.created_at', 'customer.updated_at', 'business_list', 'business_template_list'])
        .leftJoin('email', 'email.id_customer', 'customer.id')
        .leftJoin('phone', 'phone.id_customer', 'customer.id')
        .where({ company_token: companyToken })
        .andWhere(query => {
          Object.keys(params).forEach(param => {
            if (param === 'email') query.whereIn('email.email', params[param])
            if (param === 'phone') query.whereIn('phone.number', params[param])
            if (param === 'cpfcnpj' || param === 'name') query.where(param, params[param])
          })
        })
      if (customers) return formatCustomer(customers[0])
      return null
    } catch (err) {
      console.error('GET CUSTOMER BY KEY FIELDS ===>', err)
      return err
    }
  }

  async listById (list_id, company_token) {
    try {
       const customers = await database('customer').select(['id', 'business_list', 'business_template_list']).whereIn('id', list_id).where({ company_token })
       return customers
    } catch(err) {
console.error(err)
      return err
    }
  }

  async getById (id, company_token) {
    try {
      const customer = await database('customer')
        .select(['id', 'cpfcnpj', 'name', 'person_type', 'cpfcnpj_status', 'birthdate', 'gender', 'mother_name', 'deceased', 'occupation', 'income', 'credit_risk', 'business_list', 'business_template_list', 'created_at', 'updated_at'])
        .where({ id, company_token })
      if (customer) return formatCustomer(customer[0])
      return null
    } catch (err) {
      return err
    }
  }

  async getAllByCompany (company_token, page = -1, limit = 10) {
    try {
      let customers = []
      let pagination = {}
      if (page < 0) {
        customers = await database('customer')
          .select(['id', 'cpfcnpj', 'name'])
          .where({ company_token })
          .orderBy('id')
      } else {
        customers = await database('customer')
          .select(['id', 'cpfcnpj', 'name'])
          .where({ company_token })
          .orderBy('id')
          .offset(page * limit)
          .limit(limit)

        const customersCount = await database('customer')
          .select(database.raw('count(*) as total'))
          .where({ company_token })

        pagination = {
          total: parseInt(customersCount[0].total),
          page,
          firstPage: 0,
          lastPage: (Math.ceil(parseInt(customersCount[0].total) / limit) - 1)
        }
      }

      return { customers, pagination }
    } catch (err) {
      return err
    }
  }

  async update(customerId, data) {
    try {
      await database('customer')
        .update(data)
        .where({ id: customerId })
      return customerId
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async getByCpfCnpj (cpfcnpj, company_token) {
    try {
      const customer = await database('customer')
        .select(['id', 'cpfcnpj', 'name', 'person_type', 'cpfcnpj_status', 'birthdate', 'gender', 'mother_name', 'deceased', 'occupation', 'income', 'credit_risk', 'business_list', 'business_template_list'])
        .where({ cpfcnpj, company_token })
      if (customer && customer.length > 0) return formatCustomer(customer[0])
      return null
    } catch (err) {
      return err
    }
  }
}

module.exports = Customer
