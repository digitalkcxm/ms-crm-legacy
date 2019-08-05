exports.up = (knex, Promise) => {
  return knex.schema.createTable('customer', (table) => {
    table.increments(),
    table.string('name'),
    table.string('cpfcnpj').notNullable(),
    table.string('person_type'),
    table.string('cpfcnpj_status'),
    table.date('birthdate'),
    table.string('gender'),
    table.string('mother_name'),
    table.boolean('deceased').defaultTo(false),
    table.string('occupation'),
    table.string('income'),
    table.string('credit_risk'),
    table.string('company_token').notNullable(),
    table.timestamps(true, true)
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTableIfExists('customer')
}