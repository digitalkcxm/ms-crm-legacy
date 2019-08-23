const database = require('../config/database/database')

class Customer {
  async createOrUpdate(companyToken, cpfcnpj, data, businessId, businessTemplateId, dataKeyFields) {
    try {
      const customer = await this.getCustomerByKeyFields(dataKeyFields, companyToken)
      console.log('params', dataKeyFields)
      console.log('customer', customer)
      if (customer) {
        var business_list = customer.business_list
        var business_template_list = customer.business_template_list
        if (Array.isArray(business_list)) business_list = [...new Set(business_list.concat(businessId))]
        else business_list = businessId
        data.business_list = JSON.stringify(business_list)

        if (Array.isArray(business_template_list)) business_template_list = [... new Set(business_template_list.concat(businessTemplateId))]
        else business_template_list = businessTemplateId
        data.business_template_list = JSON.stringify(business_template_list)

        return await this.update(customer.id, data)
      } else {
        data.company_token = companyToken
        data.business_list = JSON.stringify(businessId)
        data.business_template_list = JSON.stringify(businessTemplateId)
        return await this.create(data)
      }
    } catch (err) {
      return err
    }
  }

  async create (data) {
    try {
      const customerId = await database('customer')
        .insert(data, 'id')
      return customerId[0]
    } catch (err) {
      return err
    }
  }

  async getCustomerByKeyFields (dataKeyFields, companyToken) {
    try {
      var params = dataKeyFields
      params.company_token = companyToken
      const customer = await database('customer')
        .select(['id', 'cpfcnpj', 'name', 'person_type', 'cpfcnpj_status', 'birthdate', 'gender', 'mother_name', 'deceased', 'occupation', 'income', 'credit_risk', 'created_at', 'updated_at'])
        .where(params)
      if (customer) return customer[0]
      return null
    } catch (err) {
      return err
    }
  }

  async getById (id, company_token) {
    try {
      const customer = await database('customer')
        .select(['id', 'cpfcnpj', 'name', 'person_type', 'cpfcnpj_status', 'birthdate', 'gender', 'mother_name', 'deceased', 'occupation', 'income', 'credit_risk', 'business_list', 'business_template_list', 'created_at', 'updated_at'])
        .where({ id, company_token })
      if (customer) return customer[0]
      return null
    } catch (err) {
      return err
    }
  }

  async getAllByCompany (company_token) {
    try {
      return await database('customer')
        .select(['id', 'cpfcnpj', 'name'])
        .where({ company_token })
    } catch (err) {
      return err
    }
  }

  async update(customerId, data) {
    try {
      await database('customer')
        .update(data, 'id')
        .where({ id: customerId })
      return customerId
    } catch (err) {
      return err
    }
  }

  async getByCpfCnpj (cpfcnpj, company_token) {
    try {
      const customer = await database('customer')
        .select(['id', 'cpfcnpj', 'name', 'person_type', 'cpfcnpj_status', 'birthdate', 'gender', 'mother_name', 'deceased', 'occupation', 'income', 'credit_risk', 'business_list', 'business_template_list'])
        .where({ cpfcnpj, company_token })
      if (customer && customer.length > 0) return customer[0]
      return null
    } catch (err) {
      return err
    }
  }
}

module.exports = Customer