exports.up = (knex, Promise) => {
  return knex.schema.alterTable('customer', (table) => {
    table.string('cpfcnpj').nullable().alter()
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('customer', (table) => {
    table.string('cpfcnpj').notNullable().alter()
  })
}