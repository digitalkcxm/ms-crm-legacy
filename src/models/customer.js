const database = require('../config/database/database')

const { formatCustomer } = require('../helpers/format-data-customer')

const maxQueryParams = 32767
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
        .where('id', id)
        .where('company_token', company_token)
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
          nowRows: parseInt(customersCount[0].total),
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
      const customers = await database('customer')
        .select(['id', 'cpfcnpj', 'name', 'person_type', 'cpfcnpj_status', 'birthdate', 'gender', 'mother_name', 'deceased', 'occupation', 'income', 'credit_risk', 'business_list', 'business_template_list'])
        .where({ cpfcnpj, company_token })
      if (customers && customers.length > 0) {
        let businessList = []
        let businessTemplateList = []
        customers.forEach(customer => {
          businessList = businessList.concat(customer.business_list)
          businessTemplateList = businessTemplateList.concat(customer.business_template_list)
        })
        customers[0].business_list = [...new Set(businessList)]
        customers[0].business_template_list = [...new Set(businessTemplateList)]
        
        return formatCustomer(customers[0])
      }
      return null
    } catch (err) {
      return err
    }
  }

  async searchCustomerByNameCpfEmailPhone (search, company_token) {
    try {
      const customers = await database('customer')
        .select(database.raw('DISTINCT ON(customer.id) customer.id, customer.name as customer_name, customer.cpfcnpj as customer_cpfcnpj, customer.business_list, customer.business_template_list'))
        .leftJoin('email', 'email.id_customer', 'customer.id')
        .leftJoin('phone', 'phone.id_customer', 'customer.id')
        .where({ company_token })
        .andWhere((queryWhere) => {
          queryWhere.whereRaw(`lower(customer.name) like '%${search.toLowerCase()}%'`)
          .orWhere('email.email', 'like', `%${search}%`)
          .orWhere('phone.number', 'like', `%${search}%`)
          .orWhere('customer.cpfcnpj', 'like', `%${search}%`)
        })

      return customers
    } catch(err) {
      console.error(err)
      return err
    }
  }

  async getCustomerListByKeyField (searchKeyFieldList = [], searchValueList = [], companyToken = '') {
    const searchkeyFieldListRemap = searchKeyFieldList.map(k => {
      if (k === 'phone') return 'phone.number'
      else if (k === 'email') return 'email.email'
      return k
    })
    const firstSearchKeyField = searchkeyFieldListRemap[0]
    const otherSearchKeyFieldList = searchkeyFieldListRemap.slice(1)

    const maxSearchValue = Math.floor(maxQueryParams / searchkeyFieldListRemap.length)

    try {
      let customers = []
      const lastIndexSearchValueList = searchValueList.length - 1
      let numSearchValue = 0
      let chunkSearchValueList = []

      for (let indexSearchValue in searchValueList) {
        const searchValue = searchValueList[indexSearchValue]

        chunkSearchValueList.push(searchValue)

        if (numSearchValue === maxSearchValue || indexSearchValue == lastIndexSearchValueList) {
          const customerResultList = await database('customer')
            .select(database.raw('customer.id, cpfcnpj, name, person_type, email.email as email, phone.number as phone, cpfcnpj_status, birthdate, gender, mother_name, deceased, occupation, income, credit_risk, customer.created_at, customer.updated_at, business_list, business_template_list'))
            .leftJoin('email', 'email.id_customer', 'customer.id')
            .leftJoin('phone', 'phone.id_customer', 'customer.id')
            .where({ company_token: companyToken })
            .andWhere(query => {
              query.whereIn(firstSearchKeyField, chunkSearchValueList)

              otherSearchKeyFieldList.forEach(keyField => {
                query.orWhereIn(keyField, chunkSearchValueList)
              })
            })

          customers.push(...customerResultList)

          chunkSearchValueList = []
          numSearchValue = 0
        }

        numSearchValue += 1
      }

      return customers
    } catch (err) {
      return err
    }
  }

  async createBatch (customers = []) {
    if (customers.length <= 0) return []

    const tableFields = Object.keys(customers[0])

    const maxCustomerByQuery = Math.floor(maxQueryParams / (tableFields.length + 1))
    
    try {
      let numCustomerByQuery = 0
      let customerIdList = []
      const lastIndexCustomerList = customers.length - 1
      
      let queryInsertValues = []
      let customerBindingValues = {}
      
      for (let indexCustomer in customers) {
        let customerValues = []
        const customer = customers[indexCustomer]

        tableFields.forEach(tf => {
          customerValues.push(`:${tf}${indexCustomer}`)
          customerBindingValues[`${tf}${indexCustomer}`] = customer[tf]

          if (tf === 'business_list' || tf === 'business_template_list') customerBindingValues[`${tf}${indexCustomer}`] = JSON.stringify(customerBindingValues[`${tf}${indexCustomer}`])
        })

        const value = `(${customerValues.join(',')})`
        queryInsertValues.push(value)

        if (numCustomerByQuery === maxCustomerByQuery || indexCustomer == lastIndexCustomerList) {
          const queryInsert = `INSERT INTO customer(${tableFields.join(',')}) VALUES ${queryInsertValues.join(',')} RETURNING id`
          const createdIdList = await this._execQuery(queryInsert, customerBindingValues)

          customerIdList = customerIdList.concat(createdIdList)

          queryInsertValues = []
          customerBindingValues = {}
          numCustomerByQuery = 0
        }

        numCustomerByQuery += 1
      }

      return customerIdList
    } catch (err) {
      console.log(err)
      return err
    }
  }

  async _execQuery(query = '', bindValues = {}) {
    if (query === '' || Object.keys(bindValues).length === 0) return []

    try {
      const queryResult = await database.raw(query, bindValues)
      return queryResult.rows
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async updateBatch (customers = []) {
    if (customers.length <= 0) return []

    const tableFields = ['id','name', 'cpfcnpj', 'person_type', 'cpfcnpj_status','birthdate', 'gender','mother_name','deceased','occupation','income','credit_risk','company_token','business_list','business_template_list']

    const maxCustomerByQuery = Math.floor(maxQueryParams / (tableFields.length + 1))

    try {
      let numCustomerByQuery = 0
      let customerIdList = []
      const lastIndexCustomerList = customers.length - 1

      let queryUpdateValues = []
      let customerBindingValues = {}
      for (let indexCustomer in customers) {
        const customer = customers[indexCustomer]
      
        let customerValues = []

        tableFields.forEach(tf => {
          customerValues.push(`:${tf}${indexCustomer}`)
          customerBindingValues[`${tf}${indexCustomer}`] = (customer[tf]) ? customer[tf] : null
          
          if (tf === 'business_list' || tf === 'business_template_list') customerBindingValues[`${tf}${indexCustomer}`] = JSON.stringify(customerBindingValues[`${tf}${indexCustomer}`])
        })

        const value = `(${customerValues.join(',')})`
        queryUpdateValues.push(value)

        if (numCustomerByQuery === maxCustomerByQuery || indexCustomer == lastIndexCustomerList) {
          const queryUpdate = `UPDATE customer SET
            name = c.name,
            cpfcnpj = c.cpfcnpj,
            person_type = c.person_type,
            cpfcnpj_status = c.cpfcnpj_status,
            birthdate = c.birthdate::date,
            gender = c.gender,
            mother_name = c.mother_name,
            deceased = c.deceased::bool,
            occupation = c.occupation,
            income = c.income,
            credit_risk = c.credit_risk,
            company_token = c.company_token,
            business_list = c.business_list::json,
            business_template_list = c.business_template_list::json,
            updated_at = NOW()
            FROM (VALUES ${queryUpdateValues.join(',')}) AS c(${tableFields.join(',')})
            WHERE customer.id = c.id::integer
            RETURNING customer.id`

          const createdIdList = await this._execQuery(queryUpdate, customerBindingValues)

          customerIdList = customerIdList.concat(createdIdList)

          queryUpdateValues = []
          customerBindingValues = {}
          numCustomerByQuery = 0
        }

        numCustomerByQuery += 1
      }
      
      return customerIdList
    } catch (err) {
      console.error(err)
      return err
    }
  }
}

module.exports = Customer
