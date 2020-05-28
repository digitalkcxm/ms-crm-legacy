const Customer = require('../models/customer')
const Email = require('../models/email')

const customerModel = new Customer()
const emailModel = new Email()

class EmailController {
  async create (req, res) {
    req.assert('email', 'E-mail é obrigatório').notEmpty()

    const companyToken = req.headers['token']

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    let customerId = req.params.customerId
    if (!customerId) return res.status(400).send({ error: "O ID do customer é obrigatório." })
    else customerId = parseInt(customerId)

    try {
      const customer = await customerModel.getById(customerId, companyToken)      
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })

      const emailId = await emailModel.create(customer.id, req.body.email)
      
      return res.sendStatus(201)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }

  async update (req, res) {
    req.assert('email', 'E-mail é obrigatório').notEmpty()

    const companyToken = req.headers['token']

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    let customerId = req.params.customerId
    if (!customerId) return res.status(400).send({ error: "O ID do customer é obrigatório." })
    else customerId = parseInt(customerId)

    let emailId = req.params.emailId
    if (!emailId) return res.status(400).send({ error: "O ID do email é obrigatório" })
    else emailId = parseInt(emailId)

    try {
      const customer = await customerModel.getById(customerId, companyToken)
      if (!customer) return res.status(400).send({ err: "Customer não encontrado." })
      
      const email = await emailModel.update(customer.id, emailId, req.body.email)

      if (!email) return res.status(400).send({ err: "E-mail não encontrado." })
      
      return res.status(200).send(email)
    } catch (err) {
      console.error(err)
      return res.status(500).send({ err: err.message })
    }
  }

  async getAll (req, res) {
    const companyToken = req.headers['token']

    let customerId = req.params.customerId
    if (!customerId) return res.status(400).send({ error: "O ID do customer é obrigatório." })
    else customerId = parseInt(customerId)

    try {
      const customer = await customerModel.getById(customerId, companyToken)
      if (!customer) return res.status(400).send({ err: "Customer não encontrado." })

      const emails = await emailModel.getAllByCustomer(customerId)

      return res.status(200).send(emails)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = EmailController