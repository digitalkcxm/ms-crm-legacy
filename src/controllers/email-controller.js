const Customer = require('../models/customer')
const Email = require('../models/email')

const customerModel = new Customer()
const emailModel = new Email()

class EmailController {
  async create (req, res) {
    req.assert('email', 'E-mail é obrigatório').notEmpty()

    const companyToken = req.headers['token']

    if (req.validationErrors()) return res.status(400).send({ errors: req.validationErrors() })

    try {
      const customer = await customerModel.getById(req.params.customerId, companyToken)
      if (!customer) return res.status(500).send({ err: "Customer não encontrado." })
      await emailModel.create(customer.id, req.body.email)
      
      return res.sendStatus(201)
    } catch (err) {
      return res.status(500).send({ err: err.message })
    }
  }
}

module.exports = EmailController