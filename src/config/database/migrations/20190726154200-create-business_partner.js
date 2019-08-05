exports.up = (knex, Promise) => {
  return knex.schema.createTable('business_partner', (table) => {
    table.increments(),
    table.string('fantasy_name'),
    table.string('cnpj'),
    table.string('status'),
    table.date('foundation_date'),
    table.integer('id_customer').notNullable().unsigned(),
    table.timestamps(true, true),
    table.foreign('id_customer').references('customer.id')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTableIfExists('business_partner')
}